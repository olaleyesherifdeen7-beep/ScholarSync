import React from 'react';
import { Settings, BookOpen, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onToggleMobileSidebar?: () => void;
  isMobileSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onToggleMobileSidebar,
  isMobileSidebarOpen,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between">
      {/* Brand Logo - Removed 'AI' tag and top bar status indicators */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-1.5 -ml-1 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        )}

        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
          <BookOpen className="w-5 h-5 text-neutral-950 font-bold" />
        </div>
        <div>
          <h1 className="font-bold text-base tracking-tight text-white">
            ScholarSync
          </h1>
          <p className="text-[11px] text-neutral-400">Smart Academic Companion</p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-3">
        {/* Gear Icon Button */}
        <button
          onClick={onOpenSettings}
          className="p-2.5 text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 rounded-xl transition-all duration-200 cursor-pointer"
          title="Open Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
