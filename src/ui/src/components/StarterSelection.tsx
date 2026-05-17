import React, { useState, useEffect } from 'react';
import { useFormat } from '../context/FormatContext';
import { useRun } from '../context/RunContext';
import { StarterDeck, Card } from '../types';

export const StarterSelection: React.FC = () => {
  const { selectedGame, selectedFormat } = useFormat();
  const { startRun, setView } = useRun();
  const [decks, setDecks] = useState<StarterDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverCards, setCoverCards] = useState<Record<string, Card>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/games/${selectedGame}/formats/${selectedFormat}/starter-decks`)
      .then(res => res.json())
      .then(async (data: StarterDeck[]) => {
        setDecks(data);
        
        // Fetch cover card details for each deck to get images
        const cardMap: Record<string, Card> = {};
        for (const deck of data) {
          const res = await fetch(`/api/games/${selectedGame}/cards?search=$${encodeURIComponent(deck.coverCardName)}&limit=1`);
          const cards = await res.json();
          if (cards.length > 0) {
            cardMap[deck.id] = cards[0];
          }
        }
        setCoverCards(cardMap);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedGame, selectedFormat]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center text-text-muted animate-pulse font-black uppercase tracking-widest">Identifying Starter Decks...</div>;
  }

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-background/50">
      <header className="mb-12 text-center">
        <h2 className="text-4xl font-black italic tracking-tighter mb-2">CHOOSE YOUR STARTING DECK</h2>
        <p className="text-text-muted text-sm uppercase tracking-widest font-bold">Select an archetype to begin your run</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {decks.map((deck) => (
          <div 
            key={deck.id}
            className="group relative flex flex-col bg-surface border border-border hover:border-primary transition-all cursor-pointer overflow-hidden shadow-2xl"
            onClick={() => startRun(deck)}
          >
            {/* Background Image / Cover Card */}
            <div className="h-64 relative overflow-hidden bg-black/40">
              {coverCards[deck.id]?.imageUrl ? (
                <img 
                  src={coverCards[deck.id].imageUrl} 
                  alt={deck.name}
                  className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 grayscale-[0.5] group-hover:grayscale-0"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted italic text-xs uppercase font-bold tracking-widest">No Card Art Found</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 flex-1 flex flex-col relative z-10">
              <div>
                <h3 className="text-xl font-black tracking-tight text-primary group-hover:text-primary-light transition-colors">{deck.name}</h3>
                <p className="text-xs text-text-muted font-bold uppercase tracking-wider mb-2">Class: {coverCards[deck.id]?.type || 'Specialist'}</p>
              </div>
              
              <p className="text-sm text-text italic leading-relaxed flex-1">{deck.description}</p>

              <div className="pt-4 border-t border-border/50">
                <h4 className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-2">Key Components</h4>
                <div className="flex flex-wrap gap-1">
                  {deck.cards.slice(0, 4).map(c => (
                    <span key={c.name} className="px-2 py-0.5 bg-background border border-border text-[9px] font-bold text-text-muted/80">{c.name}</span>
                  ))}
                  {deck.cards.length > 4 && <span className="text-[9px] font-bold text-text-muted/40">+{deck.cards.length - 4} more</span>}
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="p-4 bg-white/[0.02] border-t border-border group-hover:bg-primary transition-all">
              <span className="text-[11px] font-black tracking-[0.3em] uppercase w-full block text-center group-hover:text-black transition-all">
                INITIATE RUN
              </span>
            </div>
          </div>
        ))}

        {decks.length === 0 && (
          <div className="col-span-full py-32 border-2 border-dashed border-border flex flex-col items-center justify-center space-y-4 rounded-none bg-surface/30">
            <p className="text-text-muted font-black uppercase tracking-[0.2em] italic">No starter decks found for this format</p>
            <button 
              onClick={() => setView('compendium')}
              className="px-6 py-2 bg-primary text-black font-black text-xs uppercase tracking-widest hover:bg-primary-light transition-all"
            >
              Browse Compendium
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
