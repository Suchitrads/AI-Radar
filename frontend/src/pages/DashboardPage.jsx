import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStories, getProjects, getProjectImpact } from '../services/api';
import { getRecommendedStories } from '../services/recommendation';
import StoryList from '../components/stories/StoryList';
import {
  Sparkles,
  Zap,
  Flame,
  FolderGit2,
  Radar,
  ArrowRight,
  TrendingUp,
  Activity,
  Heart,
} from 'lucide-react';

export default function DashboardPage({
  savedStoryIds,
  likedStoryIds = [],
  onToggleSave,
  onToggleLike,
  onAnalyzeImpact,
}) {
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [projects, setProjects] = useState([]);
  const [impacts, setImpacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [storiesData, projectsData] = await Promise.all([
        getStories(),
        getProjects(),
      ]);

      const rawStories = storiesData || [];
      setProjects(projectsData || []);

      if (projectsData && projectsData.length > 0) {
        try {
          const impactRes = await getProjectImpact(projectsData[0].id);
          setImpacts(impactRes?.impacts || []);
        } catch (e) {
          console.warn('Impact fetch warning:', e);
        }
      }

      // Calculate recommendations
      const recommended = getRecommendedStories(rawStories, likedStoryIds);
      setStories(recommended);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [likedStoryIds]);

  const currentHour = new Date().getHours();
  let greeting = 'Good evening';
  if (currentHour < 12) greeting = 'Good morning';
  else if (currentHour < 18) greeting = 'Good afternoon';

  const totalStories = stories.length;
  const breakingStories = stories.filter((s) => s.is_breaking);
  const importantStories = stories.filter((s) => (s.importance_score || 0) >= 7.0);
  const totalProjects = projects.length;
  const highImpacts = impacts.filter(
    (i) => i.impact_level?.toUpperCase() === 'HIGH' || i.impact_level?.toUpperCase() === 'CRITICAL' || i.impact_score >= 7.0
  );

  // Recommended feed stories
  const topRecommended = stories.slice(0, 12);

  return (
    <div className="space-y-8 pb-20">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-slate-950 via-[#0A0E1A] to-slate-950 p-6 md:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-500/5">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 -mb-12 h-48 w-48 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>{greeting}</span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              AI Intelligence Dashboard
            </h2>

            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              Understand what changed in AI — and what matters to your projects. Real-time RSS intelligence & Gemini impact scoring.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/swipe')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-violet-600 to-rose-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-all cursor-pointer glow-cyan"
              >
                <Flame className="h-4 w-4 fill-white" />
                <span>Open Swipe Reel</span>
              </button>

              <button
                onClick={() => navigate('/impact-radar')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <Radar className="h-4 w-4 text-cyan-400" />
                <span>Impact Radar</span>
              </button>
            </div>
          </div>

          {/* Swipe Reel Mobile Teaser */}
          <div
            onClick={() => navigate('/swipe')}
            className="hidden lg:flex flex-col items-center justify-center rounded-2xl border border-cyan-500/30 bg-slate-900/60 p-5 backdrop-blur-md cursor-pointer hover:border-cyan-400 transition-all group max-w-xs"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 text-white mb-2 group-hover:scale-110 transition-transform">
              <Flame className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold text-slate-100">Try Swipe Discovery</span>
            <span className="text-[11px] text-slate-400 text-center mt-1">
              Swipe right to like, left to pass, up for impact
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">AI Updates</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-slate-100">
              {loading ? '...' : totalStories.toLocaleString()}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Scanned from live sources</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Important</span>
            <Zap className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-amber-300">
              {loading ? '...' : importantStories.length}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">High significance (&ge;7.0)</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Breaking</span>
            <Flame className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-400">
              {loading ? '...' : breakingStories.length}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Urgent industry updates</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
            <FolderGit2 className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-violet-300">
              {loading ? '...' : totalProjects}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Monitored codebases</span>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium uppercase tracking-wider">Liked Items</span>
            <Heart className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-300">
              {likedStoryIds.length}
            </span>
            <span className="block text-[11px] text-slate-400 mt-0.5">Personal interest profile</span>
          </div>
        </div>
      </div>

      {/* Recommended Intelligence Feed Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-100 flex items-center gap-2">
              <span>For You — Recommended Intelligence</span>
              <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
                Personalized
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ranked by your liked items, interest profile, and backend AI significance
            </p>
          </div>

          <button
            onClick={() => navigate('/latest')}
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <StoryList
          stories={topRecommended}
          loading={loading}
          error={error}
          onRetry={fetchDashboardData}
          savedStoryIds={savedStoryIds}
          likedStoryIds={likedStoryIds}
          onToggleSave={onToggleSave}
          onToggleLike={onToggleLike}
          onAnalyzeImpact={onAnalyzeImpact}
        />
      </div>
    </div>
  );
}
