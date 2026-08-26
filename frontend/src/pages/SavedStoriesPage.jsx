import React, { useEffect, useState } from 'react';
import { getStories } from '../services/api';
import StoryList from '../components/stories/StoryList';
import { Bookmark } from 'lucide-react';

export default function SavedStoriesPage({ savedStoryIds, onToggleSave, onAnalyzeImpact }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSavedStories = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!savedStoryIds || savedStoryIds.length === 0) {
        setStories([]);
        setLoading(false);
        return;
      }

      const data = await getStories();
      const saved = (data || []).filter((s) => savedStoryIds.includes(s.id));
      setStories(saved);
    } catch (err) {
      setError(err.message || 'Failed to fetch saved stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedStories();
  }, [savedStoryIds]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-blue-950/30 to-slate-900 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-500/10 text-blue-400">
            <Bookmark className="h-6 w-6 fill-blue-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">
              Saved Intelligence & Bookmarks
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Quick reference collection stored locally in your command center
            </p>
          </div>
        </div>
      </div>

      <StoryList
        stories={stories}
        loading={loading}
        error={error}
        onRetry={fetchSavedStories}
        savedStoryIds={savedStoryIds}
        onToggleSave={onToggleSave}
        onAnalyzeImpact={onAnalyzeImpact}
        emptyTitle="No saved stories"
        emptyDescription="Bookmark important stories from the feed to save them here for quick retrieval."
      />
    </div>
  );
}
