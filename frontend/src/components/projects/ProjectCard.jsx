import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderGit2, Cpu, Tag, ArrowRight, Layers, Radar } from 'lucide-react';

export default function ProjectCard({ project, impactCount = 0 }) {
  const navigate = useNavigate();

  if (!project) return null;

  const {
    id,
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

  // Extract raw strings from technology objects if needed
  const techNames = Array.isArray(technologies)
    ? technologies.map((t) => (typeof t === 'string' ? t : t.technology))
    : [];

  const topicNames = Array.isArray(topics)
    ? topics.map((t) => (typeof t === 'string' ? t : t.topic))
    : [];

  return (
    <div
      onClick={() => navigate(`/projects/${id}`)}
      className="glass-card group relative flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 cursor-pointer border border-white/5 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-400">
              <FolderGit2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                {name}
              </h3>
              {ai_stack && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400">
                  <Cpu className="h-3 w-3" /> {ai_stack}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs md:text-sm text-slate-300 line-clamp-2 leading-relaxed mb-4">
            {description}
          </p>
        )}

        {/* Tech Stack Summary Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs rounded-xl border border-white/5 bg-slate-900/40 p-3 mb-4">
          <div>
            <span className="text-[10px] uppercase font-medium text-slate-500 block">
              Backend / DB
            </span>
            <span className="font-semibold text-slate-200 truncate block">
              {backend || 'N/A'} {database ? `+ ${database}` : ''}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-medium text-slate-500 block">
              Frontend / Infra
            </span>
            <span className="font-semibold text-slate-200 truncate block">
              {frontend || 'N/A'} {infrastructure ? `(${infrastructure})` : ''}
            </span>
          </div>
        </div>

        {/* Technologies & Topics Tags */}
        <div className="space-y-2">
          {techNames.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {techNames.slice(0, 4).map((tech, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-[11px] font-medium text-blue-300"
                >
                  {tech}
                </span>
              ))}
              {techNames.length > 4 && (
                <span className="text-[11px] text-slate-500 font-medium">
                  +{techNames.length - 4} more
                </span>
              )}
            </div>
          )}

          {topicNames.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {topicNames.slice(0, 3).map((topic, idx) => (
                <span
                  key={idx}
                  className="rounded-md bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 text-[11px] font-medium text-purple-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer / Impact Stats */}
      <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radar className="h-4 w-4 text-blue-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            {impactCount} Impact Analyses
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/projects/${id}/impact`);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
        >
          <span>Impact Radar</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
