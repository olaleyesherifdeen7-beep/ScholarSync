import React from 'react';
import { SummarizerView } from './SummarizerView';
import { SummaryDocument } from '../types';

interface SummarizerProps {
  onSaveSummary: (summary: SummaryDocument) => void;
  onGenerateFlashcardsFromSummary: (summary: SummaryDocument) => void;
  onChatWithDocument: (documentText: string, title: string) => void;
}

export const Summarizer: React.FC<SummarizerProps> = (props) => {
  return <SummarizerView {...props} />;
};

export default Summarizer;
