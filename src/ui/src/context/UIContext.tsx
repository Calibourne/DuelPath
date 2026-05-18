import React, { createContext, useContext, useState } from 'react';
import { Card } from '../types';

interface UIContextType {
  hoveredCard: Card | null;
  setHoveredCard: (card: Card | null) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hoveredCard, setHoveredCard] = useState<Card | null>(null);

  return (
    <UIContext.Provider value={{ hoveredCard, setHoveredCard }}>
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
