import React from 'react';
import { FlashcardViewer } from './FlashcardViewer';
import { FlashcardDeck as FlashcardDeckType } from '../types';

interface FlashcardDeckProps {
  deck: FlashcardDeckType;
  onUpdateDeck: (updatedDeck: FlashcardDeckType) => void;
  onOpenAssistantWithTopic?: (topic: string) => void;
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = (props) => {
  return <FlashcardViewer {...props} />;
};

export default FlashcardDeck;
