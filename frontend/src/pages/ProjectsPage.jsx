import React, { useEffect, useState } from 'react';
import { getProjects, getProjectImpact } from '../services/api';
import ProjectCard from '../components/projects/ProjectCard';
import ProjectFormModal from '../components/projects/ProjectFormModal';
import { GridSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import { FolderGit2, Plus, RefreshCw } from 'lucide-react';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [impactCounts, setImpactCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjectsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProjects();
      setProjects(data || []);

      // Fetch impact counts for each project
      const countsMap = {};
      await Promise.all(
        (data || []).map(async (p) => {
          try {
            const res = await getProjectImpact(p.id);
            countsMap[p.id] = res?.impact_count || 0;
          } catch (e) {
            countsMap[p.id] = 0;
          }
        })
      );
      setImpactCounts(countsMap);
    } catch (err) {
      setError(err.message || 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectsData();
  }, []);

  const handleProjectCreated = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
    fetchProjectsData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-indigo-400" />
            <span>Monitored Projects</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage codebases, dependencies, and technology stacks for AI impact assessment
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:from-blue-500 hover:to-violet-500 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Grid or States */}
      {loading ? (
        <GridSkeleton count={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchProjectsData} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderGit2}
          title="No projects configured"
          description="Create your first software project to start receiving Gemini-driven AI impact radar alerts."
          actionButton={
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create First Project</span>
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              impactCount={impactCounts[project.id] || 0}
            />
          ))}
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
