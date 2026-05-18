import React from 'react';
import { useRun } from '../context/RunContext';

export const Sidebar: React.FC = () => {
  const { view, setView, activeRun } = useRun();

  return (
    <div className="w-64 border-r border-border bg-surface h-screen flex flex-col shrink-0 z-50 shadow-2xl">
      <div className="p-6 border-b border-border bg-white/[0.02]">
        <h1 className="text-2xl font-black italic tracking-tighter text-primary">DUELPATH</h1>
        <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Rogue-lite Engine</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8">
        {/* Navigation Mode */}
        <section>
          <div className="grid grid-cols-1 gap-1">
            <button
              onClick={() => setView('starter-selection')}
              className={`text-left px-4 py-3 rounded-none text-[11px] font-black uppercase tracking-widest border transition-all ${
                view === 'starter-selection' || view === 'run-hub'
                  ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,212,170,0.3)]' 
                  : 'bg-background border-border text-text-muted hover:border-text-muted/50'
              }`}
            >
              {activeRun ? 'Resume Run' : 'New Run'}
            </button>
            <button
              onClick={() => setView('compendium')}
              className={`text-left px-4 py-3 rounded-none text-[11px] font-black uppercase tracking-widest border transition-all ${
                view === 'compendium' 
                  ? 'bg-white text-black border-white' 
                  : 'bg-background border-border text-text-muted hover:border-text-muted/50'
              }`}
            >
              Compendium
            </button>
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-border bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary flex items-center justify-center text-primary font-black text-xs">
            P1
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-text tracking-widest">Player One</p>
            <p className="text-[9px] font-bold text-text-muted uppercase">Ready for Battle</p>
          </div>
        </div>
      </div>
    </div>
  );
};
