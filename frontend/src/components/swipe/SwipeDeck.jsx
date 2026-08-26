import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  X,
  Radar,
  Bookmark,
  Sparkles,
  ExternalLink,
  Flame,
  Building2,
  Cpu,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import CategoryBadge from '../common/CategoryBadge';
import ScoreBadge from '../common/ScoreBadge';

export default function SwipeDeck({
  stories = [],
  onLike,
  onPass,
  onAnalyzeImpact,
  onBookmark,
  savedStoryIds = [],
}) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gesture state
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  if (!stories || stories.length === 0 || currentIndex >= stories.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-slate-900/40 p-10 text-center backdrop-blur-xl max-w-md mx-auto my-12">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 mb-4 glow-cyan">
          <Sparkles className="h-8 w-8 animate-spin" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-100">You're All Caught Up!</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          You've swiped through all available AI updates. Check back soon for fresh intelligence feeds!
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="mt-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:scale-105 transition-transform cursor-pointer"
        >
          Replay Swipe Deck
        </button>
      </div>
    );
  }

  const currentStory = stories[currentIndex];
  const nextStory = stories[currentIndex + 1];

  // Gesture handlers
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const deltaX = clientX - startPos.current.x;
    const deltaY = clientY - startPos.current.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handlePointerEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const THRESHOLD_X = 110;
    const THRESHOLD_Y = -120;

    if (dragOffset.x > THRESHOLD_X) {
      // Swiped Right -> LIKE
      triggerSwipeAction('RIGHT');
    } else if (dragOffset.x < -THRESHOLD_X) {
      // Swiped Left -> PASS
      triggerSwipeAction('LEFT');
    } else if (dragOffset.y < THRESHOLD_Y) {
      // Swiped Up -> ANALYZE IMPACT
      triggerSwipeAction('UP');
    } else {
      // Reset position
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipeAction = (direction) => {
    if (direction === 'RIGHT') {
      if (onLike) onLike(currentStory);
    } else if (direction === 'LEFT') {
      if (onPass) onPass(currentStory);
    } else if (direction === 'UP') {
      if (onAnalyzeImpact) onAnalyzeImpact(currentStory);
    }

    setDragOffset({ x: 0, y: 0 });
    setCurrentIndex((prev) => prev + 1);
  };

  const rotationDeg = Math.min(Math.max(dragOffset.x / 15, -20), 20);

  // Overlay state indicators
  const showLikeOverlay = dragOffset.x > 40;
  const showPassOverlay = dragOffset.x < -40;
  const showImpactOverlay = dragOffset.y < -40 && Math.abs(dragOffset.x) < 40;

  const isBookmarkSaved = savedStoryIds.includes(currentStory.id);

  return (
    <div className="relative max-w-md mx-auto w-full px-2 py-4 select-none">
      {/* Deck Counter Badge */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-2">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Flame className="h-4 w-4 text-rose-400 fill-rose-500" />
          Swipe Intelligence Reel
        </span>
        <span className="font-mono text-[11px] bg-slate-900 border border-white/10 px-2.5 py-0.5 rounded-full">
          {currentIndex + 1} / {stories.length}
        </span>
      </div>

      {/* Card Stack Container */}
      <div className="relative h-[540px] sm:h-[580px] w-full">
        {/* Next Card Background Shadow */}
        {nextStory && (
          <div className="absolute inset-0 rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-md transform scale-95 translate-y-3 opacity-60 pointer-events-none" />
        )}

        {/* Top Active Swipeable Card */}
        <div
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerEnd}
          onMouseLeave={handlePointerEnd}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerEnd}
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${rotationDeg}deg)`,
            transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          className="swipe-card absolute inset-0 rounded-3xl border border-white/15 bg-gradient-to-b from-[#0D111C] via-[#0A0E1A] to-[#05070E] p-6 shadow-2xl shadow-cyan-500/10 flex flex-col justify-between cursor-grab active:cursor-grabbing backdrop-blur-2xl overflow-hidden"
        >
          {/* Overlay Feedback Badges */}
          {showLikeOverlay && (
            <div className="absolute top-8 left-8 z-30 transform -rotate-12 rounded-2xl border-2 border-emerald-400 bg-emerald-500/20 px-4 py-2 text-lg font-black tracking-widest text-emerald-300 shadow-xl backdrop-blur-md">
              LIKE ❤️
            </div>
          )}

          {showPassOverlay && (
            <div className="absolute top-8 right-8 z-30 transform rotate-12 rounded-2xl border-2 border-rose-500 bg-rose-500/20 px-4 py-2 text-lg font-black tracking-widest text-rose-400 shadow-xl backdrop-blur-md">
              PASS ✖
            </div>
          )}

          {showImpactOverlay && (
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 rounded-2xl border-2 border-violet-400 bg-violet-500/20 px-4 py-2 text-base font-black tracking-widest text-violet-300 shadow-xl backdrop-blur-md">
              ANALYZE IMPACT 📡
            </div>
          )}

          {/* Top Card Info */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <CategoryBadge category={currentStory.category} subCategory={currentStory.sub_category} />

              {/* Match Score Badge */}
              {currentStory.matchScore && (
                <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  {currentStory.matchScore}% MATCH
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg md:text-xl font-extrabold text-slate-100 leading-snug line-clamp-3">
              {currentStory.title}
            </h2>

            {/* Concise Summary */}
            {currentStory.summary && (
              <p className="mt-3 text-xs md:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                {currentStory.summary}
              </p>
            )}

            {/* WHY IT MATTERS Block */}
            {currentStory.why_it_matters && (
              <div className="mt-4 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900 to-transparent p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-400 mb-1">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <span>WHY IT MATTERS</span>
                </div>
                <p className="text-xs text-slate-200 leading-snug line-clamp-2">
                  {currentStory.why_it_matters}
                </p>
              </div>
            )}
          </div>

          {/* Bottom Tags & Detail trigger */}
          <div className="pt-3 border-t border-white/10 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {currentStory.importance_score && (
                <ScoreBadge label="Importance" score={currentStory.importance_score} size="sm" />
              )}
              {currentStory.novelty_score && (
                <ScoreBadge label="Novelty" score={currentStory.novelty_score} size="sm" />
              )}
            </div>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/stories/${currentStory.id}`);
                }}
                className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300"
              >
                <span>Full Intelligence Briefing</span>
                <ArrowUpRight className="h-4 w-4" />
              </button>

              <a
                href={currentStory.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-slate-400 hover:text-white"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe Control Buttons Bar */}
      <div className="mt-6 flex items-center justify-around max-w-sm mx-auto">
        {/* Pass (Left) */}
        <button
          onClick={() => triggerSwipeAction('LEFT')}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:scale-110 transition-all shadow-lg cursor-pointer"
          title="Pass story"
        >
          <X className="h-7 w-7" />
        </button>

        {/* Impact Radar (Up) */}
        <button
          onClick={() => triggerSwipeAction('UP')}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/40 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 hover:scale-110 transition-all shadow-lg cursor-pointer"
          title="Analyze Project Impact"
        >
          <Radar className="h-6 w-6" />
        </button>

        {/* Bookmark / Save */}
        <button
          onClick={() => onBookmark && onBookmark(currentStory)}
          className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all shadow-lg cursor-pointer ${
            isBookmarkSaved
              ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-300'
              : 'border-white/20 bg-slate-900/60 text-slate-300 hover:text-white'
          }`}
          title="Save Story"
        >
          <Bookmark className={`h-5 w-5 ${isBookmarkSaved ? 'fill-cyan-400' : ''}`} />
        </button>

        {/* Like (Right) */}
        <button
          onClick={() => triggerSwipeAction('RIGHT')}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-110 transition-all shadow-lg glow-cyan cursor-pointer"
          title="Like & Recommend"
        >
          <Heart className="h-7 w-7 fill-emerald-500/20 text-emerald-400" />
        </button>
      </div>
    </div>
  );
}
