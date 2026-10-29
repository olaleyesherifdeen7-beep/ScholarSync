import React from 'react';
import {
  FileText,
  Layers,
  Sparkles,
  Flame,
  Award,
  ArrowRight,
  Bot,
  BookOpen,
  Plus,
  BookOpenCheck,
} from 'lucide-react';
import { ActiveTab, FlashcardDeck, SummaryDocument } from '../types';
import { MetricCard } from './MetricCard';
import { HeroBanner } from './HeroBanner';

interface DashboardViewProps {
  summaries: SummaryDocument[];
  decks: FlashcardDeck[];
  streak: number;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenDeck: (deckId: string) => void;
  onOpenSummary: (summary: SummaryDocument) => void;
  onNewSummaryClick: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summaries,
  decks,
  streak,
  setActiveTab,
  onOpenDeck,
  onOpenSummary,
  onNewSummaryClick,
}) => {
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const masteredCards = decks.reduce(
    (acc, d) => acc + d.cards.filter((c) => c.mastered).length,
    0
  );
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  const distinctSubjects = Array.from(
    new Set([...summaries.map((s) => s.subject), ...decks.map((d) => d.subject)])
  ).filter(Boolean);

  const recentSummaries = summaries.slice(0, 4);
  const recentDecks = decks.slice(0, 4);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Hero Welcome Banner */}
      <HeroBanner
        onSummarizeClick={onNewSummaryClick}
        onFlashcardsClick={() => setActiveTab('flashcards')}
      />

      {/* Metrics Row using MetricCard Component */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Summarized Notes"
          value={summaries.length}
          subtitle={`${distinctSubjects.length} active subject fields`}
          icon={FileText}
          badge={`${distinctSubjects.length} subjects`}
          badgeColor="emerald"
          onClick={() => setActiveTab('repository')}
        />
        <MetricCard
          title="Total Flashcards"
          value={totalCards}
          subtitle={`Across ${decks.length} study decks`}
          icon={Layers}
          badge={`${decks.length} decks`}
          badgeColor="cyan"
          onClick={() => setActiveTab('flashcards')}
        />
        <MetricCard
          title="Mastery Rate"
          value={`${masteryRate}%`}
          subtitle={`${masteredCards} / ${totalCards} cards mastered`}
          icon={Award}
          badge="Retention"
          badgeColor="emerald"
        />
        <MetricCard
          title="Study Streak"
          value={`${streak} Days`}
          subtitle="Consistent recall bonus"
          icon={Flame}
          badge="🔥 Hot"
          badgeColor="amber"
        />
      </div>

      {/* Main Workspace Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Notes (2 cols on large screen) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Recent Study Hub</span>
            </h3>
            <button
              onClick={onNewSummaryClick}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Note</span>
            </button>
          </div>

          {recentSummaries.length === 0 ? (
            <div className="p-8 border border-dashed border-neutral-800 rounded-3xl bg-neutral-900/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 text-neutral-400 mx-auto flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-200">No active study session</p>
                <p className="text-xs text-neutral-500 mt-1">Paste your lecture notes or upload a PDF to get started.</p>
              </div>
              <button
                onClick={onNewSummaryClick}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs"
              >
                Summarize Material
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentSummaries.map((summary) => (
                <div
                  key={summary.id}
                  onClick={() => onOpenSummary(summary)}
                  className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {summary.subject}
                      </span>
                      <span className="text-[11px] text-neutral-500 font-mono">
                        ~{summary.estimatedReadTimeMinutes || 3} min
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {summary.title}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {summary.executiveSummary}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-500 font-mono">
                    <span>{summary.coreConcepts.length} Concepts</span>
                    <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform font-sans font-medium flex items-center gap-0.5">
                      Review <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Active Flashcards & Tutor launcher */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Flashcard Decks</span>
            </h3>
            <button
              onClick={() => setActiveTab('flashcards')}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
            >
              View Studio
            </button>
          </div>

          <div className="space-y-3">
            {recentDecks.map((deck) => {
              const mastered = deck.cards.filter((c) => c.mastered).length;
              const percent = deck.cards.length > 0 ? Math.round((mastered / deck.cards.length) * 100) : 0;
              return (
                <div
                  key={deck.id}
                  onClick={() => onOpenDeck(deck.id)}
                  className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all cursor-pointer group space-y-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors truncate">
                        {deck.title}
                      </p>
                      <p className="text-xs text-neutral-400 font-mono">
                        {deck.cards.length} Cards · {percent}% Mastered
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick AI Study Tutor Launchbox */}
          <div className="p-5 rounded-2xl bg-neutral-900 border border-emerald-500/20 shadow-md space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Study Mentor</h4>
                <p className="text-[11px] text-neutral-400">Ask Socratic questions & quiz yourself</p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('assistant')}
              className="w-full py-2 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-300 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Launch Grounded Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
