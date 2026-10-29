import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Check,
  X,
  Volume2,
  Sliders,
  Download,
  Upload,
  RefreshCw,
  Cpu,
  Layers,
  FileText,
} from 'lucide-react';
import { exportAllDataAsJSON } from '../utils/storage';
import { FlashcardDeck, SummaryDocument } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: SummaryDocument[];
  decks: FlashcardDeck[];
  onImportData: (summaries: SummaryDocument[], decks: FlashcardDeck[]) => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  summaries,
  decks,
  onImportData,
  onResetDemoData,
}) => {
  const [speechSpeed, setSpeechSpeed] = useState<string>('1.0');
  const [defaultDetailLevel, setDefaultDetailLevel] = useState<string>('standard');
  const [defaultCardCount, setDefaultCardCount] = useState<number>(8);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const savedSpeed = localStorage.getItem('scholarsync_speech_speed');
    if (savedSpeed) setSpeechSpeed(savedSpeed);
  }, []);

  if (!isOpen) return null;

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('scholarsync_speech_speed', speechSpeed);
    setStatusMessage('Preferences saved successfully!');
    setTimeout(() => {
      setStatusMessage(null);
      onClose();
    }, 1000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.summaries) || Array.isArray(parsed.decks)) {
          onImportData(parsed.summaries || [], parsed.decks || []);
          setStatusMessage('Study Vault imported successfully!');
          setTimeout(() => setStatusMessage(null), 2000);
        } else {
          setStatusMessage('Invalid backup JSON structure.');
        }
      } catch {
        setStatusMessage('Could not parse backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity">
      <div className="w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative overflow-hidden text-neutral-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight text-white">Study & AI Settings</h3>
              <p className="text-xs text-neutral-400">Configure your academic engine and workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSavePreferences} className="mt-5 space-y-5">
          {/* AI Connection Status Card */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Gemini AI Engine
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Connected & Active
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Model: <span className="font-mono text-neutral-200 font-semibold">gemini-3.8-flash</span> via full-stack server proxy.
              Your API key is automatically attached and managed securely in the background.
            </p>
          </div>

          {/* Audio & Speech Settings */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              Flashcard Narration Speech Rate
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '0.85x (Deliberate)', val: '0.85' },
                { label: '1.0x (Normal)', val: '1.0' },
                { label: '1.25x (Fast)', val: '1.25' },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => setSpeechSpeed(item.val)}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    speechSpeed === item.val
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Data & Backup Management */}
          <div className="space-y-3 pt-2 border-t border-neutral-800/80">
            <div className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Study Vault Data Management
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => exportAllDataAsJSON(summaries, decks)}
                className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-200 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Export JSON Backup</span>
              </button>

              <label className="py-2.5 px-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-xs text-neutral-200 font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-teal-400" />
                <span>Restore Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Reset your study vault to initial sample notes and decks?')) {
                  onResetDemoData();
                  setStatusMessage('Vault reset to demo presets.');
                  setTimeout(() => setStatusMessage(null), 1500);
                }
              }}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset study library to default sample materials</span>
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="p-3 rounded-xl text-xs flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-in fade-in">
              <Check className="w-4 h-4 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 rounded-xl shadow-lg shadow-emerald-500/10 transition-all cursor-pointer font-sans"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
