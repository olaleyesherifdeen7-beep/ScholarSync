import React from 'react';
import { Sparkles, Layers } from 'lucide-react';

interface HeroBannerProps {
  onSummarizeClick: () => void;
  onFlashcardsClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSummarizeClick,
  onFlashcardsClick,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-emerald-950/40 border border-neutral-800 relative overflow-hidden">
      <div className="max-w-xl space-y-4 relative z-10">
        {/* Title and Description */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Accelerate Your Learning
          </h2>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Upload course notes, generate concise AI summaries, and convert dense textbooks into active recall flashcard decks in seconds.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onSummarizeClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Summarize New Material</span>
          </button>

          <button
            onClick={onFlashcardsClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-medium text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Drill Flashcards</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
