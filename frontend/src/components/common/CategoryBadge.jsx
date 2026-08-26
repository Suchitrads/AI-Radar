import React from 'react';
import { Tag } from 'lucide-react';

export default function CategoryBadge({ category, subCategory }) {
  if (!category) return null;

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
      <Tag className="h-3 w-3 text-blue-400" />
      <span className="uppercase tracking-wider font-semibold text-[11px]">
        {category}
      </span>
      {subCategory && (
        <span className="text-blue-300/60 font-normal">
          / {subCategory}
        </span>
      )}
    </div>
  );
}
