import React, { useState } from 'react';
import {
  FolderGit2,
  Search,
  FileText,
  Layers,
  Sparkles,
  Bot,
  Trash2,
  ExternalLink,
  Download,
  Upload,
  Calendar,
  CheckCircle,
  Tag,
  BookOpen,
  Filter,
} from 'lucide-react';
import { FlashcardDeck, SubjectCategory, SummaryDocument } from '../types';
import { exportAllDataAsJSON } from '../utils/storage';

interface RepositoryViewProps {
  summaries: SummaryDocument[];
  decks: FlashcardDeck[];
  onSelectSummary: (summary: SummaryDocument) => void;
  onSelectDeck: (deckId: string) => void;
  onDeleteSummary: (id: string) => void;
  onDeleteDeck: (id: string) => void;
  onOpenAssistantWithContext: (context: string, title: string) => void;
  onImportData: (importedSummaries: SummaryDocument[], importedDecks: FlashcardDeck[]) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  summaries,
  decks,
  onSelectSummary,
  onSelectDeck,
  onDeleteSummary,
  onDeleteDeck,
  onOpenAssistantWithContext,
  onImportData,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [activeTypeFilter, setActiveTypeFilter] = useState<'all' | 'summaries' | 'decks'>('all');

  // Extract all distinct subjects
  const allSubjects = Array.from(
    new Set([...summaries.map((s) => s.subject), ...decks.map((d) => d.subject)])
  ).filter(Boolean);

  // Filtered summaries
  const filteredSummaries = summaries.filter((s) => {
    if (selectedSubject !== 'all' && s.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = s.title.toLowerCase().includes(q);
      const inSubject = s.subject.toLowerCase().includes(q);
      const inSummary = s.executiveSummary.toLowerCase().includes(q);
      const inGlossary = s.glossary.some((g) => g.term.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q));
      return inTitle || inSubject || inSummary || inGlossary;
    }
    return true;
  });

  // Filtered decks
  const filteredDecks = decks.filter((d) => {
    if (selectedSubject !== 'all' && d.subject !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = d.title.toLowerCase().includes(q);
      const inSubject = d.subject.toLowerCase().includes(q);
      const inCards = d.cards.some((c) => c.question.toLowerCase().includes(q) || c.answer.toLowerCase().includes(q));
      return inTitle || inSubject || inCards;
    }
    return true;
  });

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.summaries) || Array.isArray(parsed.decks)) {
          onImportData(parsed.summaries || [], parsed.decks || []);
          alert('Study repository imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60">
              Module 3
            </span>
            <span className="text-xs text-slate-400">
              Structured Academic Knowledge Base
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Course & Subject Repository
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Organized subject library of all your generated summaries, notes, and active recall decks.
          </p>
        </div>

        {/* Backup and Restore Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportAllDataAsJSON(summaries, decks)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download full JSON backup"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Backup</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Import Backup</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0f172a] border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search across notes, concepts, definitions, and flashcard questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              onClick={() => setActiveTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTypeFilter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({summaries.length + decks.length})
            </button>
            <button
              onClick={() => setActiveTypeFilter('summaries')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTypeFilter === 'summaries'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Summaries ({summaries.length})
            </button>
            <button
              onClick={() => setActiveTypeFilter('decks')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                activeTypeFilter === 'decks'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Decks ({decks.length})
            </button>
          </div>
        </div>

        {/* Subject Folder Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          <span className="text-slate-500 text-xs font-mono mr-1">Subject:</span>
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
              selectedSubject === 'all'
                ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-800/50'
                : 'text-slate-400 hover:text-white bg-slate-950'
            }`}
          >
            All Subjects
          </button>
          {allSubjects.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer shrink-0 ${
                selectedSubject === subj
                  ? 'bg-indigo-950 text-indigo-300 font-semibold border border-indigo-700/60'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Course Materials */}
      <div className="space-y-6">
        {/* Summaries Section */}
        {(activeTypeFilter === 'all' || activeTypeFilter === 'summaries') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs uppercase font-mono font-semibold tracking-wider text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Summarized Course Notes ({filteredSummaries.length})
              </span>
            </div>

            {filteredSummaries.length === 0 ? (
              <div className="p-6 text-center bg-slate-900/30 border border-slate-800/80 rounded-2xl text-xs text-slate-500">
                No summaries found matching your filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/60">
                          {summary.subject}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(summary.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {summary.title}
                      </h3>
                      <p className="text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
                        {summary.executiveSummary}
                      </p>

                      <div className="flex items-center gap-3 mt-3 text-[11px] text-slate-400 font-mono">
                        <span>{summary.coreConcepts.length} Concepts</span>
                        <span>•</span>
                        <span>{summary.glossary.length} Terms</span>
                        <span>•</span>
                        <span>{summary.keyBulletPoints.length} Key Facts</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectSummary(summary)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3 h-3 text-cyan-400" />
                          <span>Open Summary</span>
                        </button>
                        <button
                          onClick={() =>
                            onOpenAssistantWithContext(
                              `${summary.title}\n${summary.executiveSummary}\n${summary.rawSourceText}`,
                              summary.title
                            )
                          }
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-400 border border-slate-800 transition-colors cursor-pointer"
                          title="Chat with AI Tutor"
                        >
                          <Bot className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Delete summary "${summary.title}"?`)) {
                            onDeleteSummary(summary.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                        title="Delete summary"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Decks Section */}
        {(activeTypeFilter === 'all' || activeTypeFilter === 'decks') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs uppercase font-mono font-semibold tracking-wider text-slate-400 px-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Active Recall Flashcard Decks ({filteredDecks.length})
              </span>
            </div>

            {filteredDecks.length === 0 ? (
              <div className="p-6 text-center bg-slate-900/30 border border-slate-800/80 rounded-2xl text-xs text-slate-500">
                No flashcard decks found matching your filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredDecks.map((deck) => {
                  const masteredCount = deck.cards.filter((c) => c.mastered).length;
                  const percent = deck.cards.length > 0 ? Math.round((masteredCount / deck.cards.length) * 100) : 0;
                  return (
                    <div
                      key={deck.id}
                      className="p-5 rounded-2xl bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60">
                            {deck.subject}
                          </span>
                          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            {percent}% Mastered
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {deck.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {deck.description || `${deck.cards.length} active recall cards on ${deck.subject}.`}
                        </p>

                        {/* Progress Bar */}
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>{masteredCount} Mastered</span>
                            <span>{deck.cards.length - masteredCount} Need Review</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                          onClick={() => onSelectDeck(deck.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <Layers className="w-3.5 h-3.5 text-cyan-200" />
                          <span>Study Deck</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete flashcard deck "${deck.title}"?`)) {
                              onDeleteDeck(deck.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
                          title="Delete deck"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
