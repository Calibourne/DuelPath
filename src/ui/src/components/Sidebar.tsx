import React from 'react';
import { useFormat } from '../context/FormatContext';
import { useRun } from '../context/RunContext';
import { GameId } from '../types';

export const Sidebar: React.FC = () => {
  const { games, formats, selectedGame, selectedFormat, setSelectedGame, setSelectedFormat } = useFormat();
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

        {/* Game & Format Selection (Only visible if not in an active run or in selection) */}
        {!activeRun && (
          <>
            <section>
              <h2 className="text-[10px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1 border-l-2 border-primary/50 pl-3">Select Game</h2>
              <div className="space-y-1">
                {games.map(game => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id as GameId)}
                    className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-all border-l-2 ${
                      selectedGame === game.id 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-transparent text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {game.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[10px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1 border-l-2 border-sky-500/50 pl-3">Select Format</h2>
              <div className="space-y-1">
                {formats.map(format => (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`w-full text-left px-4 py-2 text-[11px] font-bold transition-all border-l-2 ${
                      selectedFormat === format.id 
                        ? 'border-sky-500 text-sky-400 bg-sky-500/5' 
                        : 'border-transparent text-text-muted hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {format.name.toUpperCase()}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}
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
