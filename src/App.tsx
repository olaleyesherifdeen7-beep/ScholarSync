import React, { useState } from 'react';
import { ActiveTab, FlashcardDeck as FlashcardDeckType, SubjectCategory, SummaryDocument } from './types';
import {
  loadDecks,
  loadSummaries,
  saveDecks,
  saveSummaries,
  getStudyStreak,
} from './utils/storage';
import { INITIAL_SAMPLE_DECKS, INITIAL_SAMPLE_SUMMARIES } from './data/samplePresets';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import DashboardView from './components/DashboardView';
import SummarizerView from './components/Summarizer';
import { FlashcardStudioView } from './components/FlashcardStudioView';
import { RepositoryView } from './components/RepositoryView';
import { AIAssistantView } from './components/AIAssistantView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [summaries, setSummaries] = useState<SummaryDocument[]>(() => loadSummaries());
  const [decks, setDecks] = useState<FlashcardDeckType[]>(() => loadDecks());
  const [streak, setStreak] = useState<number>(() => getStudyStreak());

  const [currentDeckId, setCurrentDeckId] = useState<string | null>(() => decks[0]?.id || null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // AI Assistant Context
  const [assistantContext, setAssistantContext] = useState<{ text: string; title: string }>({
    text: summaries[0] ? `${summaries[0].title}\n${summaries[0].executiveSummary}\n${summaries[0].rawSourceText}` : '',
    title: summaries[0]?.title || 'Cellular Respiration & Energy Production',
  });

  // Pre-fill flashcard generator from summary
  const [initialFlashcardSource, setInitialFlashcardSource] = useState<{
    text: string;
    title: string;
    subject: SubjectCategory;
  } | null>(null);

  // Compute mastery stats
  const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
  const masteredCards = decks.reduce(
    (acc, d) => acc + d.cards.filter((c) => c.mastered).length,
    0
  );
  const masteryRate = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Sync state to storage
  const handleSaveSummary = (newSummary: SummaryDocument) => {
    setSummaries((prev) => {
      const exists = prev.some((s) => s.id === newSummary.id);
      const updated = exists ? prev.map((s) => (s.id === newSummary.id ? newSummary : s)) : [newSummary, ...prev];
      saveSummaries(updated);
      return updated;
    });

    setAssistantContext({
      text: `${newSummary.title}\n${newSummary.executiveSummary}\n${newSummary.rawSourceText}`,
      title: newSummary.title,
    });
  };

  const handleDeleteSummary = (id: string) => {
    setSummaries((prev) => {
      const updated = prev.filter((s) => s.id !== id);
      saveSummaries(updated);
      return updated;
    });
  };

  const handleSaveDeck = (newDeck: FlashcardDeckType) => {
    setDecks((prev) => {
      const exists = prev.some((d) => d.id === newDeck.id);
      const updated = exists ? prev.map((d) => (d.id === newDeck.id ? newDeck : d)) : [newDeck, ...prev];
      saveDecks(updated);
      return updated;
    });
    setCurrentDeckId(newDeck.id);
  };

  const handleDeleteDeck = (id: string) => {
    setDecks((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      saveDecks(updated);
      if (currentDeckId === id) {
        setCurrentDeckId(updated[0]?.id || null);
      }
      return updated;
    });
  };

  const handleImportData = (importedSummaries: SummaryDocument[], importedDecks: FlashcardDeckType[]) => {
    if (importedSummaries.length > 0) {
      setSummaries(importedSummaries);
      saveSummaries(importedSummaries);
    }
    if (importedDecks.length > 0) {
      setDecks(importedDecks);
      saveDecks(importedDecks);
      setCurrentDeckId(importedDecks[0].id);
    }
  };

  const handleResetDemoData = () => {
    setSummaries(INITIAL_SAMPLE_SUMMARIES);
    saveSummaries(INITIAL_SAMPLE_SUMMARIES);
    setDecks(INITIAL_SAMPLE_DECKS);
    saveDecks(INITIAL_SAMPLE_DECKS);
    setCurrentDeckId(INITIAL_SAMPLE_DECKS[0]?.id || null);
  };

  const handleGenerateFlashcardsFromSummary = (summary: SummaryDocument) => {
    setInitialFlashcardSource({
      text: `Title: ${summary.title}\nExecutive Summary: ${summary.executiveSummary}\nCore Concepts:\n${summary.coreConcepts
        .map((c) => `${c.concept}: ${c.explanation}`)
        .join('\n')}\nBullet Points:\n${summary.keyBulletPoints.join('\n')}\nGlossary:\n${summary.glossary
        .map((g) => `${g.term}: ${g.definition}`)
        .join('\n')}`,
      title: `${summary.title} Flashcards`,
      subject: summary.subject,
    });
    setActiveTab('flashcards');
  };

  const handleChatWithDocument = (documentText: string, title: string) => {
    setAssistantContext({
      text: documentText,
      title,
    });
    setActiveTab('assistant');
  };

  const handleOpenDeck = (deckId: string) => {
    setCurrentDeckId(deckId);
    setActiveTab('flashcards');
  };

  const handleOpenSummary = (summary: SummaryDocument) => {
    setAssistantContext({
      text: `${summary.title}\n${summary.executiveSummary}\n${summary.rawSourceText}`,
      title: summary.title,
    });
    setActiveTab('summarizer');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-emerald-500/30 selection:text-emerald-300 flex flex-col">
      {/* Top Navbar */}
      <Header
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          summariesCount={summaries.length}
          cardsCount={totalCards}
          onNewSummaryClick={() => setActiveTab('summarizer')}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-61px)]">
          {activeTab === 'dashboard' && (
            <DashboardView
              summaries={summaries}
              decks={decks}
              streak={streak}
              setActiveTab={setActiveTab}
              onOpenDeck={handleOpenDeck}
              onOpenSummary={handleOpenSummary}
              onNewSummaryClick={() => setActiveTab('summarizer')}
            />
          )}

          {activeTab === 'summarizer' && (
            <SummarizerView
              onSaveSummary={handleSaveSummary}
              onGenerateFlashcardsFromSummary={handleGenerateFlashcardsFromSummary}
              onChatWithDocument={handleChatWithDocument}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardStudioView
              decks={decks}
              summaries={summaries}
              currentDeckId={currentDeckId}
              setCurrentDeckId={setCurrentDeckId}
              onSaveDeck={handleSaveDeck}
              onDeleteDeck={handleDeleteDeck}
              onOpenAssistantWithTopic={(topic) => handleChatWithDocument(topic, `Flashcard Topic: ${topic}`)}
              initialContentToGenerate={initialFlashcardSource}
              onClearInitialContent={() => setInitialFlashcardSource(null)}
            />
          )}

          {activeTab === 'repository' && (
            <RepositoryView
              summaries={summaries}
              decks={decks}
              onSelectSummary={handleOpenSummary}
              onSelectDeck={handleOpenDeck}
              onDeleteSummary={handleDeleteSummary}
              onDeleteDeck={handleDeleteDeck}
              onOpenAssistantWithContext={handleChatWithDocument}
              onImportData={handleImportData}
            />
          )}

          {activeTab === 'assistant' && (
            <AIAssistantView
              contextDocument={assistantContext.text}
              contextTitle={assistantContext.title}
              onUpdateContext={(text, title) => setAssistantContext({ text, title })}
              availableSummaries={summaries}
            />
          )}
        </main>
      </div>

      {/* Settings & AI Workspace Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        summaries={summaries}
        decks={decks}
        onImportData={handleImportData}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
