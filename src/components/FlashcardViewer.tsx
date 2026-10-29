import React, { useState, useEffect } from 'react';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle,
  Volume2,
  VolumeX,
  Lightbulb,
  Award,
  Sparkles,
  HelpCircle,
  List,
  Layers,
  Plus,
  Trash2,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Flashcard, FlashcardDeck } from '../types';
import { speakText, stopSpeaking, isSpeaking } from '../utils/speech';

interface FlashcardViewerProps {
  deck: FlashcardDeck;
  onUpdateDeck: (updatedDeck: FlashcardDeck) => void;
  onOpenAssistantWithTopic?: (topic: string) => void;
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({
  deck,
  onUpdateDeck,
  onOpenAssistantWithTopic,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [filterMode, setFilterMode] = useState<'all' | 'unmastered' | 'mastered'>('all');

  // Filtered cards
  const filteredCards = deck.cards.filter((card) => {
    if (filterMode === 'unmastered') return !card.mastered;
    if (filterMode === 'mastered') return card.mastered;
    return true;
  });

  const currentCard: Flashcard | undefined = filteredCards[currentIndex];

  // Reset flip and hint on card change
  useEffect(() => {
    setIsFlipped(false);
    setShowHint(false);
    stopSpeaking();
    setSpeaking(false);
  }, [currentIndex, filterMode]);

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'h' || e.key === 'H') {
        setShowHint((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, filteredCards.length]);

  const handleNext = () => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    if (filteredCards.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffle = () => {
    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    onUpdateDeck({ ...deck, cards: shuffled });
    setCurrentIndex(0);
  };

  const handleToggleMastered = (cardId: string) => {
    const updatedCards = deck.cards.map((c) => {
      if (c.id === cardId) {
        const nextMastered = !c.mastered;
        if (nextMastered) {
          // Trigger confetti burst!
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#6366f1', '#06b6d4', '#10b981', '#a855f7'],
          });
        }
        return {
          ...c,
          mastered: nextMastered,
          reviewCount: (c.reviewCount || 0) + 1,
          lastReviewed: new Date().toISOString(),
        };
      }
      return c;
    });

    onUpdateDeck({ ...deck, cards: updatedCards });
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }

    if (!currentCard) return;
    const textToSpeak = isFlipped ? currentCard.answer : currentCard.question;
    setSpeaking(true);
    speakText(textToSpeak, () => setSpeaking(false));
  };

  const masteredCount = deck.cards.filter((c) => c.mastered).length;
  const progressPercent = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;

  if (deck.cards.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
        <Layers className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white">This deck is currently empty</h3>
        <p className="text-sm text-slate-400 mt-1">
          Use the AI generator above or add custom cards to begin studying.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Deck Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800/60">
              {deck.subject}
            </span>
            <span className="text-xs text-slate-400">
              {deck.cards.length} cards total
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1 tracking-tight">
            {deck.title}
          </h2>
        </div>

        {/* View Mode Toggle & Filter */}
        <div className="flex items-center gap-2">
          {/* Filter button */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setFilterMode('all');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({deck.cards.length})
            </button>
            <button
              onClick={() => {
                setFilterMode('unmastered');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'unmastered'
                  ? 'bg-amber-600/80 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Review ({deck.cards.length - masteredCount})
            </button>
            <button
              onClick={() => {
                setFilterMode('mastered');
                setCurrentIndex(0);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                filterMode === 'mastered'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>

          {/* List vs 3D card toggle */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('card')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'card' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="3D Card Mode"
            >
              <Layers className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:text-white'
              }`}
              title="Deck List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs text-slate-400 px-1 font-mono">
          <span className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            Mastery Progress: {progressPercent}%
          </span>
          <span>
            {masteredCount} / {deck.cards.length} Mastered
          </span>
        </div>
        <div className="w-full bg-slate-800/80 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {viewMode === 'card' ? (
        filteredCards.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">All cards in this filter are cleared!</h3>
            <p className="text-sm text-slate-400 mt-1">
              Switch filter to "All" or "Review" to keep practicing.
            </p>
            <button
              onClick={() => setFilterMode('all')}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Show All Cards
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Indicator & Shuffle */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 text-slate-300">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleShuffle}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs transition-colors cursor-pointer"
                  title="Shuffle deck order"
                >
                  <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Shuffle</span>
                </button>

                <button
                  onClick={handleAudio}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    speaking
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-700 animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                  title="Listen to card audio"
                >
                  {speaking ? <VolumeX className="w-3.5 h-3.5 text-cyan-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{speaking ? 'Stop' : 'Read Out Loud'}</span>
                </button>
              </div>
            </div>

            {/* 3D Flip Card Container */}
            <div className="perspective-1000 w-full min-h-[340px] sm:min-h-[380px]">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className={`relative w-full min-h-[340px] sm:min-h-[380px] rounded-3xl transition-transform duration-500 transform-style-3d cursor-pointer select-none ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE (Question) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#131b2e] via-[#0f172a] to-[#0b0f19] border-2 border-indigo-500/20 shadow-2xl hover:border-indigo-500/40 transition-all glow-indigo">
                  {/* Card Front Top Metadata */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                        {currentCard?.category || 'General'}
                      </span>
                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold ${
                          currentCard?.difficulty === 'easy'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                            : currentCard?.difficulty === 'hard'
                            ? 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                            : 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                        }`}
                      >
                        {currentCard?.difficulty}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {currentCard?.mastered && (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-800/60">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mastered
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                        Click to flip
                      </span>
                    </div>
                  </div>

                  {/* Card Front Question */}
                  <div className="my-auto py-6">
                    <div className="text-xs uppercase font-mono tracking-widest text-indigo-400 mb-2 font-semibold">
                      Question / Prompt
                    </div>
                    <p className="text-lg sm:text-2xl font-bold text-white leading-relaxed">
                      {currentCard?.question}
                    </p>

                    {/* Hint Toggle */}
                    {currentCard?.hint && (
                      <div className="mt-4" onClick={(e) => e.stopPropagation()}>
                        {showHint ? (
                          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/50 text-xs text-amber-200 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-amber-300">Memory Hint: </span>
                              {currentCard.hint}
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowHint(true)}
                            className="text-xs text-amber-400/90 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                            <span>Need a memory hint?</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Front Footer Instruction */}
                  <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <span className="font-mono text-[11px]">
                      Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Space</kbd> to flip, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">→</kbd> to navigate
                    </span>
                    <span className="text-indigo-400 font-medium">Reveal Answer →</span>
                  </div>
                </div>

                {/* BACK FACE (Answer) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-[#0c2229] via-[#0f172a] to-[#0b0f19] border-2 border-cyan-500/30 shadow-2xl hover:border-cyan-500/50 transition-all glow-cyan">
                  {/* Card Back Top Metadata */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700/60">
                      Answer Key
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <RotateCw className="w-3.5 h-3.5 text-slate-400" />
                      Click to flip back
                    </span>
                  </div>

                  {/* Card Back Answer Content */}
                  <div className="my-auto py-6">
                    <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 mb-2 font-semibold">
                      Correct Answer & Explanation
                    </div>
                    <p className="text-base sm:text-xl font-medium text-slate-100 leading-relaxed">
                      {currentCard?.answer}
                    </p>

                    {currentCard?.hint && (
                      <div className="mt-4 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                        <span>Mnemonic Hook: {currentCard.hint}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Back Actions */}
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-3"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onOpenAssistantWithTopic && (
                      <button
                        onClick={() => onOpenAssistantWithTopic(currentCard?.question || '')}
                        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Ask AI Tutor to elaborate</span>
                      </button>
                    )}

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        onClick={() => handleToggleMastered(currentCard.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          currentCard.mastered
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{currentCard.mastered ? 'Mark for Review' : 'Mark as Mastered'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Controls Bar */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <button
                onClick={handlePrev}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 text-cyan-400" />
                  <span>{isFlipped ? 'Show Question' : 'Flip to Answer'}</span>
                </button>

                <button
                  onClick={() => handleToggleMastered(currentCard.id)}
                  className={`p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentCard.mastered
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                  title="Toggle Mastered"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">
                    {currentCard.mastered ? 'Mastered' : 'Mark Mastered'}
                  </span>
                </button>
              </div>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-all cursor-pointer"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )
      ) : (
        /* LIST / TABLE VIEW */
        <div className="space-y-4">
          <div className="text-xs text-slate-400 font-mono px-1">
            Displaying all {deck.cards.length} cards in this deck. You can review items directly or edit their status.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deck.cards.map((card, idx) => (
              <div
                key={card.id}
                className={`p-5 rounded-2xl border transition-all ${
                  card.mastered
                    ? 'bg-emerald-950/10 border-emerald-900/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">#{idx + 1}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {card.category}
                    </span>
                    <span
                      className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-semibold ${
                        card.difficulty === 'easy'
                          ? 'text-emerald-400 bg-emerald-950/80'
                          : card.difficulty === 'hard'
                          ? 'text-rose-400 bg-rose-950/80'
                          : 'text-amber-400 bg-amber-950/80'
                      }`}
                    >
                      {card.difficulty}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleMastered(card.id)}
                    className={`text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                      card.mastered
                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/60'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{card.mastered ? 'Mastered' : 'Needs Review'}</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold">Q:</span>
                    <p className="text-sm font-semibold text-white mt-0.5">{card.question}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">A:</span>
                    <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{card.answer}</p>
                  </div>
                  {card.hint && (
                    <div className="text-[11px] text-amber-300/80 pt-1 flex items-center gap-1.5">
                      <Lightbulb className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>{card.hint}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
