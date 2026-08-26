/**
 * Recommendation Engine Service for AI RADAR
 * Calculates personalized match scores (%) based on user likes and interests
 */

const LIKES_KEY = 'airadar_liked_stories';
const INTERESTS_KEY = 'airadar_user_interests';

export const getLikedStoryIds = () => {
  try {
    const stored = localStorage.getItem(LIKES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const toggleLikeStory = (storyId) => {
  const current = getLikedStoryIds();
  const exists = current.includes(storyId);
  const updated = exists ? current.filter((id) => id !== storyId) : [...current, storyId];
  try {
    localStorage.setItem(LIKES_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save liked story:', e);
  }
  return updated;
};

export const getUserInterests = () => {
  try {
    const stored = localStorage.getItem(INTERESTS_KEY);
    return stored ? JSON.parse(stored) : ['AI Agents', 'LLMs', 'Gemini', 'Python', 'Security'];
  } catch (e) {
    return ['AI Agents', 'LLMs', 'Gemini', 'Python', 'Security'];
  }
};

export const saveUserInterests = (interestsArray) => {
  try {
    localStorage.setItem(INTERESTS_KEY, JSON.stringify(interestsArray));
  } catch (e) {
    console.warn('Failed to save interests:', e);
  }
};

const parseCommaTags = (str) =>
  str
    ? str
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    : [];

/**
 * Calculates match percentage (0 - 99%) for a story relative to liked stories and user preferences
 */
export const calculateMatchScore = (story, likedStories = [], userInterests = []) => {
  if (!story) return 70;

  let score = 50; // Base baseline score

  const storyCategories = story.category ? [story.category.toLowerCase()] : [];
  const storyTechs = parseCommaTags(story.technologies);
  const storyTopics = parseCommaTags(story.topics);
  const storyCompanies = parseCommaTags(story.companies);

  const interestLower = (userInterests || []).map((i) => i.toLowerCase());

  // Interest tags match (+10 per match)
  let interestMatches = 0;
  [...storyTechs, ...storyTopics, ...storyCategories].forEach((tag) => {
    if (interestLower.includes(tag)) {
      interestMatches += 1;
    }
  });
  score += Math.min(interestMatches * 8, 25);

  // Liked stories profile matching
  if (likedStories.length > 0) {
    let likedTagMatches = 0;
    likedStories.forEach((liked) => {
      const likedTechs = parseCommaTags(liked.technologies);
      const likedTopics = parseCommaTags(liked.topics);
      
      storyTechs.forEach((t) => {
        if (likedTechs.includes(t)) likedTagMatches += 1;
      });
      storyTopics.forEach((t) => {
        if (likedTopics.includes(t)) likedTagMatches += 1;
      });
      if (story.category && liked.category && story.category.toLowerCase() === liked.category.toLowerCase()) {
        likedTagMatches += 2;
      }
    });

    score += Math.min(likedTagMatches * 5, 20);
  }

  // Quality boost from backend AI evaluation
  if (story.importance_score) {
    score += Math.min(story.importance_score * 1.5, 15);
  }
  if (story.novelty_score) {
    score += Math.min(story.novelty_score * 1.0, 10);
  }

  // Cap score between 60% and 99% for real-feeling recommendation fidelity
  const finalScore = Math.min(Math.max(Math.round(score), 62), 99);
  return finalScore;
};

/**
 * Returns stories enriched with matchScore and sorted by relevance
 */
export const getRecommendedStories = (stories = [], likedStoryIds = [], userInterests = []) => {
  const likedObjects = stories.filter((s) => likedStoryIds.includes(s.id));

  const scoredStories = stories.map((story) => {
    const matchScore = calculateMatchScore(story, likedObjects, userInterests);
    return { ...story, matchScore };
  });

  return scoredStories.sort((a, b) => b.matchScore - a.matchScore);
};
