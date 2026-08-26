import React, { useEffect, useState } from 'react';
import { getStories } from '../services/api';
import {
  getLikedStoryIds,
  toggleLikeStory,
  getUserInterests,
  saveUserInterests,
  getRecommendedStories,
} from '../services/recommendation';
import SwipeDeck from '../components/swipe/SwipeDeck';
import { Sparkles, SlidersHorizontal, Loader2, Check } from 'lucide-react';

export default function SwipePage({ savedStoryIds, onToggleSave, onAnalyzeImpact }) {
  const [stories, setStories] = useState([]);
  const [likedIds, setLikedIds] = useState(getLikedStoryIds());
  const [userInterests, setUserInterests] = useState(getUserInterests());
  const [loading, setLoading] = useState(true);
  const [showTopicsModal, setShowTopicsModal] = useState(false);

  const availableTopics = [
    'AI Agents',
    'LLMs',
    'Gemini',
    'OpenAI',
    'Python',
    'FastAPI',
    'Security',
    'Computer Vision',
    'Robotics',
    'RAG',
  ];

  const fetchAndScoreStories = async () => {
    setLoading(true);
    try {
      const rawStories = await getStories();
      const nonDuplicates = (rawStories || []).filter((s) => !s.is_duplicate);

      // Score stories using recommendation service
      const recommended = getRecommendedStories(nonDuplicates, likedIds, userInterests);
      setStories(recommended);
    } catch (err) {
      console.error('Swipe stories fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndScoreStories();
  }, [likedIds, userInterests]);

  const handleLike = (story) => {
    const updated = toggleLikeStory(story.id);
    setLikedIds(updated);
  };

  const handleToggleInterest = (topic) => {
    const updated = userInterests.includes(topic)
      ? userInterests.filter((t) => t !== topic)
      : [...userInterests, topic];

    setUserInterests(updated);
    saveUserInterests(updated);
  };

  return (
    <div className="space-y-4 pb-20 pt-2">
      {/* Header Banner */}
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cyan-400" />
            <span>AI Reel Swiper</span>
          </h2>
          <p className="text-xs text-slate-400">
            Swipe right to like, left to pass, up to analyze impact
          </p>
        </div>

        <button
          onClick={() => setShowTopicsModal(!showTopicsModal)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-cyan-300 hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Interests ({userInterests.length})</span>
        </button>
      </div>

      {/* User Interests Selector Modal */}
      {showTopicsModal && (
        <div className="glass-panel rounded-2xl p-4 border border-cyan-500/30 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Personalize Recommendation Interests
            </span>
            <button
              onClick={() => setShowTopicsModal(false)}
              className="text-xs font-bold text-slate-400 hover:text-white"
            >
              Done
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {availableTopics.map((topic) => {
              const selected = userInterests.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => handleToggleInterest(topic)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                      : 'bg-slate-900 border border-white/10 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {selected && <Check className="h-3 w-3 text-cyan-400" />}
                  <span>{topic}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Swipeable Deck */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
          <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
          <span className="text-xs font-medium text-slate-400">
            Curating personalized AI reel...
          </span>
        </div>
      ) : (
        <SwipeDeck
          stories={stories}
          onLike={handleLike}
          onPass={() => {}}
          onAnalyzeImpact={onAnalyzeImpact}
          onBookmark={(story) => onToggleSave && onToggleSave(story)}
          savedStoryIds={savedStoryIds}
        />
      )}
    </div>
  );
}
