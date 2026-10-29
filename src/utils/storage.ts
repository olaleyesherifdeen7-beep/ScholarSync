import { FlashcardDeck, SummaryDocument } from '../types';
import { INITIAL_SAMPLE_DECKS, INITIAL_SAMPLE_SUMMARIES } from '../data/samplePresets';

const SUMMARIES_STORAGE_KEY = 'scholarsync_summaries_v1';
const DECKS_STORAGE_KEY = 'scholarsync_decks_v1';
const STREAK_STORAGE_KEY = 'scholarsync_streak_v1';

export function loadSummaries(): SummaryDocument[] {
  try {
    const raw = localStorage.getItem(SUMMARIES_STORAGE_KEY);
    if (!raw) {
      saveSummaries(INITIAL_SAMPLE_SUMMARIES);
      return INITIAL_SAMPLE_SUMMARIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_SUMMARIES;
  } catch (err) {
    console.error('Failed to load summaries from localStorage:', err);
    return INITIAL_SAMPLE_SUMMARIES;
  }
}

export function saveSummaries(summaries: SummaryDocument[]): void {
  try {
    localStorage.setItem(SUMMARIES_STORAGE_KEY, JSON.stringify(summaries));
  } catch (err) {
    console.error('Failed to save summaries to localStorage:', err);
  }
}

export function loadDecks(): FlashcardDeck[] {
  try {
    const raw = localStorage.getItem(DECKS_STORAGE_KEY);
    if (!raw) {
      saveDecks(INITIAL_SAMPLE_DECKS);
      return INITIAL_SAMPLE_DECKS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_SAMPLE_DECKS;
  } catch (err) {
    console.error('Failed to load decks from localStorage:', err);
    return INITIAL_SAMPLE_DECKS;
  }
}

export function saveDecks(decks: FlashcardDeck[]): void {
  try {
    localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  } catch (err) {
    console.error('Failed to save decks to localStorage:', err);
  }
}

export function getStudyStreak(): number {
  try {
    const raw = localStorage.getItem(STREAK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STREAK_STORAGE_KEY, '4'); // encouraging initial streak
      return 4;
    }
    return Number(raw) || 4;
  } catch {
    return 4;
  }
}

export function incrementStudyStreak(): number {
  try {
    const current = getStudyStreak();
    const updated = current + 1;
    localStorage.setItem(STREAK_STORAGE_KEY, updated.toString());
    return updated;
  } catch {
    return 5;
  }
}

export function exportAllDataAsJSON(summaries: SummaryDocument[], decks: FlashcardDeck[]): void {
  const backupData = {
    app: 'ScholarSync AI',
    exportedAt: new Date().toISOString(),
    summaries,
    decks,
  };

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scholarsync_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
