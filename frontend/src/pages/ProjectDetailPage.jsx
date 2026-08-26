import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, getProjectImpact, getStories, analyzeImpact } from '../services/api';
import ImpactRadar from '../components/impact/ImpactRadar';
import {
  FolderGit2,
  ArrowLeft,
  Cpu,
  Layers,
  Server,
  Database as DbIcon,
  Globe,
  Tag,
  Radar,
  Loader2,
  Plus,
  Mic,
} from 'lucide-react';

export default function ProjectDetailPage({ onVoiceTrigger }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [impacts, setImpacts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analysis modal state
  const [showStorySelector, setShowStorySelector] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const fetchProjectDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projData, impactRes, storiesData] = await Promise.all([
        getProject(id),
        getProjectImpact(id),
        getStories(),
      ]);

      setProject(projData);
      setImpacts(impactRes?.impacts || []);
      setStories(storiesData || []);
      if (storiesData && storiesData.length > 0) {
        setSelectedStoryId(storiesData[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [id]);

  const handleRunStoryAnalysis = async () => {
    if (!selectedStoryId) return;
    setAnalyzing(true);
    try {
      await analyzeImpact(id, selectedStoryId);
      setShowStorySelector(false);
      await fetchProjectDetails();
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-sm font-medium text-slate-400">Loading project details & impact radar...</span>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="py-12">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <p className="text-sm text-red-400 font-semibold">{error || 'Project not found'}</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const {
    name,
    description,
    frontend,
    backend,
    database,
    infrastructure,
    ai_stack,
    technologies = [],
    topics = [],
  } = project;

  const techNames = Array.isArray(technologies)
    ? technologies.map((t) => (typeof t === 'string' ? t : t.technology))
    : [];

  const topicNames = Array.isArray(topics)
    ? topics.map((t) => (typeof t === 'string' ? t : t.topic))
    : [];

  return (
    <div className="space-y-8 pb-16">
      {/* Back Button */}
      <button
        onClick={() => navigate('/projects')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Projects Overview</span>
      </button>

      {/* Project Overview Card */}
      <div className="rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-950 p-6 md:p-8 backdrop-blur-xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-indigo-500/40 bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="h-7 w-7" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  PROJECT SPECIFICATION
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
                {name}
              </h1>
              {description && (
                <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 self-start md:self-auto">
            <button
              onClick={() => onVoiceTrigger && onVoiceTrigger(id)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-5 py-2.5 text-xs font-bold text-violet-300 shadow-lg shadow-violet-500/10 hover:bg-violet-500/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Ask AI RADAR about this project"
              aria-label="Ask AI RADAR about this project"
            >
              <Mic className="h-4 w-4" />
              <span>Ask AI RADAR</span>
            </button>

            <button
              onClick={() => setShowStorySelector(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-violet-500 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Radar className="h-4 w-4" />
              <span>Analyze New Story Impact</span>
            </button>
          </div>
        </div>

        {/* Tech Specs Grid */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-white/10 text-xs">
          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Globe className="h-3 w-3 text-blue-400" /> Frontend
            </span>
            <span className="font-semibold text-slate-200 mt-1 block truncate">
              {frontend || 'Not specified'}
            </span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Server className="h-3 w-3 text-indigo-400" /> Backend
            </span>
            <span className="font-semibold text-slate-200 mt-1 block truncate">
              {backend || 'Not specified'}
            </span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <DbIcon className="h-3 w-3 text-purple-400" /> Database
            </span>
            <span className="font-semibold text-slate-200 mt-1 block truncate">
              {database || 'Not specified'}
            </span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 p-3">
            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
              <Cpu className="h-3 w-3 text-emerald-400" /> AI Stack
            </span>
            <span className="font-semibold text-emerald-300 mt-1 block truncate">
              {ai_stack || 'Standard'}
            </span>
          </div>
        </div>

        {/* Technologies & Topics Tags */}
        {(techNames.length > 0 || topicNames.length > 0) && (
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap items-center gap-2">
            {techNames.map((tech, idx) => (
              <span
                key={idx}
                className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-xs font-semibold text-blue-300"
              >
                {tech}
              </span>
            ))}
            {topicNames.map((topic, idx) => (
              <span
                key={idx}
                className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 text-xs font-semibold text-purple-300"
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Story Selection Modal for Impact Analysis */}
      {showStorySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1020]/95 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Radar className="h-5 w-5 text-blue-400" />
                Select Story for Impact Analysis
              </h3>
              <button
                onClick={() => setShowStorySelector(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select an AI intelligence update to evaluate against <strong>{name}</strong>:
            </p>

            <select
              value={selectedStoryId}
              onChange={(e) => setSelectedStoryId(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-xs text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {stories.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.title} ({s.category || 'General'})
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setShowStorySelector(false)}
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>

              <button
                onClick={handleRunStoryAnalysis}
                disabled={analyzing}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 cursor-pointer disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Gemini Analyzing...</span>
                  </>
                ) : (
                  <span>Run Analysis</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Embedded Impact Radar Component */}
      <ImpactRadar
        projectName={name}
        impacts={impacts}
        onTriggerAnalyze={() => setShowStorySelector(true)}
      />
    </div>
  );
}
