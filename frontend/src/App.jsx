import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import BottomNav from './components/layout/BottomNav';
import DashboardPage from './pages/DashboardPage';
import LatestPage from './pages/LatestPage';
import ImportantPage from './pages/ImportantPage';
import SwipePage from './pages/SwipePage';
import StoryDetailPage from './pages/StoryDetailPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ImpactRadarPage from './pages/ImpactRadarPage';
import SavedStoriesPage from './pages/SavedStoriesPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import { analyzeImpact, getProjects } from './services/api';
import { getLikedStoryIds, toggleLikeStory } from './services/recommendation';
import { Radar, Loader2, X, CheckCircle2 } from 'lucide-react';
import VoiceAssistantModal from './components/voice/VoiceAssistantModal';

function AppLayout() {
  const location = useLocation();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Voice Assistant state
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [voiceProjectId, setVoiceProjectId] = useState(null);
  const [voiceStoryId, setVoiceStoryId] = useState(null);

  const handleOpenVoice = (projId = null, storyId = null) => {
    setVoiceProjectId(projId);
    setVoiceStoryId(storyId);
    setIsVoiceOpen(true);
  };

  // Theme support
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('airadar_theme');
      return stored || 'dark';
    } catch (e) {
      return 'dark';
    }
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('airadar_theme', theme);
    } catch (e) {
      console.warn("Theme toggle failed:", e);
    }
  }, [theme]);

  const handleThemeToggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // LocalStorage saved stories state
  const [savedStoryIds, setSavedStoryIds] = useState(() => {
    try {
      const stored = localStorage.getItem('airadar_saved_stories');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // LocalStorage liked stories state
  const [likedStoryIds, setLikedStoryIds] = useState(() => getLikedStoryIds());

  useEffect(() => {
    try {
      localStorage.setItem('airadar_saved_stories', JSON.stringify(savedStoryIds));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [savedStoryIds]);

  const handleToggleSave = (story) => {
    setSavedStoryIds((prev) =>
      prev.includes(story.id)
        ? prev.filter((id) => id !== story.id)
        : [...prev, story.id]
    );
  };

  const handleToggleLike = (story) => {
    const updated = toggleLikeStory(story.id);
    setLikedStoryIds(updated);
  };

  // Quick Impact Analysis Modal State
  const [analysisModalStory, setAnalysisModalStory] = useState(null);
  const [projectsList, setProjectsList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleTriggerImpactAnalysis = async (story) => {
    setAnalysisModalStory(story);
    setAnalysisResult(null);
    try {
      const projects = await getProjects();
      setProjectsList(projects || []);
      if (projects && projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunModalAnalysis = async () => {
    if (!selectedProjectId || !analysisModalStory) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeImpact(selectedProjectId, analysisModalStory.id);
      setAnalysisResult(result);
    } catch (err) {
      alert(`Impact Analysis Error: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  // Derive header title & subtitle based on path
  const getHeaderMeta = (path) => {
    if (path.startsWith('/dashboard')) {
      return { title: 'Dashboard', subtitle: 'AI Intelligence Command Center' };
    }
    if (path.startsWith('/swipe')) {
      return { title: 'Swipe Reel', subtitle: 'Mobile swipe discovery feed' };
    }
    if (path.startsWith('/latest')) {
      return { title: 'Latest AI Updates', subtitle: 'Real-time intelligence feed' };
    }
    if (path.startsWith('/important')) {
      return { title: 'Important Updates', subtitle: 'Filtered feed for significance ≥ 7.0' };
    }
    if (path.startsWith('/saved')) {
      return { title: 'Saved Stories', subtitle: 'Bookmarked intelligence updates' };
    }
    if (path.startsWith('/projects/') && path.endsWith('/impact')) {
      return { title: 'Impact Radar', subtitle: 'Codebase impact cross-examination' };
    }
    if (path.startsWith('/projects/')) {
      return { title: 'Project Specification', subtitle: 'Codebase tech stack & impacts' };
    }
    if (path.startsWith('/projects')) {
      return { title: 'Projects', subtitle: 'Monitored codebases & AI stacks' };
    }
    if (path.startsWith('/impact-radar')) {
      return { title: 'Impact Radar', subtitle: 'Project impact assessment engine' };
    }
    if (path.startsWith('/stories/')) {
      return { title: 'Intelligence Briefing', subtitle: 'Detailed story overview & scores' };
    }
    if (path.startsWith('/settings')) {
      return { title: 'Settings', subtitle: 'System status & RSS collectors' };
    }
    return { title: 'AI RADAR', subtitle: 'Technology Intelligence Platform' };
  };

  const { title: pageTitle, subtitle: pageSubtitle } = getHeaderMeta(location.pathname);

  return (
    <div className="min-h-screen bg-[#05070E] text-slate-100 flex pb-16 lg:pb-0">
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Global Sticky Header */}
        <Header
          title={pageTitle}
          subtitle={pageSubtitle}
          onMenuClick={() => setIsMobileSidebarOpen(true)}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onVoiceClick={() => handleOpenVoice()}
          theme={theme}
          onThemeToggle={handleThemeToggle}
        />

        {/* Page Container */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <DashboardPage
                  savedStoryIds={savedStoryIds}
                  likedStoryIds={likedStoryIds}
                  onToggleSave={handleToggleSave}
                  onToggleLike={handleToggleLike}
                  onAnalyzeImpact={handleTriggerImpactAnalysis}
                />
              }
            />
            <Route
              path="/swipe"
              element={
                <SwipePage
                  savedStoryIds={savedStoryIds}
                  onToggleSave={handleToggleSave}
                  onAnalyzeImpact={handleTriggerImpactAnalysis}
                />
              }
            />
            <Route
              path="/latest"
              element={
                <LatestPage
                  savedStoryIds={savedStoryIds}
                  likedStoryIds={likedStoryIds}
                  onToggleSave={handleToggleSave}
                  onToggleLike={handleToggleLike}
                  onAnalyzeImpact={handleTriggerImpactAnalysis}
                />
              }
            />
            <Route
              path="/important"
              element={
                <ImportantPage
                  savedStoryIds={savedStoryIds}
                  likedStoryIds={likedStoryIds}
                  onToggleSave={handleToggleSave}
                  onToggleLike={handleToggleLike}
                  onAnalyzeImpact={handleTriggerImpactAnalysis}
                />
              }
            />
            <Route
              path="/saved"
              element={
                <SavedStoriesPage
                  savedStoryIds={savedStoryIds}
                  likedStoryIds={likedStoryIds}
                  onToggleSave={handleToggleSave}
                  onToggleLike={handleToggleLike}
                  onAnalyzeImpact={handleTriggerImpactAnalysis}
                />
              }
            />
            <Route
              path="/stories/:id"
              element={
                <StoryDetailPage
                  savedStoryIds={savedStoryIds}
                  onToggleSave={handleToggleSave}
                  onVoiceTrigger={(storyId) => handleOpenVoice(null, storyId)}
                />
              }
            />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route 
              path="/projects/:id" 
              element={
                <ProjectDetailPage 
                  onVoiceTrigger={(projId) => handleOpenVoice(projId, null)} 
                />
              } 
            />
            <Route path="/projects/:id/impact" element={<ImpactRadarPage />} />
            <Route path="/impact-radar" element={<ImpactRadarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Mobile Bottom Bar Navigation */}
      <BottomNav />

      {/* Global Impact Analysis Modal */}
      {analysisModalStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-white/10 bg-[#0A0E1A]/95 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Radar className="h-5 w-5 text-cyan-400" />
                Analyze Project Impact
              </h3>
              <button
                onClick={() => setAnalysisModalStory(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Story</span>
              <span className="text-xs font-semibold text-slate-200 line-clamp-2 mt-0.5">
                {analysisModalStory.title}
              </span>
            </div>

            {projectsList.length > 0 ? (
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Select Monitored Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-xs text-slate-100 focus:border-cyan-500 focus:outline-none"
                >
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900">
                      {p.name}
                    </option>
                  ))}
                </select>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setAnalysisModalStory(null)}
                    className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300"
                  >
                    Close
                  </button>

                  <button
                    onClick={handleRunModalAnalysis}
                    disabled={analyzing}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/20 hover:scale-105 cursor-pointer disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Analyzing with Gemini...</span>
                      </>
                    ) : (
                      <span>Evaluate Impact</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400">
                No projects registered yet. Please create a project under 'Projects' menu.
              </div>
            )}

            {/* Analysis Result Box */}
            {analysisResult && (
              <div className="mt-4 rounded-xl border border-emerald-500/30 bg-slate-900/90 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Result Ready
                  </span>
                  <span className="font-bold text-white">
                    Score: {analysisResult.impact_score}/10 ({analysisResult.impact_level})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400 block">Why it affects</span>
                  <p className="text-xs text-slate-300 mt-0.5">{analysisResult.reason}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block">Action</span>
                  <p className="text-xs text-emerald-200 mt-0.5">{analysisResult.recommended_action}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Global Voice Assistant Overlay */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        projectId={voiceProjectId}
        storyId={voiceStoryId}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
