import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass-card rounded-xl p-5 space-y-4 animate-pulse border border-white/5">
      <div className="flex items-center justify-between">
        <div className="h-5 w-24 rounded bg-slate-800 skeleton-shimmer" />
        <div className="h-5 w-16 rounded-full bg-slate-800 skeleton-shimmer" />
      </div>
      <div className="h-6 w-3/4 rounded bg-slate-800 skeleton-shimmer" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-800/60 skeleton-shimmer" />
        <div className="h-4 w-5/6 rounded bg-slate-800/60 skeleton-shimmer" />
      </div>
      <div className="pt-2 flex gap-3">
        <div className="h-6 w-20 rounded-lg bg-slate-800 skeleton-shimmer" />
        <div className="h-6 w-20 rounded-lg bg-slate-800 skeleton-shimmer" />
        <div className="h-6 w-20 rounded-lg bg-slate-800 skeleton-shimmer" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <CardSkeleton key={idx} />
      ))}
    </div>
  );
}
