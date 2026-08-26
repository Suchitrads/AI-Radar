import logging
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import Optional, Any
from google import genai
from google.genai import types
from pydantic import BaseModel

from app.core.config import settings
from app.services.ai.classifier import get_client
from app.models.story import Story
from app.models.project import Project
from app.models.impact import ImpactAnalysis
from app.services.ai.impact_service import analyze_story_for_project

logger = logging.getLogger("ai_radar.voice")

class VoiceIntentAnalysis(BaseModel):
    intent: str
    project_name: Optional[str] = None
    search_query: Optional[str] = None
    navigation_target: Optional[str] = None

INTENT_CLASSIFICATION_INSTRUCTION = """
You are an AI natural language intent analyzer for the "AI RADAR" system.

Analyze the user's voice or text query and map it to one of the following intents:
1. news_summary: User wants a summary of the most important AI updates today.
   Examples: "What are today's most important AI updates?", "Give me the top five AI stories."
2. latest_news: User wants to see or hear the latest AI news/updates.
   Examples: "Show the latest AI updates", "What's new in AI today?"
3. important_news: User wants to see important updates.
   Examples: "What happened in AI security today?", "Show me important stories", "Is there any breaking news?"
4. story_explanation: User asks to explain a story, context, or what they should do about an update.
   Examples: "Explain this story in simple terms", "Why does this matter?", "What should I do about this update?"
5. project_impact: User asks if news affects their project, or which updates have highest impact.
   Examples: "Does today's AI news affect my project?", "What AI updates affect my AI Security Platform?", "Which updates have the highest impact on my project?"
6. project_summary: User asks what to be concerned about in a specific project.
   Examples: "What should I be concerned about?", "Give me a summary of issues for my project."
7. project_list: User wants to see their projects.
   Examples: "Show my projects", "What projects do I have?"
8. impact_summary: User wants to open the Impact Radar or see overall impact.
   Examples: "Open Impact Radar", "Show me the impact summaries."
9. search: User is searching for specific topics, technologies, or keywords.
   Examples: "Search for agent developments", "Show me Gemini stories", "Search security updates."
10. navigation: User wants to navigate to a specific page or dashboard in the UI.
    Examples: "Go to settings", "Open my saved stories", "Show dashboard."

Extract:
- project_name: If the query mentions a specific project (e.g. "AI Security Platform", "My security dashboard"), capture it. Otherwise null.
- search_query: If the intent is 'search', extract the search term/keywords. Otherwise null.
- navigation_target: If the intent is 'navigation' or 'news_summary'/'latest_news'/'important_news'/'project_list'/'impact_summary', map to:
  - 'dashboard'
  - 'latest'
  - 'important'
  - 'projects'
  - 'impact-radar'
  - 'saved'
  - 'settings'
  Otherwise null.

Return only the JSON matching the schema.
"""

def analyze_query_intent(query: str) -> VoiceIntentAnalysis:
    client = get_client()
    model = settings.gemini_classifier_model
    if not model:
        raise RuntimeError("GEMINI_CLASSIFIER_MODEL is not configured.")

    prompt = f"""
{INTENT_CLASSIFICATION_INSTRUCTION}

USER QUERY:
{query}
"""
    response = client.models.generate_content(
        model=model,
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=VoiceIntentAnalysis,
        ),
    )

    if response.parsed:
        return response.parsed

    if not response.text:
        raise RuntimeError("Gemini returned an empty intent classification.")

    return VoiceIntentAnalysis.model_validate_json(response.text)

def process_voice_query(
    db: Session,
    query: str,
    project_id: Optional[int] = None,
    story_id: Optional[int] = None,
) -> dict[str, Any]:
    # 1. Analyze user intent
    try:
        analysis = analyze_query_intent(query)
    except Exception as e:
        logger.exception("Failed to analyze intent with Gemini")
        # Simple local keyword fallback if Gemini fails to analyze intent
        intent = "news_summary"
        if "project" in query.lower() or "affect" in query.lower():
            intent = "project_impact"
        elif "explain" in query.lower() or "why does this matter" in query.lower():
            intent = "story_explanation"
        elif "navigate" in query.lower() or "go to" in query.lower() or "open" in query.lower():
            intent = "navigation"
        analysis = VoiceIntentAnalysis(intent=intent)

    logger.info(f"Parsed intent: {analysis.intent} for query: {query}")

    client = get_client()
    model = settings.gemini_summary_model or settings.gemini_classifier_model

    answer = "I'm not sure how to answer that request."
    data = {}

    # 2. Process based on intent
    if analysis.intent == "navigation":
        target = analysis.navigation_target or "dashboard"
        route_map = {
            "dashboard": "/dashboard",
            "latest": "/latest",
            "important": "/important",
            "projects": "/projects",
            "impact-radar": "/impact-radar",
            "saved": "/saved",
            "settings": "/settings"
        }
        route = route_map.get(target.lower(), "/dashboard")
        answer = f"Navigating to {target}."
        data = {"navigation_route": route}

    elif analysis.intent in ("news_summary", "latest_news", "important_news"):
        # Fetch non-duplicate stories
        story_query = db.query(Story).filter(Story.is_duplicate.is_(False))
        if analysis.intent == "important_news":
            story_query = story_query.filter(Story.importance_score >= settings.min_importance_for_summary)
        
        stories = story_query.order_by(Story.published_at.desc(), Story.created_at.desc()).limit(5).all()
        
        if stories:
            stories_context = "\n\n".join([
                f"STORY ID: {s.id}\nTITLE: {s.title}\nSUMMARY: {s.summary or s.clean_content[:300]}"
                for s in stories
            ])
            prompt = f"""
You are a voice assistant called AI RADAR Voice.
Summarize the following AI news updates in a highly engaging, concise, and conversational speech format suitable for reading aloud.
Keep it under 120 words. Focus on the most important updates.

STORIES:
{stories_context}
"""
            response = client.models.generate_content(model=model, contents=prompt)
            answer = response.text or "Here are the latest updates."
            data = {
                "stories": [{"id": s.id, "title": s.title} for s in stories],
                "navigation_route": "/important" if analysis.intent == "important_news" else "/latest"
            }
        else:
            answer = "I couldn't find any recent AI stories in the database."

    elif analysis.intent == "story_explanation":
        story = None
        if story_id:
            story = db.query(Story).filter(Story.id == story_id).first()
        if not story:
            # Try to search or find latest story
            story = db.query(Story).filter(Story.is_duplicate.is_(False)).order_by(Story.published_at.desc(), Story.created_at.desc()).first()

        if story:
            prompt = f"""
You are a voice assistant called AI RADAR Voice.
Explain this story and why it matters in a simple, conversational format suitable for reading aloud.
Explain the technical terms in simple language. Keep it under 100 words.

STORY TITLE: {story.title}
SUMMARY: {story.summary or ""}
WHY IT MATTERS: {story.why_it_matters or ""}
CONTENT DETAILS: {(story.clean_content or story.raw_content or "")[:1500]}
"""
            response = client.models.generate_content(model=model, contents=prompt)
            answer = response.text or "Here is the explanation for this story."
            data = {"story_id": story.id, "story_title": story.title}
        else:
            answer = "I couldn't find the story you wanted me to explain."

    elif analysis.intent in ("project_impact", "project_summary"):
        project = None
        if project_id:
            project = db.query(Project).filter(Project.id == project_id).first()
        
        if not project and analysis.project_name:
            project = db.query(Project).filter(Project.name.like(f"%{analysis.project_name}%")).first()
        
        if not project:
            # Fallback to the first available project
            project = db.query(Project).order_by(Project.created_at.desc()).first()

        if project:
            # Check impact analyses
            analyses = db.query(ImpactAnalysis).filter(
                ImpactAnalysis.project_id == project.id
            ).order_by(ImpactAnalysis.impact_score.desc()).all()

            # Dynamic on-the-fly evaluation if no analyses exist
            if not analyses:
                recent_stories = db.query(Story).filter(
                    Story.is_duplicate.is_(False),
                    Story.importance_score >= settings.min_importance_for_summary
                ).order_by(Story.published_at.desc()).limit(3).all()
                
                for s in recent_stories:
                    try:
                        analyze_story_for_project(db, project, s)
                    except Exception as ex:
                        logger.warning(f"On-the-fly impact evaluation failed for story {s.id}: {ex}")
                
                analyses = db.query(ImpactAnalysis).filter(
                    ImpactAnalysis.project_id == project.id
                ).order_by(ImpactAnalysis.impact_score.desc()).all()

            if analyses:
                impacts_context = "\n\n".join([
                    f"STORY: {a.story.title}\nIMPACT SCORE: {a.impact_score}/10 ({a.impact_level})\nAFFECTED TECH: {a.affected_technologies or 'None'}\nREASON: {a.reason}\nRECOMMENDED ACTION: {a.recommended_action}"
                    for a in analyses[:3]
                ])

                prompt = f"""
You are a voice assistant called AI RADAR Voice.
Summarize the AI news impact on the user's project '{project.name}' in a conversational, voice-friendly response.
monitored technologies: {", ".join([t.technology for t in project.technologies])}

Report high-impact updates, what the main concerns are, and what action you recommend. Keep it under 130 words.

IMPACT ANALYSES:
{impacts_context}
"""
                response = client.models.generate_content(model=model, contents=prompt)
                answer = response.text or f"I found {len(analyses)} updates affecting {project.name}."
                data = {
                    "project_id": project.id,
                    "project_name": project.name,
                    "impact_count": len(analyses),
                    "stories": [{"id": a.story.id, "title": a.story.title, "impact_score": a.impact_score} for a in analyses[:3]],
                    "navigation_route": f"/projects/{project.id}/impact"
                }
            else:
                answer = f"I didn't find any significant AI updates impacting your project '{project.name}'."
                data = {
                    "project_id": project.id,
                    "project_name": project.name,
                    "impact_count": 0,
                    "navigation_route": f"/projects/{project.id}"
                }
        else:
            answer = "You haven't registered any projects in AI RADAR. Please create a project first so I can analyze technology impacts."
            data = {"navigation_route": "/projects"}

    elif analysis.intent == "project_list":
        projects = db.query(Project).all()
        if projects:
            projects_context = "\n".join([
                f"- {p.name}: monitors tech stack ({', '.join([t.technology for t in p.technologies])})"
                for p in projects
            ])
            prompt = f"""
You are a voice assistant called AI RADAR Voice.
Summarize the user's monitored projects and their monitored stacks in a conversational voice response.
Keep it under 90 words.

PROJECTS:
{projects_context}
"""
            response = client.models.generate_content(model=model, contents=prompt)
            answer = response.text or "Here are your registered projects."
            data = {
                "projects": [{"id": p.id, "name": p.name} for p in projects],
                "navigation_route": "/projects"
            }
        else:
            answer = "You don't have any projects registered yet. Go to the projects page to add one."
            data = {"navigation_route": "/projects"}

    elif analysis.intent == "impact_summary":
        projects = db.query(Project).all()
        if projects:
            summary_parts = []
            for p in projects:
                highest_impact = db.query(ImpactAnalysis).filter(
                    ImpactAnalysis.project_id == p.id
                ).order_by(ImpactAnalysis.impact_score.desc()).first()
                if highest_impact:
                    summary_parts.append(f"Project '{p.name}' highest impact: {highest_impact.impact_score}/10 regarding '{highest_impact.story.title}'")
                else:
                    summary_parts.append(f"Project '{p.name}' has no evaluated impacts.")
            
            prompt = f"""
You are a voice assistant called AI RADAR Voice.
Summarize the general impact status across all monitored codebases in a conversational, voice-friendly response.
Keep it under 100 words.

STATUS DETAILS:
{"\n".join(summary_parts)}
"""
            response = client.models.generate_content(model=model, contents=prompt)
            answer = response.text or "Here is the overall Impact Radar summary."
            data = {"navigation_route": "/impact-radar"}
        else:
            answer = "You don't have any projects registered. Please add a project to see the Impact Radar."
            data = {"navigation_route": "/projects"}

    elif analysis.intent == "search":
        search_term = analysis.search_query or query
        stories = db.query(Story).filter(
            Story.is_duplicate.is_(False),
            or_(
                Story.title.like(f"%{search_term}%"),
                Story.summary.like(f"%{search_term}%"),
                Story.technologies.like(f"%{search_term}%"),
                Story.topics.like(f"%{search_term}%")
            )
        ).order_by(Story.published_at.desc(), Story.created_at.desc()).limit(5).all()

        if stories:
            stories_context = "\n".join([f"- {s.title}: {s.summary or ''}" for s in stories])
            prompt = f"""
You are a voice assistant called AI RADAR Voice.
Summarize these search results for query '{search_term}' in a voice-friendly conversational reply.
Keep it under 110 words.

STORIES FOUND:
{stories_context}
"""
            response = client.models.generate_content(model=model, contents=prompt)
            answer = response.text or f"I found {len(stories)} stories matching '{search_term}'."
            data = {
                "stories": [{"id": s.id, "title": s.title} for s in stories],
                "search_term": search_term
            }
        else:
            answer = f"I couldn't find any AI updates in our database matching '{search_term}'."

    return {
        "query": query,
        "intent": analysis.intent,
        "answer": answer.strip(),
        "data": data
    }
