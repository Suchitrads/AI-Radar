import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getStories } from '../services/api';
import { getRecommendedStories } from '../services/recommendation';
import StoryList from '../components/stories/StoryList';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, RefreshCw, Sparkles, Clock } from 'lucide-react';

export default function LatestPage({
  savedStoryIds,
  likedStoryIds = [],
  onToggleSave,
  onToggleLike,
  onAnalyzeImpact,
}) {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tab state: 'FOR_YOU' or 'ALL'
  const [feedMode, setFeedMode] = useState('FOR_YOU');

  // Filters state
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [minImportance, setMinImportance] = useState(0);
  const [onlyBreaking, setOnlyBreaking] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 12;

  const fetchLatestStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getStories();
      const nonDuplicates = (data || []).filter((s) => !s.is_duplicate);

      if (feedMode === 'FOR_YOU') {
        const recommended = getRecommendedStories(nonDuplicates, likedStoryIds);
        setStories(recommended);
      } else {
        setStories(nonDuplicates);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestStories();
  }, [feedMode, likedStoryIds]);

  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  const categories = ['ALL', ...new Set(stories.map((s) => s.category).filter(Boolean))];

  const filteredStories = stories.filter((story) => {
    if (onlyBreaking && !story.is_breaking) return false;

    if (minImportance > 0 && (story.importance_score || 0) < minImportance) {
      return false;
    }

    if (selectedCategory !== 'ALL' && story.category !== selectedCategory) {
      return false;
    }

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      const titleMatch = story.title?.toLowerCase().includes(query);
      const summaryMatch = story.summary?.toLowerCase().includes(query);
      const companyMatch = story.companies?.toLowerCase().includes(query);
      const techMatch = story.technologies?.toLowerCase().includes(query);
      const topicMatch = story.topics?.toLowerCase().includes(query);

      return titleMatch || summaryMatch || companyMatch || techMatch || topicMatch;
    }

    return true;
  });

  const totalPages = Math.ceil(filteredStories.length / ITEMS_PER_PAGE) || 1;
  const paginatedStories = filteredStories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100">
            Latest AI Intelligence Feed
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time intelligence feed with personalized recommendations & filters
          </p>
        </div>

        {/* Feed Mode Toggle Tabs */}
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 p-1.5 self-start md:self-auto">
          <button
            onClick={() => {
              setFeedMode('FOR_YOU');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              feedMode === 'FOR_YOU'
                ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>For You</span>
          </button>

          <button
            onClick={() => {
              setFeedMode('ALL');
              setCurrentPage(1);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
              feedMode === 'ALL'
                ? 'bg-white/15 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>All Chronological</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400">
            <SlidersHorizontal className="h-4 w-4" />
            <span>Filters & Search</span>
          </div>

          <span className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredStories.length}</strong> updates
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search feed..."
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900 text-slate-200">
                  {cat === 'ALL' ? 'All AI Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 whitespace-nowrap">Min Imp:</span>
            <select
              value={minImportance}
              onChange={(e) => {
                setMinImportance(parseFloat(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 py-2 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
            >
              <option value={0} className="bg-slate-900">Any Importance</option>
              <option value={5.0} className="bg-slate-900">5.0+ (Moderate)</option>
              <option value={7.0} className="bg-slate-900">7.0+ (High)</option>
              <option value={8.5} className="bg-slate-900">8.5+ (Critical)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-300">
              <input
                type="checkbox"
                checked={onlyBreaking}
                onChange={(e) => {
                  setOnlyBreaking(e.target.checked);
                  setCurrentPage(1);
                }}
                className="h-4 w-4 rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
              />
              <span>Breaking News Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Story Feed Grid */}
      <StoryList
        stories={paginatedStories}
        loading={loading}
        error={error}
        onRetry={fetchLatestStories}
        savedStoryIds={savedStoryIds}
        likedStoryIds={likedStoryIds}
        onToggleSave={onToggleSave}
        onToggleLike={onToggleLike}
        onAnalyzeImpact={onAnalyzeImpact}
      />

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          <span className="text-xs text-slate-400">
            Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="px-3 text-xs font-semibold text-slate-200">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
