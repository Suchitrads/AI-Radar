import React from 'react';
import { Database, SearchX, Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No AI updates found',
  description = 'Try adjusting your search query or filter criteria.',
  icon: Icon = Inbox,
  actionButton = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-white/5 bg-slate-900/40 p-10 text-center backdrop-blur-md">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-blue-400">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-slate-400">{description}</p>
      {actionButton && <div className="mt-6">{actionButton}</div>}
    </div>
  );
}
