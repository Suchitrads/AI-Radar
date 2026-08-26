import React from 'react';
import { AlertTriangle, ShieldAlert, Zap, Info, MinusCircle } from 'lucide-react';

export default function ImpactBadge({ level, score, showScore = true }) {
  const normalizedLevel = (level || '').toUpperCase();
  const numScore = score !== undefined && score !== null ? parseFloat(score) : null;

  let badgeStyle = 'border-slate-700 bg-slate-800/40 text-slate-400';
  let Icon = MinusCircle;
  let label = normalizedLevel || 'NO IMPACT';

  if (normalizedLevel === 'CRITICAL' || (numScore !== null && numScore >= 9.0)) {
    badgeStyle = 'border-red-500/40 bg-red-500/10 text-red-400 glow-critical';
    Icon = ShieldAlert;
    label = 'CRITICAL IMPACT';
  } else if (normalizedLevel === 'HIGH' || (numScore !== null && numScore >= 7.0)) {
    badgeStyle = 'border-amber-500/40 bg-amber-500/10 text-amber-400 glow-high';
    Icon = AlertTriangle;
    label = 'HIGH IMPACT';
  } else if (normalizedLevel === 'MEDIUM' || (numScore !== null && numScore >= 5.0)) {
    badgeStyle = 'border-yellow-500/40 bg-yellow-500/10 text-yellow-400';
    Icon = Zap;
    label = 'MEDIUM IMPACT';
  } else if (normalizedLevel === 'LOW' || (numScore !== null && numScore >= 3.0)) {
    badgeStyle = 'border-blue-500/40 bg-blue-500/10 text-blue-400';
    Icon = Info;
    label = 'LOW IMPACT';
  }

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${badgeStyle} backdrop-blur-sm`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
      {showScore && numScore !== null && (
        <span className="ml-1 rounded bg-black/40 px-1.5 py-0.2 text-[11px] font-bold text-white/90">
          {numScore.toFixed(1)}/10
        </span>
      )}
    </div>
  );
}
