import React, { useState } from 'react';
import ImpactCard from './ImpactCard';
import { Radar, ShieldAlert, AlertTriangle, Zap, Info, Filter } from 'lucide-react';
import EmptyState from '../common/EmptyState';

export default function ImpactRadar({ projectName, impacts = [], onTriggerAnalyze }) {
  const [filterLevel, setFilterLevel] = useState('ALL');

  // Categorize impacts
  const criticalImpacts = impacts.filter(
    (i) => i.impact_level?.toUpperCase() === 'CRITICAL' || i.impact_score >= 9.0
  );
  const highImpacts = impacts.filter(
    (i) => i.impact_level?.toUpperCase() === 'HIGH' || (i.impact_score >= 7.0 && i.impact_score < 9.0)
  );
  const mediumImpacts = impacts.filter(
    (i) => i.impact_level?.toUpperCase() === 'MEDIUM' || (i.impact_score >= 5.0 && i.impact_score < 7.0)
  );
  const lowImpacts = impacts.filter(
    (i) => i.impact_level?.toUpperCase() === 'LOW' || (i.impact_score >= 3.0 && i.impact_score < 5.0)
  );

  const filteredImpacts = impacts.filter((item) => {
    if (filterLevel === 'ALL') return true;
    if (filterLevel === 'CRITICAL') return item.impact_level?.toUpperCase() === 'CRITICAL' || item.impact_score >= 9.0;
    if (filterLevel === 'HIGH') return item.impact_level?.toUpperCase() === 'HIGH' || (item.impact_score >= 7.0 && item.impact_score < 9.0);
    if (filterLevel === 'MEDIUM') return item.impact_level?.toUpperCase() === 'MEDIUM' || (item.impact_score >= 5.0 && item.impact_score < 7.0);
    if (filterLevel === 'LOW') return item.impact_level?.toUpperCase() === 'LOW' || (item.impact_score >= 3.0 && item.impact_score < 5.0);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner: Project Impact Radar */}
      <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 md:p-8 backdrop-blur-xl shadow-xl shadow-blue-500/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-blue-500/40 bg-blue-500/10 text-blue-400 glow-accent">
              <Radar className="h-7 w-7 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  PROJECT IMPACT RADAR
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-100 mt-0.5">
                {projectName || 'All Projects'}
              </h2>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-center">
              <span className="block text-[10px] font-bold uppercase text-red-400">Critical</span>
              <span className="text-lg font-black text-red-300">{criticalImpacts.length}</span>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2 text-center">
              <span className="block text-[10px] font-bold uppercase text-amber-400">High</span>
              <span className="text-lg font-black text-amber-300">{highImpacts.length}</span>
            </div>
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-3.5 py-2 text-center">
              <span className="block text-[10px] font-bold uppercase text-yellow-400">Medium</span>
              <span className="text-lg font-black text-yellow-300">{mediumImpacts.length}</span>
            </div>
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-3.5 py-2 text-center">
              <span className="block text-[10px] font-bold uppercase text-blue-400">Low</span>
              <span className="text-lg font-black text-blue-300">{lowImpacts.length}</span>
            </div>
          </div>
        </div>

        {/* Filter level tabs */}
        {impacts.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-2">
              <Filter className="h-3.5 w-3.5" /> Filter Level:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  filterLevel === lvl
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                    : 'bg-slate-900/60 border border-white/5 text-slate-400 hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Impact Cards Grid */}
      {filteredImpacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredImpacts.map((impact) => (
            <ImpactCard key={impact.id} impact={impact} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Radar}
          title="No project impacts analyzed yet"
          description="Click 'Analyze Impact' on any AI story to run Gemini impact intelligence against your project dependencies."
          actionButton={
            onTriggerAnalyze ? (
              <button
                onClick={onTriggerAnalyze}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
              >
                <Radar className="h-4 w-4" />
                <span>Select Story to Analyze Impact</span>
              </button>
            ) : null
          }
        />
      )}
    </div>
  );
}
