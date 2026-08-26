import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStory, getProjects, analyzeImpact } from '../services/api';
import CategoryBadge from '../components/common/CategoryBadge';
import ScoreBadge from '../components/common/ScoreBadge';
import {
  ExternalLink,
  Flame,
  ArrowLeft,
  Sparkles,
  Building2,
  Cpu,
  Tag,
  Radar,
  Loader2,
  CheckCircle2,
  Calendar,
  User,
  Volume2,
} from 'lucide-react';

export default function StoryDetailPage({ savedStoryIds, onToggleSave, onVoiceTrigger }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  const fetchStoryDetail = async () => {
    setLoading(true);
    setError(null);
    try {
      const [storyData, projectsData] = await Promise.all([
        getStory(id),
        getProjects(),
      ]);

      setStory(storyData);
      setProjects(projectsData || []);
      if (projectsData && projectsData.length > 0) {
        setSelectedProjectId(projectsData[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load story details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoryDetail();
  }, [id]);

  const handleRunAnalysis = async () => {
    if (!selectedProjectId) return;
    setAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await analyzeImpact(selectedProjectId, story.id);
      setAnalysisResult(result);
    } catch (err) {
      alert(`Impact analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <span className="text-sm font-medium text-slate-400">Loading AI intelligence...</span>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="py-12">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <p className="text-sm text-red-400 font-semibold">{error || 'Story not found'}</p>
          <button
            onClick={() => navigate('/latest')}
            className="mt-4 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Back to Feed
          </button>
        </div>
      </div>
    );
  }

  const {
    title,
    summary,
    why_it_matters,
    raw_content,
    clean_content,
    category,
    sub_category,
    companies,
    technologies,
    topics,
    importance_score,
    novelty_score,
    technical_score,
    is_breaking,
    published_at,
    url,
    author,
  } = story;

  const parseTags = (str) =>
    str
      ? str
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const companyList = parseTags(companies);
  const techList = parseTags(technologies);
  const topicList = parseTags(topics);

  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Previous View</span>
      </button>

      {/* Main Reading Header */}
      <div className="space-y-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <CategoryBadge category={category} subCategory={sub_category} />

          {is_breaking && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-0.5 text-xs font-bold text-red-400">
              <Flame className="h-3.5 w-3.5 fill-red-500" />
              BREAKING
            </span>
          )}

          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" /> {formattedDate}
          </span>

          {author && (
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> {author}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-100 leading-tight tracking-tight">
          {title}
        </h1>

        {/* Scores & Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ScoreBadge label="Importance" score={importance_score} />
            <ScoreBadge label="Novelty" score={novelty_score} />
            <ScoreBadge label="Technical" score={technical_score} />
            <button
              onClick={() => onVoiceTrigger && onVoiceTrigger(id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 px-4.5 py-2 text-xs font-bold text-blue-300 hover:bg-blue-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Explain this story"
              aria-label="Explain this story"
            >
              <Volume2 className="h-4 w-4" />
              <span>Explain this story</span>
            </button>
          </div>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all"
          >
            <span>Original Source</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Summary Box */}
      {summary && (
        <div className="glass-card rounded-2xl p-6 border border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
            Executive Summary
          </h3>
          <p className="text-sm md:text-base text-slate-200 leading-relaxed">
            {summary}
          </p>
        </div>
      )}

      {/* WHY IT MATTERS Box */}
      {why_it_matters && (
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 p-6 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <span>WHY IT MATTERS</span>
          </div>
          <p className="text-sm md:text-base text-indigo-100/90 leading-relaxed font-medium">
            {why_it_matters}
          </p>
        </div>
      )}

      {/* Content / Technical Breakdown */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Detailed Analysis & Context
        </h3>
        <div className="prose prose-invert max-w-none text-xs md:text-sm text-slate-300 leading-relaxed space-y-3">
          {(clean_content || raw_content || '').split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Entities & Topics
        </h3>

        <div className="space-y-3">
          {companyList.length > 0 && (
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase mb-1.5">
                Companies / Organizations
              </span>
              <div className="flex flex-wrap gap-2">
                {companyList.map((comp, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-1 text-xs font-semibold text-slate-200"
                  >
                    <Building2 className="h-3.5 w-3.5 text-blue-400" />
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {techList.length > 0 && (
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase mb-1.5">
                Technologies
              </span>
              <div className="flex flex-wrap gap-2">
                {techList.map((tech, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300"
                  >
                    <Cpu className="h-3.5 w-3.5 text-blue-400" />
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {topicList.length > 0 && (
            <div>
              <span className="block text-[11px] font-medium text-slate-500 uppercase mb-1.5">
                Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {topicList.map((topic, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300"
                  >
                    <Tag className="h-3.5 w-3.5 text-purple-400" />
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Project Impact Trigger Card */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 p-6 md:p-8 backdrop-blur-xl space-y-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Radar className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Evaluate Impact on Your Project
            </h3>
            <p className="text-xs text-slate-400">
              Run Gemini AI cross-analysis against your codebase stack & topics
            </p>
          </div>
        </div>

        {projects.length > 0 ? (
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full sm:w-auto flex-1 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name} ({p.ai_stack || 'Standard'})
                </option>
              ))}
            </select>

            <button
              onClick={handleRunAnalysis}
              disabled={analyzing}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-violet-500 transition-all cursor-pointer disabled:opacity-50"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Analyzing Project Impact...</span>
                </>
              ) : (
                <>
                  <Radar className="h-4 w-4" />
                  <span>Analyze Impact</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400">
            No projects registered. Create a project first to analyze impact.
          </div>
        )}

        {/* Real-time Analysis Result Card */}
        {analysisResult && (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-slate-900/90 p-5 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                Analysis Complete
              </span>
              <span className="text-xs font-semibold text-slate-300">
                Score: <strong className="text-white">{analysisResult.impact_score}/10</strong> ({analysisResult.impact_level})
              </span>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-amber-400 uppercase">Reason</span>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{analysisResult.reason}</p>
            </div>

            <div>
              <span className="block text-[11px] font-bold text-emerald-400 uppercase">Recommended Action</span>
              <p className="text-xs text-emerald-200 mt-0.5 leading-relaxed">{analysisResult.recommended_action}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
