import React from 'react';
import StoryCard from './StoryCard';
import { GridSkeleton } from '../common/Skeleton';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';

export default function StoryList({
  stories = [],
  loading = false,
  error = null,
  onRetry,
  savedStoryIds = [],
  likedStoryIds = [],
  onToggleSave,
  onToggleLike,
  onAnalyzeImpact,
  emptyTitle,
  emptyDescription,
}) {
  if (loading) {
    return <GridSkeleton count={6} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  if (!stories || stories.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No AI intelligence updates'}
        description={emptyDescription || 'Check back later or adjust your search filters.'}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          isSaved={savedStoryIds.includes(story.id)}
          isLiked={likedStoryIds.includes(story.id)}
          onToggleSave={onToggleSave}
          onToggleLike={onToggleLike}
          onAnalyzeImpact={onAnalyzeImpact}
        />
      ))}
    </div>
  );
}
