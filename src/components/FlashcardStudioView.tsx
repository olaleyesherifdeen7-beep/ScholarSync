import React, { useState } from 'react';
import {
  Layers,
  Sparkles,
  Plus,
  Loader2,
  BookOpen,
  FolderOpen,
  Trash2,
  Download,
  AlertCircle,
  FileText,
  ChevronDown,
  BrainCircuit,
  Sliders,
} from 'lucide-react';
import { Flashcard, FlashcardDeck, SubjectCategory, SummaryDocument } from '../types';
import { FlashcardViewer } from './FlashcardViewer';

interface FlashcardStudioViewProps {
  decks: FlashcardDeck[];
  summaries: SummaryDocument[];
  currentDeckId: string | null;
  setCurrentDeckId: (id: string | null) => void;
  onSaveDeck: (deck: FlashcardDeck) => void;
  onDeleteDeck: (id: string) => void;
  onOpenAssistantWithTopic?: (topic: string) => void;
  initialContentToGenerate?: { text: string; title: string; subject: SubjectCategory } | null;
  onClearInitialContent?: () => void;
}

export const FlashcardStudioView: React.FC<FlashcardStudioViewProps> = ({
  decks,
  summaries,
  currentDeckId,
  setCurrentDeckId,
  onSaveDeck,
  onDeleteDeck,
  onOpenAssistantWithTopic,
  initialContentToGenerate,
  onClearInitialContent,
}) => {
  const [showGeneratorModal, setShowGeneratorModal] = useState(Boolean(initialContentToGenerate));
  const [sourceType, setSourceType] = useState<'text' | 'saved_summary'>(
    initialContentToGenerate ? 'text' : summaries.length > 0 ? 'saved_summary' : 'text'
  );
  const [sourceText, setSourceText] = useState(initialContentToGenerate?.text || '');
  const [deckTitle, setDeckTitle] = useState(initialContentToGenerate?.title || '');
  const [subject, setSubject] = useState<SubjectCategory>(initialContentToGenerate?.subject || 'Biology');
  const [selectedSummaryId, setSelectedSummaryId] = useState<string>(summaries[0]?.id || '');
  const [cardCount, setCardCount] = useState<number>(8);
  const [difficulty, setDifficulty] = useState<'balanced' | 'easy' | 'hard'>('balanced');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Find active deck or default to first deck
  const activeDeck = decks.find((d) => d.id === currentDeckId) || decks[0] || null;

  const handleGenerateCards = async () => {
    let contentToUse = '';
    let chosenTitle = deckTitle.trim();
    let chosenSubject = subject;

    if (sourceType === 'saved_summary') {
      const summary = summaries.find((s) => s.id === selectedSummaryId);
      if (!summary) {
        setErrorMsg('Please select a saved summary document.');
        return;
      }
      contentToUse = `Title: ${summary.title}\nExecutive Summary: ${summary.executiveSummary}\nCore Concepts:\n${summary.coreConcepts.map((c) => `${c.concept}: ${c.explanation}`).join('\n')}\nBullet Points:\n${summary.keyBulletPoints.join('\n')}\nGlossary:\n${summary.glossary.map((g) => `${g.term}: ${g.definition}`).join('\n')}`;
      if (!chosenTitle) chosenTitle = `${summary.title} Flashcards`;
      chosenSubject = summary.subject;
    } else {
      if (!sourceText || sourceText.trim().length < 20) {
        setErrorMsg('Please enter or paste at least 20 characters of study notes to generate flashcards.');
        return;
      }
      contentToUse = sourceText;
      if (!chosenTitle) chosenTitle = 'Study Deck';
    }

    setIsGenerating(true);
    setErrorMsg(null);

    try {
      let data: any = null;
      try {
        const response = await fetch('/api/generate-flashcards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: contentToUse,
            count: cardCount,
            difficulty,
            subject: chosenSubject,
            title: chosenTitle,
          }),
        });

        if (response.ok) {
          data = await response.json();
        } else {
          console.warn('Flashcard API error, using local fallback generator');
        }
      } catch (fetchErr: any) {
        console.warn('Flashcard fetch error, using local fallback generator:', fetchErr);
      }

      if (!data || !Array.isArray(data.cards) || data.cards.length === 0) {
        const sentences = contentToUse
          .split(/(?<=[.?!])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 20);

        const cards = [];
        const numToGen = Math.min(cardCount, Math.max(4, sentences.length));

        for (let i = 0; i < numToGen; i++) {
          const sent = sentences[i] || `Key academic concept #${i + 1} regarding ${chosenSubject}.`;
          cards.push({
            id: `card_${Date.now()}_${i}`,
            question: `Explain the significance or mechanism of: "${sent.slice(0, 65)}..."?`,
            answer: sent,
            hint: `Focus on the foundational principle of ${chosenSubject}.`,
            category: chosenSubject,
            difficulty: (i % 3 === 0 ? 'easy' : i % 3 === 1 ? 'medium' : 'hard') as any,
            mastered: false,
          });
        }

        data = {
          deckTitle: chosenTitle,
          subject: chosenSubject,
          cards,
        };
      }

      const newDeck: FlashcardDeck = {
        id: `deck_${Date.now()}`,
        title: data.deckTitle || chosenTitle,
        subject: data.subject || chosenSubject,
        createdAt: new Date().toISOString(),
        cards: data.cards || [],
        description: `Generated ${cardCount} active recall cards on ${chosenSubject}.`,
      };

      onSaveDeck(newDeck);
      setCurrentDeckId(newDeck.id);
      setShowGeneratorModal(false);
      if (onClearInitialContent) onClearInitialContent();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to generate flashcards. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportDeck = (deck: FlashcardDeck) => {
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${deck.title.replace(/\s+/g, '_')}_flashcards.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Banner & Deck Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-purple-950 text-purple-300 border border-purple-800/60">
              Module 2
            </span>
            <span className="text-xs text-slate-400">
              Spaced Repetition & 3D Active Recall
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Flashcard Studio
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Auto-generate high-yield questions with 3D flip card viewer, hints, audio narration, and mastery tracking.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-200" />
            <span>AI Auto-Generate Deck</span>
          </button>
        </div>
      </div>

      {/* Deck Selector Tabs */}
      {decks.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {decks.map((deck) => {
            const isCurrent = deck.id === activeDeck?.id;
            const masteredCount = deck.cards.filter((c) => c.mastered).length;
            return (
              <div
                key={deck.id}
                onClick={() => setCurrentDeckId(deck.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setCurrentDeckId(deck.id);
                  }
                }}
                className={`px-4 py-2.5 rounded-2xl border text-xs font-medium shrink-0 transition-all text-left flex items-center gap-3 cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isCurrent
                    ? 'bg-indigo-950/60 border-indigo-500/60 text-white shadow-md glow-indigo'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div>
                  <div className="font-semibold truncate max-w-[170px]">{deck.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {deck.subject} • {masteredCount}/{deck.cards.length} mastered
                  </div>
                </div>
                {isCurrent && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete deck "${deck.title}"?`)) {
                        onDeleteDeck(deck.id);
                      }
                    }}
                    className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete this deck"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Generator Modal / Drawer */}
      {showGeneratorModal && (
        <div className="p-6 rounded-3xl bg-[#0f172a] border border-indigo-500/40 shadow-2xl space-y-5 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-cyan-400 flex items-center justify-center">
                <BrainCircuit className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Smart Flashcard AI Generator
                </h3>
                <p className="text-xs text-slate-400">
                  Select a saved summary or paste course notes to parse into active recall cards.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGeneratorModal(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Source Type Selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setSourceType('saved_summary')}
              disabled={summaries.length === 0}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                sourceType === 'saved_summary'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white disabled:opacity-40'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>From Saved Summary ({summaries.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceType('text')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all cursor-pointer ${
                sourceType === 'text'
                  ? 'bg-indigo-600/30 border-indigo-500 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Paste Notes / Freeform Text</span>
            </button>
          </div>

          {/* Source Controls */}
          {sourceType === 'saved_summary' ? (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Select Saved Summary:
              </label>
              <select
                value={selectedSummaryId}
                onChange={(e) => {
                  setSelectedSummaryId(e.target.value);
                  const selected = summaries.find((s) => s.id === e.target.value);
                  if (selected) {
                    setDeckTitle(`${selected.title} Review`);
                    setSubject(selected.subject);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              >
                {summaries.map((sum) => (
                  <option key={sum.id} value={sum.id}>
                    {sum.title} ({sum.subject})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Paste notes, formulas, or study text:
              </label>
              <textarea
                rows={5}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                placeholder="Paste any class notes, syllabus concepts, or textbook paragraphs here..."
                className="w-full rounded-2xl bg-slate-950 p-3.5 text-sm text-white placeholder-slate-600 border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
            </div>
          )}

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Deck Name
              </label>
              <input
                type="text"
                placeholder="e.g., Organic Reaction Mechanisms"
                value={deckTitle}
                onChange={(e) => setDeckTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Number of Cards
              </label>
              <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {[5, 8, 12, 16].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setCardCount(num)}
                    className={`py-1.5 rounded-lg font-mono font-medium transition-colors cursor-pointer ${
                      cardCount === num ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Difficulty Focus
              </label>
              <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                {(['easy', 'balanced', 'hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setDifficulty(diff)}
                    className={`py-1.5 rounded-lg capitalize font-medium transition-colors cursor-pointer ${
                      difficulty === diff ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowGeneratorModal(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateCards}
              disabled={isGenerating}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 disabled:opacity-50 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Flashcards with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-cyan-200" />
                  <span>Generate {cardCount} Cards</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Flashcard Viewer */}
      {activeDeck ? (
        <FlashcardViewer
          deck={activeDeck}
          onUpdateDeck={onSaveDeck}
          onOpenAssistantWithTopic={onOpenAssistantWithTopic}
        />
      ) : (
        <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
          <Layers className="w-16 h-16 text-slate-600 mx-auto" />
          <h2 className="text-xl font-bold text-white">No Flashcard Decks Yet</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Generate your first active recall study deck using any lecture notes, summary, or textbook chapter.
          </p>
          <button
            onClick={() => setShowGeneratorModal(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold cursor-pointer"
          >
            Create Your First Deck
          </button>
        </div>
      )}
    </div>
  );
};
