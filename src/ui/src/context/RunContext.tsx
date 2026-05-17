import React, { createContext, useContext, useState, useEffect } from 'react';
import { Run, StarterDeck, GameId } from '../types';

interface RunContextType {
  activeRun: Run | null;
  startRun: (starterDeck: StarterDeck) => Promise<void>;
  endRun: () => void;
  view: 'compendium' | 'run-hub' | 'starter-selection';
  setView: (view: 'compendium' | 'run-hub' | 'starter-selection') => void;
}

const RunContext = createContext<RunContextType | undefined>(undefined);

export const RunProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [view, setView] = useState<'compendium' | 'run-hub' | 'starter-selection'>('compendium');

  const startRun = async (starterDeck: StarterDeck) => {
    // In a real app, this would call an API to resolve names to IDs and save the run
    // For now, we'll mock the start
    const newRun: Run = {
      id: `run-${Date.now()}`,
      gameId: starterDeck.gameId,
      formatId: starterDeck.formatId,
      starterDeckId: starterDeck.id,
      currentDeck: [], // This would be populated with resolved card IDs
      status: 'active',
      floor: 1
    };
    
    setActiveRun(newRun);
    setView('run-hub');
    console.log('🚀 Run Started:', newRun);
  };

  const endRun = () => {
    setActiveRun(null);
    setView('run-hub');
  };

  return (
    <RunContext.Provider value={{ activeRun, startRun, endRun, view, setView }}>
      {children}
    </RunContext.Provider>
  );
};

export const useRun = () => {
  const context = useContext(RunContext);
  if (context === undefined) {
    throw new Error('useRun must be used within a RunProvider');
  }
  return context;
};
