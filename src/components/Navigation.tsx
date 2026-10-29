import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  FolderGit2,
  Sparkles,
  Bot,
  Flame,
  Menu,
  X,
  BookOpenCheck,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import { ActiveTab, FlashcardDeck, SummaryDocument } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  summaries: SummaryDocument[];
  decks: FlashcardDeck[];
  streak: number;
  onNewSummaryClick: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  summaries,
  decks,
  streak,
  onNewSummaryClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const masteredCards = decks.reduce(
    (acc, d) => acc + d.cards.filter((c) => c.mastered).length,
    0
  );

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      desc: 'Overview & metrics',
    },
    {
      id: 'summarizer' as ActiveTab,
      label: 'AI Summarizer',
      icon: FileText,
      badge: summaries.length > 0 ? summaries.length : null,
      desc: 'PDF & notes breakdown',
    },
    {
      id: 'flashcards' as ActiveTab,
      label: 'Flashcard Studio',
      icon: Layers,
      badge: totalCards > 0 ? totalCards : null,
      desc: '3D active recall drills',
    },
    {
      id: 'repository' as ActiveTab,
      label: 'Subject Library',
      icon: FolderGit2,
      badge: null,
      desc: 'Organized coursework',
    },
    {
      id: 'assistant' as ActiveTab,
      label: 'AI Study Tutor',
      icon: Bot,
      badge: 'Interactive',
      desc: 'Socratic Q&A & quizzer',
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] flex items-center justify-center glow-indigo">
            <div className="w-full h-full bg-[#0b0f19] rounded-[7px] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              ScholarSync <span className="text-cyan-400 text-xs font-mono font-semibold px-1 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60">AI</span>
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 bg-[#0f172a] border-b border-slate-800 p-4 z-50 shadow-2xl space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/20 text-cyan-300 border border-indigo-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => {
                onNewSummaryClick();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium text-sm shadow-md hover:brightness-110 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Summarize New Material</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0b0f19] border-r border-slate-800/80 h-screen sticky top-0 shrink-0 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1.5px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg tracking-tight text-white">
                  ScholarSync
                </h1>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-950/80 text-cyan-400 border border-cyan-800/50">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                Cognitive Academic Hub
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <button
            onClick={onNewSummaryClick}
            className="mt-4 w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-cyan-200 group-hover:rotate-12 transition-transform" />
            <span>Summarize Document</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 px-3 py-1">
            Study Core
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group text-left cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-900/40 via-indigo-950/30 to-transparent text-white border-l-2 border-indigo-400 pl-3 shadow-inner'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-indigo-600/30 text-cyan-300'
                        : 'bg-slate-800/50 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={isActive ? 'text-white font-semibold' : ''}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {item.desc}
                    </div>
                  </div>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                      typeof item.badge === 'string'
                        ? 'bg-purple-900/50 text-purple-300 border border-purple-700/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Study Statistics Widget in Sidebar Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/40">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Study Streak
              </span>
              <span className="text-xs font-mono font-bold text-amber-300">
                {streak} Days
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  Mastered Cards
                </span>
                <span className="font-mono text-slate-300">
                  {masteredCards}/{totalCards} ({totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalCards > 0 ? (masteredCards / totalCards) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              Powered by Google Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
