import React from 'react';

export default function ScoreBadge({ label, score, size = 'md' }) {
  if (score === null || score === undefined) return null;

  const numScore = parseFloat(score);
  let colorClass = 'border-slate-700 text-slate-400 bg-slate-800/40';
  let glowClass = '';

  if (numScore >= 8.5) {
    colorClass = 'border-blue-500/40 text-blue-400 bg-blue-500/10';
    glowClass = 'shadow-[0_0_12px_rgba(59,130,246,0.25)]';
  } else if (numScore >= 7.0) {
    colorClass = 'border-indigo-500/40 text-indigo-400 bg-indigo-500/10';
  } else if (numScore >= 5.0) {
    colorClass = 'border-violet-500/40 text-violet-400 bg-violet-500/10';
  }

  const isSmall = size === 'sm';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 ${colorClass} ${glowClass} backdrop-blur-sm transition-all duration-200`}
    >
      <span className={`${isSmall ? 'text-[10px]' : 'text-xs'} font-medium uppercase tracking-wider text-slate-400`}>
        {label}
      </span>
      <span className={`${isSmall ? 'text-xs' : 'text-sm'} font-semibold tracking-tight`}>
        {numScore.toFixed(1)}
      </span>
    </div>
  );
}
