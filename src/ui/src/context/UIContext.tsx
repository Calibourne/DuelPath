import React, { createContext, useContext, useState, useCallback } from 'react';
import { Card } from '../types';

interface UIContextType {
  hoveredCard: Card | null;
  setHoveredCard: (card: Card | null) => void;
  cardCount: number;
  setCardCount: (count: number) => void;
  recentHoveredCards: Card[];
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredCard, setHoveredCardInner] = useState<Card | null>(null);
  const [recentHoveredCards, setRecentHoveredCards] = useState<Card[]>([]);
  const [cardCount, setCardCount] = useState(0);

  const setHoveredCard = useCallback((card: Card | null) => {
    setHoveredCardInner(card);
    if (card) {
      setRecentHoveredCards(prev => {
        const filtered = prev.filter(c => c.id !== card.id);
        return [card, ...filtered].slice(0, 3);
      });
    }
  }, []);

  return (
    <UIContext.Provider value={{ hoveredCard, setHoveredCard, cardCount, setCardCount, recentHoveredCards }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
