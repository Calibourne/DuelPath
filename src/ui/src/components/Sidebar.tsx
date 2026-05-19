import React from 'react';
import { useRun } from '../context/RunContext';
import { useFormat } from '../context/FormatContext';
import { useUI } from '../context/UIContext';

const stepLabels = ['Game', 'Format', 'Starter Deck', 'Preview'];

export const Sidebar: React.FC = () => {
  const { view, setView, activeRun, newRunStep, setNewRunStep, setPendingStarterDeck } = useRun();
  const { games, selectedGame, selectedFormat, formats } = useFormat();
  const { cardCount, recentHoveredCards } = useUI();

  const currentGame = games.find(g => g.id === selectedGame);
  const currentFormat = formats.find(f => f.id === selectedFormat);

  return (
    <div className="w-64 border-r border-border bg-surface h-screen flex flex-col shrink-0 z-50 shadow-2xl">
      {/* Branding */}
      <div className="p-6 border-b border-border bg-white/[0.02]">
        <h1 className="text-2xl font-black italic tracking-tighter text-primary">DUELPATH</h1>
        <p className="text-[9px] font-bold text-text-muted uppercase tracking-[0.2em] mt-1">Rogue-lite Engine</p>
      </div>

      {/* Navigation */}
      <div className="p-4 border-b border-border">
        <div className="grid grid-cols-1 gap-1">
          <button
            onClick={() => {
              if (activeRun) {
                setView('run-hub');
              } else if (view !== 'starter-selection') {
                setNewRunStep(1);
                setPendingStarterDeck(null);
                setView('starter-selection');
              }
            }}
            className={`text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest border transition-all ${
              view === 'starter-selection' || view === 'run-hub'
                ? 'bg-primary text-black border-primary'
                : 'bg-background border-border text-text-muted hover:border-text-muted/50'
            }`}
          >
            {activeRun ? 'Resume Run' : 'New Run'}
          </button>
          <button
            onClick={() => setView('compendium')}
            className={`text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest border transition-all ${
              view === 'compendium'
                ? 'bg-white text-black border-white'
                : 'bg-background border-border text-text-muted hover:border-text-muted/50'
            }`}
          >
            Compendium
          </button>
        </div>
      </div>

      {/* View-specific content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-5">

        {/* Wizard Progress — starter-selection only */}
        {view === 'starter-selection' && (
          <section>
            <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest border-l-2 border-sky-500/50 pl-2 mb-3">
              Wizard Progress
            </h3>
            <div className="space-y-0.5">
              {stepLabels.map((label, i) => {
                const stepNum = i + 1;
                const isDone = stepNum < newRunStep;
                const isCurrent = stepNum === newRunStep;
                return (
                  <div
                    key={label}
                    className={`flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider border-l-2 transition-all ${
                      isCurrent
                        ? 'border-primary bg-primary/[0.03] text-white'
                        : isDone
                          ? 'border-emerald-500/50 text-emerald-400'
                          : 'border-border text-text-muted/40'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 flex items-center justify-center text-[8px] font-black border ${
                        isDone
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : isCurrent
                            ? 'bg-primary/20 border-primary text-primary'
                            : 'bg-black/20 border-border text-text-muted/40'
                      }`}
                    >
                      {isDone ? '\u2713' : stepNum}
                    </span>
                    {label}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Run Status — run-hub only */}
        {view === 'run-hub' && activeRun && (
          <section>
            <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest border-l-2 border-rose-500/50 pl-2 mb-2">
              Run Status
            </h3>
            <div className="bg-black/20 border border-border p-3 space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted uppercase tracking-wider">Game</span>
                <span className="text-white font-bold">{currentGame?.name || activeRun.gameId.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted uppercase tracking-wider">Floor</span>
                <span className="text-rose-400 font-black">{activeRun.floor}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted uppercase tracking-wider">Deck</span>
                <span className="text-white font-bold">{activeRun.currentDeck.length} cards</span>
              </div>
            </div>
          </section>
        )}

        {/* Card Pool — visible in compendium and run-hub */}
        {(view === 'compendium' || view === 'run-hub') && (
          <section>
            <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest border-l-2 border-primary/50 pl-2 mb-2">
              Card Pool
            </h3>
            <div className="bg-black/20 border border-border p-3 space-y-1.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted uppercase tracking-wider">Game</span>
                <span className="text-white font-bold">{currentGame?.name || selectedGame.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted uppercase tracking-wider">Format</span>
                <span className="text-white font-bold">{currentFormat?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-text-muted uppercase tracking-wider">Cards</span>
                <span className="text-primary font-black">{cardCount} loaded</span>
              </div>
            </div>
          </section>
        )}

        {/* Recently Viewed — all views */}
        {recentHoveredCards.length > 0 && (
          <section>
            <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest border-l-2 border-amber-500/50 pl-2 mb-2">
              Recently Viewed
            </h3>
            <div className="space-y-1">
              {recentHoveredCards.map(card => (
                <div
                  key={card.id}
                  className="flex items-center gap-2 px-3 py-2 bg-black/20 border border-border text-[10px]"
                >
                  <div className="w-8 h-[12px] bg-black/40 shrink-0 overflow-hidden border border-border/50">
                    {card.imageUrl && <img src={card.imageUrl} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate uppercase tracking-tight">{card.name}</p>
                    <p className="text-text-muted/60 text-[8px] uppercase tracking-wider">{card.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* User badge */}
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