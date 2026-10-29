import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Layers,
  FolderGit2,
  Bot,
  Sparkles,
  BookOpen,
  Plus,
} from 'lucide-react';
import { ActiveTab } from '../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  summariesCount: number;
  cardsCount: number;
  onNewSummaryClick: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  summariesCount,
  cardsCount,
  onNewSummaryClick,
  isMobileOpen,
  onCloseMobile,
}) => {
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
      label: 'Document Summarizer',
      icon: FileText,
      badge: summariesCount > 0 ? summariesCount : null,
      desc: 'PDF & notes breakdown',
    },
    {
      id: 'flashcards' as ActiveTab,
      label: 'Flashcard Studio',
      icon: Layers,
      badge: cardsCount > 0 ? cardsCount : null,
      desc: '3D active recall drills',
    },
    {
      id: 'repository' as ActiveTab,
      label: 'Study Vault',
      icon: FolderGit2,
      badge: null,
      desc: 'Organized coursework',
    },
    {
      id: 'assistant' as ActiveTab,
      label: 'AI Study Tutor',
      icon: Bot,
      badge: 'Grounded',
      desc: 'Socratic Q&A & quizzer',
    },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 p-4 select-none">
      {/* Quick Action Button */}
      <div className="mb-4">
        <button
          onClick={() => {
            onNewSummaryClick();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer group"
        >
          <Sparkles className="w-4 h-4 text-neutral-950 group-hover:rotate-12 transition-transform" />
          <span>New AI Summary</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 space-y-1">
        <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-neutral-500 px-3 py-1">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-emerald-400' : 'text-neutral-500'
                  }`}
                />
                <div>
                  <div className={isActive ? 'font-semibold text-white' : ''}>{item.label}</div>
                  <div className="text-[10px] text-neutral-500">{item.desc}</div>
                </div>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    typeof item.badge === 'string'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="pt-4 border-t border-neutral-800/80">
        <div className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-1.5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ScholarSync Engine</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-mono">
            Powered by Gemini 3.8 Flash
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 h-[calc(100vh-61px)] sticky top-[61px] shrink-0">
        {content}
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
