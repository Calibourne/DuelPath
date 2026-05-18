import React, { createContext, useContext, useState } from 'react';
import { Run, StarterDeck } from '../types';

interface RunContextType {
  activeRun: Run | null;
  startRun: (starterDeck: StarterDeck) => Promise<void>;
  endRun: () => void;
  view: 'compendium' | 'run-hub' | 'starter-selection';
  setView: (view: 'compendium' | 'run-hub' | 'starter-selection') => void;
  // Wizard State
  newRunStep: number;
  setNewRunStep: (step: number) => void;
  pendingStarterDeck: StarterDeck | null;
  setPendingStarterDeck: (deck: StarterDeck | null) => void;
}

const RunContext = createContext<RunContextType | undefined>(undefined);

export const RunProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRun, setActiveRun] = useState<Run | null>(null);
  const [view, setView] = useState<'compendium' | 'run-hub' | 'starter-selection'>('compendium');
  const [newRunStep, setNewRunStep] = useState(1);
  const [pendingStarterDeck, setPendingStarterDeck] = useState<StarterDeck | null>(null);

  const startRun = async (starterDeck: StarterDeck) => {
    const newRun: Run = {
      id: `run-${Date.now()}`,
      gameId: starterDeck.gameId,
      formatId: starterDeck.formatId,
      starterDeckId: starterDeck.id,
      currentDeck: [], // This would be resolved from names on the backend
      status: 'active',
      floor: 1
    };
    
    setActiveRun(newRun);
    setView('run-hub');
    setNewRunStep(1);
    setPendingStarterDeck(null);
    console.log('🚀 Run Started:', newRun);
  };

  const endRun = () => {
    setActiveRun(null);
    setView('run-hub');
    setNewRunStep(1);
    setPendingStarterDeck(null);
  };

  return (
    <RunContext.Provider value={{ 
      activeRun, startRun, endRun, view, setView,
      newRunStep, setNewRunStep, pendingStarterDeck, setPendingStarterDeck 
    }}>
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
