import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Cpu, HelpCircle, CheckCircle2, AlertCircle } from 'lucide-react';
import ImpactBadge from '../common/ImpactBadge';

export default function ImpactCard({ impact }) {
  const navigate = useNavigate();

  if (!impact) return null;

  const {
    id,
    story_id,
    impact_score,
    impact_level,
    impact_type,
    affected_technologies,
    reason,
    recommended_action,
    story,
  } = impact;

  const affectedList = affected_technologies
    ? affected_technologies.split(',').map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="glass-card relative flex flex-col justify-between rounded-2xl p-6 border border-white/10 transition-all duration-300 hover:border-blue-500/40">
      <div>
        {/* Header: Level badge + Impact type */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <ImpactBadge level={impact_level} score={impact_score} />

          {impact_type && (
            <span className="rounded-md border border-white/10 bg-slate-900/60 px-2.5 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {impact_type} Impact
            </span>
          )}
        </div>

        {/* Story Title */}
        {story ? (
          <h3
            onClick={() => navigate(`/stories/${story_id}`)}
            className="text-base md:text-lg font-bold text-slate-100 hover:text-blue-300 transition-colors cursor-pointer leading-snug line-clamp-2"
          >
            {story.title}
          </h3>
        ) : (
          <h3 className="text-base font-bold text-slate-100">
            Impact Analysis #{id} (Story #{story_id})
          </h3>
        )}

        {/* Affected Technologies */}
        {affectedList.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Cpu className="h-3 w-3 text-blue-400" /> Affected Tech:
            </span>
            {affectedList.map((tech, idx) => (
              <span
                key={idx}
                className="rounded-md bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* WHY THIS AFFECTS YOUR PROJECT */}
        {reason && (
          <div className="mt-4 rounded-xl border border-white/5 bg-slate-900/60 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
              <span>WHY THIS AFFECTS YOUR PROJECT</span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {reason}
            </p>
          </div>
        )}

        {/* RECOMMENDED ACTION */}
        {recommended_action && (
          <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>RECOMMENDED ACTION</span>
            </div>
            <p className="text-xs md:text-sm text-emerald-200/90 leading-relaxed font-medium">
              {recommended_action}
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
        <span className="text-[11px] font-medium text-slate-500">
          Evaluated by Gemini AI
        </span>

        <button
          onClick={() => navigate(`/stories/${story_id}`)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-500/20 transition-colors"
        >
          <span>Read Story</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
