import React, { useEffect, useState } from 'react';
import { getStories } from '../services/api';
import StoryList from '../components/stories/StoryList';
import { Zap, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';

export default function ImportantPage({ savedStoryIds, onToggleSave, onAnalyzeImpact }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchImportantStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStories();
      // Filter importance_score >= 7.0 and sort DESC
      const filtered = (data || [])
        .filter((s) => !s.is_duplicate && (s.importance_score || 0) >= 7.0)
        .sort((a, b) => (b.importance_score || 0) - (a.importance_score || 0));

      setStories(filtered);
    } catch (err) {
      setError(err.message || 'Failed to fetch important stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImportantStories();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-amber-500/5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/10 text-amber-400">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                CRITICAL INTELLIGENCE
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-0.5">
              High Significance AI Updates
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Curated feed of developments with Importance Score &ge; 7.0. Ranked strictly by strategic industry impact.
            </p>
          </div>
        </div>
      </div>

      {/* Story List */}
      <StoryList
        stories={stories}
        loading={loading}
        error={error}
        onRetry={fetchImportantStories}
        savedStoryIds={savedStoryIds}
        onToggleSave={onToggleSave}
        onAnalyzeImpact={onAnalyzeImpact}
        emptyTitle="No high-importance AI updates found"
        emptyDescription="No stories currently meet the &ge;7.0 importance threshold."
      />
    </div>
  );
}
