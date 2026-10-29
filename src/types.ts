export type SubjectCategory =
  | 'Biology'
  | 'Chemistry'
  | 'Physics'
  | 'Computer Science'
  | 'Mathematics'
  | 'History'
  | 'Literature'
  | 'Economics'
  | 'Psychology'
  | 'General'
  | string;

export interface CoreConcept {
  concept: string;
  explanation: string;
  whyItMatters: string;
}

export interface GlossaryTerm {
  term: string;
  definition: string;
  context?: string;
}

export interface SummaryDocument {
  id: string;
  title: string;
  subject: SubjectCategory;
  createdAt: string;
  rawSourceText: string;
  estimatedReadTimeMinutes?: number;
  executiveSummary: string;
  coreConcepts: CoreConcept[];
  keyBulletPoints: string[];
  glossary: GlossaryTerm[];
  examTips?: string[];
  tags?: string[];
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  hint: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  mastered: boolean;
  lastReviewed?: string;
  reviewCount?: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject: SubjectCategory;
  createdAt: string;
  description?: string;
  sourceSummaryId?: string;
  cards: Flashcard[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  studyMode?: 'explain' | 'quiz_me' | 'mnemonic' | 'eli5' | 'deep_dive';
}

export type ActiveTab = 'dashboard' | 'summarizer' | 'flashcards' | 'repository' | 'assistant';
