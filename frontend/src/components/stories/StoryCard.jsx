import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, ExternalLink, Bookmark, Sparkles, Building2, Cpu, ArrowRight, Heart } from 'lucide-react';
import CategoryBadge from '../common/CategoryBadge';
import ScoreBadge from '../common/ScoreBadge';

export default function StoryCard({
  story,
  isSaved = false,
  isLiked = false,
  onToggleSave,
  onToggleLike,
  onAnalyzeImpact,
}) {
  const navigate = useNavigate();

  if (!story) return null;

  const {
    id,
    title,
    summary,
    why_it_matters,
    category,
    sub_category,
    companies,
    technologies,
    importance_score,
    novelty_score,
    technical_score,
    is_breaking,
    published_at,
    url,
    matchScore,
  } = story;

  const formattedDate = published_at
    ? new Date(published_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const parseTags = (str) =>
    str
      ? str
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const companyList = parseTags(companies);
  const techList = parseTags(technologies);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    navigate(`/stories/${id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="glass-card group relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 cursor-pointer border border-white/10 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={category} subCategory={sub_category} />

            {matchScore && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                {matchScore}% MATCH
              </span>
            )}

            {is_breaking && (
              <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-[11px] font-extrabold text-rose-400 animate-pulse">
                <Flame className="h-3 w-3 fill-rose-500" />
                BREAKING
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleLike && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleLike(story);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
                  isLiked
                    ? 'border-rose-500/50 bg-rose-500/20 text-rose-400 scale-110 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                    : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
                title={isLiked ? 'Unlike story' : 'Like & recommend'}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-rose-500' : ''}`} />
              </button>
            )}

            {onToggleSave && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSave(story);
                }}
                className={`flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                  isSaved
                    ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                    : 'border-white/10 bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
                title={isSaved ? 'Remove from saved' : 'Save story'}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-cyan-400' : ''}`} />
              </button>
            )}

            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-slate-900/60 text-slate-400 hover:text-white transition-colors"
              title="Open source link"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base md:text-lg font-extrabold text-slate-100 group-hover:text-cyan-300 transition-colors leading-snug line-clamp-2">
          {title}
        </h3>

        {/* Summary */}
        {summary && (
          <p className="mt-2 text-xs md:text-sm text-slate-300 line-clamp-3 leading-relaxed">
            {summary}
          </p>
        )}

        {/* WHY IT MATTERS Section */}
        {why_it_matters && (
          <div className="mt-4 rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-950/40 via-slate-900 to-transparent p-3.5 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-violet-400 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <span>WHY IT MATTERS</span>
            </div>
            <p className="text-xs text-slate-200 leading-normal line-clamp-2">
              {why_it_matters}
            </p>
          </div>
        )}
      </div>

      {/* Footer Details */}
      <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
        {/* Scores */}
        <div className="flex items-center gap-2 flex-wrap">
          {importance_score !== null && (
            <ScoreBadge label="Importance" score={importance_score} size="sm" />
          )}
          {novelty_score !== null && (
            <ScoreBadge label="Novelty" score={novelty_score} size="sm" />
          )}
          {technical_score !== null && (
            <ScoreBadge label="Technical" score={technical_score} size="sm" />
          )}
        </div>

        {/* Companies & Tech */}
        {(companyList.length > 0 || techList.length > 0) && (
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400">
            {companyList.slice(0, 2).map((comp, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-slate-900 border border-white/10 px-2 py-0.5 text-[11px] font-medium text-slate-300"
              >
                <Building2 className="h-3 w-3 text-slate-400" />
                {comp}
              </span>
            ))}
            {techList.slice(0, 3).map((tech, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[11px] font-medium text-cyan-300"
              >
                <Cpu className="h-3 w-3 text-cyan-400" />
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Date & Detail Action */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <span>{formattedDate}</span>

          <div className="flex items-center gap-2">
            {onAnalyzeImpact && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAnalyzeImpact(story);
                }}
                className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-bold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                Analyze Impact
              </button>
            )}

            <span className="flex items-center gap-1 text-cyan-400 group-hover:translate-x-1 transition-transform font-bold">
              Read <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
