import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjects, getProjectImpact, getStories, analyzeImpact } from '../services/api';
import ImpactRadar from '../components/impact/ImpactRadar';
import { Radar, FolderGit2, Loader2, Sparkles } from 'lucide-react';

export default function ImpactRadarPage() {
  const { id: paramProjectId } = useParams();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(paramProjectId || '');
  const [impacts, setImpacts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analysis modal state
  const [showStorySelector, setShowStorySelector] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsData, storiesData] = await Promise.all([
        getProjects(),
        getStories(),
      ]);

      setProjects(projectsData || []);
      setStories(storiesData || []);

      if (storiesData && storiesData.length > 0) {
        setSelectedStoryId(storiesData[0].id);
      }

      let activeId = paramProjectId;
      if (!activeId && projectsData && projectsData.length > 0) {
        activeId = projectsData[0].id;
      }
      setSelectedProjectId(activeId || '');

      if (activeId) {
        const impactRes = await getProjectImpact(activeId);
        setImpacts(impactRes?.impacts || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load impact radar');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [paramProjectId]);

  const handleProjectSelectChange = async (projId) => {
    setSelectedProjectId(projId);
    if (projId) {
      navigate(`/projects/${projId}/impact`, { replace: true });
      setLoading(true);
      try {
        const res = await getProjectImpact(projId);
        setImpacts(res?.impacts || []);
      } catch (err) {
        console.error('Impact fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRunStoryAnalysis = async () => {
    if (!selectedProjectId || !selectedStoryId) return;
    setAnalyzing(true);
    try {
      await analyzeImpact(selectedProjectId, selectedStoryId);
      setShowStorySelector(false);
      const res = await getProjectImpact(selectedProjectId);
      setImpacts(res?.impacts || []);
    } catch (err) {
      alert(`Analysis failed: ${err.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const currentProject = projects.find((p) => String(p.id) === String(selectedProjectId));

  return (
    <div className="space-y-6 pb-16">
      {/* Selector Header Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Radar className="h-5 w-5 text-blue-400 animate-pulse" />
            <span>AI Impact Radar Command Center</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate how incoming AI developments directly affect your specific codebase dependencies
          </p>
        </div>

        {projects.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-300 whitespace-nowrap">
              Select Project:
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => handleProjectSelectChange(e.target.value)}
              className="rounded-xl border border-white/10 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-100 focus:border-blue-500 focus:outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
          <span className="text-sm font-medium text-slate-400">Loading project impact data...</span>
        </div>
      ) : (
        <ImpactRadar
          projectName={currentProject?.name || 'Project'}
          impacts={impacts}
          onTriggerAnalyze={() => setShowStorySelector(true)}
        />
      )}

      {/* Story Selection Modal for Impact Analysis */}
      {showStorySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 bg-[#0B1020]/95 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Radar className="h-5 w-5 text-blue-400" />
                Analyze AI Story Impact
              </h3>
              <button
                onClick={() => setShowStorySelector(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Run Gemini AI cross-examination for story against{' '}
              <strong className="text-white">{currentProject?.name || 'project'}</strong>:
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
                    <span>Gemini Evaluating...</span>
                  </>
                ) : (
                  <span>Run Analysis</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
