import React, { useState, useEffect } from 'react';
import { useFormat } from '../context/FormatContext';
import { useRun } from '../context/RunContext';
import { useUI } from '../context/UIContext';
import { GameId, StarterDeck, Card } from '../types';
import { YDK } from '../../../core/utils/ydk';
import { MTGArena } from '../../../core/utils/mtgArena';

/** 1. Game Selection Screen */
const GameSelect: React.FC = () => {
  const { games, setSelectedGame } = useFormat();
  const { setNewRunStep } = useRun();

  const handleSelect = (id: string) => {
    setSelectedGame(id as GameId);
    setNewRunStep(2);
  };

  const gameThemes: Record<string, { color: string; accent: string; desc: string }> = {
    yugioh: { 
      color: 'hover:border-orange-500', 
      accent: 'text-orange-500', 
      desc: 'Master the arts of Fusion, Synchro, and Xyz in the ultimate dueling arena.' 
    },
    mtg: { 
      color: 'hover:border-sky-500', 
      accent: 'text-sky-500', 
      desc: 'Wield the five colors of mana to cast world-shaking spells and creatures.' 
    },
    pokemon: { 
      color: 'hover:border-yellow-400', 
      accent: 'text-yellow-400', 
      desc: 'Evolve your team and harness elemental energy to claim victory.' 
    },
    hearthstone: { 
      color: 'hover:border-purple-500', 
      accent: 'text-purple-500', 
      desc: 'Strategic hero-based combat in the whimsical world of Azeroth.' 
    },
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto">
      <div className="text-center mb-16">
        <h2 className="text-6xl font-black italic tracking-tighter uppercase mb-4 text-white">Choose Your Realm</h2>
        <div className="h-1 w-32 bg-primary mx-auto"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {games.map(game => {
          const isComingSoon = ['pokemon', 'hearthstone'].includes(game.id);
          const theme = gameThemes[game.id] || { color: 'hover:border-primary', accent: 'text-primary', desc: '' };
          return (
            <button
              key={game.id}
              onClick={() => !isComingSoon && handleSelect(game.id)}
              disabled={isComingSoon}
              className={`relative flex flex-col items-start bg-surface border-2 border-border ${theme.color} p-10 transition-all group overflow-hidden h-72 ${
                isComingSoon ? 'opacity-40 grayscale cursor-not-allowed border-dashed' : ''
              }`}
            >
              <div className={`absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-white/[0.02] group-hover:scale-150 transition-transform duration-1000`}></div>
              {isComingSoon && (
                <div className="absolute top-6 right-6 px-3 py-1 bg-white/10 border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] z-20">
                  Coming Soon
                </div>
              )}
              <div className="relative z-10 flex flex-col h-full text-left">
                <h3 className={`text-4xl font-black italic tracking-tighter mb-4 transition-colors group-hover:text-white`}>
                  {game.name.toUpperCase()}
                </h3>
                <p className="text-xs text-text-muted font-medium leading-relaxed max-w-xs flex-1">
                  {theme.desc}
                </p>
                {!isComingSoon && (
                  <div className="flex items-center gap-2 mt-6">
                    <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${theme.accent}`}>Enter Universe</span>
                    <div className={`h-[1px] w-8 ${theme.accent.replace('text-', 'bg-')} group-hover:w-16 transition-all duration-500`}></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/** 2. Format Selection Screen */
const FormatSelect: React.FC = () => {
  const { formats, selectedGame, setSelectedFormat } = useFormat();
  const { setNewRunStep } = useRun();

  const handleSelect = (id: string) => {
    setSelectedFormat(id);
    setNewRunStep(3);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 overflow-y-auto text-text">
      <div className="mb-12 text-center">
        <button onClick={() => setNewRunStep(1)} className="text-[10px] font-black text-primary hover:underline mb-4 tracking-widest uppercase">← Back to Realms</button>
        <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white">Choose Your Era</h2>
        <p className="text-text-muted font-bold tracking-[0.2em] mt-2 uppercase">{selectedGame} Timeline</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {formats.map(format => (
          <button
            key={format.id}
            onClick={() => handleSelect(format.id)}
            className="bg-surface border-2 border-border hover:border-sky-500 p-8 text-left transition-all group"
          >
            <h3 className="text-xl font-black italic tracking-tight group-hover:text-sky-400 transition-colors text-white">{format.name.toUpperCase()}</h3>
            <p className="text-xs text-text-muted mt-2 leading-relaxed">{format.description || 'Standard rules and card pool apply.'}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

/** 3. Starter Deck Selection */
const StarterSelection: React.FC = () => {
  const { selectedGame, selectedFormat } = useFormat();
  const { setNewRunStep, setPendingStarterDeck } = useRun();
  const [decks, setDecks] = useState<StarterDeck[]>([]);
  const [loading, setLoading] = useState(true);
  const [coverCards, setCoverCards] = useState<Record<string, Card>>({});

  useEffect(() => {
    setLoading(true);
    fetch(`/api/games/${selectedGame}/formats/${selectedFormat}/starter-decks`)
      .then(res => res.json())
      .then(async (data: StarterDeck[]) => {
        setDecks(data);
        
        // Fetch all cover cards in a single batch request
        const names = data.map(d => d.coverCardName);
        if (names.length > 0) {
          const res = await fetch(`/api/games/${selectedGame}/cards/by-names`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names })
          });
          const cards: Card[] = await res.json();
          
          const cardMap: Record<string, Card> = {};
          data.forEach(deck => {
            const found = cards.find(c => c.name === deck.coverCardName);
            if (found) cardMap[deck.id] = found;
          });
          setCoverCards(cardMap);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedGame, selectedFormat]);

  if (loading) return <div className="flex-1 flex items-center justify-center text-text-muted animate-pulse font-black uppercase tracking-widest italic">Synchronizing Class Data...</div>;

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-background/50 text-text">
      <div className="mb-12 text-center">
        <button onClick={() => setNewRunStep(2)} className="text-[10px] font-black text-primary hover:underline mb-4 tracking-widest uppercase">← Back to Eras</button>
        <h2 className="text-5xl font-black italic tracking-tighter uppercase text-white">Choose Your Class</h2>
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {decks.map((deck) => (
          <div key={deck.id} onClick={() => { setPendingStarterDeck(deck); setNewRunStep(4); }} className="group flex flex-col bg-surface border border-border hover:border-primary transition-all cursor-pointer overflow-hidden shadow-2xl">
            <div className="h-64 relative overflow-hidden bg-black/40">
              {coverCards[deck.id]?.imageUrl && <img src={coverCards[deck.id].imageUrl} alt={deck.name} className="w-full h-full object-cover object-top opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
            </div>
            <div className="p-6 space-y-4 flex-1 flex flex-col relative z-10 text-left">
              <h3 className="text-xl font-black tracking-tight text-primary group-hover:text-primary-light transition-colors">{deck.name}</h3>
              <p className="text-sm text-text italic leading-relaxed flex-1">{deck.description}</p>
            </div>
            <div className="p-4 bg-white/[0.02] border-t border-border group-hover:bg-primary transition-all">
              <span className="text-[11px] font-black tracking-[0.3em] uppercase w-full block text-center group-hover:text-black">INSPECT ARSENAL</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/** 4. Deck Preview Screen */
export const DeckPreview: React.FC = () => {
  const { pendingStarterDeck, setNewRunStep, startRun } = useRun();
  const { selectedGame, formats, selectedFormat } = useFormat();
  const { setHoveredCard } = useUI();
  const [mainCards, setMainCards] = useState<{ card: Card; count: number }[]>([]);
  const [extraCards, setExtraCards] = useState<{ card: Card; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pendingStarterDeck) return;
    const fetchDeckDetails = async () => {
      setLoading(true);
      try {
        const fetchBatch = async (deckCards: { name: string; count: number }[]) => {
          const names = deckCards.map(c => c.name);
          const res = await fetch(`/api/games/${selectedGame}/cards/by-names`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ names })
          });
          const details: Card[] = await res.json();
          return deckCards.map(c => ({
            card: details.find(d => d.name === c.name)!,
            count: c.count
          })).filter(item => item.card);
        };

        const main = await fetchBatch(pendingStarterDeck.cards);
        setMainCards(main);

        if (pendingStarterDeck.extraDeck && pendingStarterDeck.extraDeck.length > 0) {
          const extra = await fetchBatch(pendingStarterDeck.extraDeck);
          setExtraCards(extra);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchDeckDetails();
  }, [pendingStarterDeck, selectedGame]);

  if (!pendingStarterDeck) return null;

  const mainTotal = pendingStarterDeck.cards.reduce((sum, c) => sum + c.count, 0);
  const extraTotal = pendingStarterDeck.extraDeck?.reduce((sum, c) => sum + c.count, 0) || 0;

  // Calculate total points for formats like Genesys
  const activeFormat = formats.find(f => f.id === selectedFormat);
  const calculatePoints = () => {
    if (!activeFormat?.rules.maxPoints) return null;
    
    let total = 0;
    mainCards.forEach(({ card, count }) => {
      const p = (activeFormat.rules.cardPoints?.[card.id] ?? 0) + (activeFormat.rules.cardPointsByName?.[card.name] ?? 0);
      total += p * count;
    });
    extraCards.forEach(({ card, count }) => {
      const p = (activeFormat.rules.cardPoints?.[card.id] ?? 0) + (activeFormat.rules.cardPointsByName?.[card.name] ?? 0);
      total += p * count;
    });
    return total;
  };

  const totalPoints = calculatePoints();

  const handleExport = () => {
    if (!pendingStarterDeck) return;
    
    let content = '';
    let fileName = `${pendingStarterDeck.name.replace(/\s+/g, '_')}`;
    let extension = 'txt';

    if (selectedGame === 'yugioh') {
      const mainIds = mainCards.flatMap(item => Array(item.count).fill(parseInt(item.card.id)));
      const extraIds = extraCards.flatMap(item => Array(item.count).fill(parseInt(item.card.id)));
      content = YDK.encode(mainIds, extraIds);
      extension = 'ydk';
    } else {
      content = MTGArena.encode(
        mainCards.map(i => ({ name: i.card.name, count: i.count })),
        extraCards.map(i => ({ name: i.card.name, count: i.count }))
      );
      extension = 'txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#050505] text-text">
      <header className="p-8 pb-6 border-b border-border bg-surface/50 backdrop-blur-md flex justify-between items-center shrink-0">
        <div className="text-left">
          <button onClick={() => setNewRunStep(3)} className="text-[10px] font-black text-primary hover:text-white mb-4 tracking-[0.2em] uppercase transition-colors">← Back to Selection</button>
          <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-none text-white">{pendingStarterDeck.name}</h2>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Arsenal Visualized</span>
            {totalPoints !== null && (
              <>
                <div className="h-[1px] w-6 bg-primary/30"></div>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-2 py-0.5 border ${totalPoints > (activeFormat?.rules.maxPoints || 0) ? 'text-red-500 border-red-500/30 bg-red-500/10' : 'text-emerald-500 border-emerald-500/30 bg-emerald-500/10'}`}>
                  {totalPoints} / {activeFormat?.rules.maxPoints} Points
                </span>
              </>
            )}
            <div className="h-[1px] w-12 bg-primary/30"></div>
            <span className="text-[10px] font-bold text-text-muted uppercase">Archetype: {pendingStarterDeck.id.split('-').pop()?.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="px-8 py-4 border border-border text-text-muted font-black text-[10px] uppercase tracking-[0.2em] hover:text-white hover:border-text-muted transition-all active:scale-95"
          >
            Export {selectedGame === 'yugioh' ? '.YDK' : 'List'}
          </button>
          <button 
            onClick={() => startRun(pendingStarterDeck)}
            disabled={totalPoints !== null && totalPoints > (activeFormat?.rules.maxPoints || 0)}
            className="px-10 py-4 bg-primary text-black font-black italic text-lg uppercase tracking-tighter hover:bg-white hover:scale-105 transition-all disabled:opacity-50 disabled:grayscale"
          >
            Initiate Run
          </button>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-7xl mx-auto space-y-12">
          <section>
            <div className="flex justify-between items-end mb-6 border-b border-border/50 pb-2">
              <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.5em]">Main Deck</h3>
              <div className="bg-orange-600/10 border border-orange-600/30 px-3 py-1 text-orange-500 text-[10px] font-black uppercase tracking-widest">Total: {mainTotal}</div>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
              {loading ? [...Array(10)].map((_, i) => <div key={i} className="aspect-[2/3] bg-surface animate-pulse border border-border" />) : mainCards.map(({ card, count }, i) => (
                <div 
                  key={i} 
                  className="relative group flex flex-col cursor-crosshair"
                  onMouseEnter={() => setHoveredCard(card)}
                >
                  <div className="aspect-[2/3] relative bg-black border border-border/50 group-hover:border-primary transition-all">
                    <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                    <div className="absolute -top-1 -right-1 bg-primary text-black text-[10px] font-black w-5 h-5 flex items-center justify-center shadow-lg">{count}</div>
                    
                    {/* Points Overlay for Genesys */}
                    {selectedFormat === 'genesys' && (
                      <div className="absolute bottom-1 left-1 bg-emerald-600/90 text-white text-[8px] font-black px-1 rounded-sm shadow-sm">
                        {(activeFormat?.rules.cardPoints?.[card.id] ?? 0) + (activeFormat?.rules.cardPointsByName?.[card.name] ?? 0)} Pts
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
          {extraTotal > 0 && (
            <section>
              <div className="flex justify-between items-end mb-6 border-b border-border/50 pb-2">
                <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.5em]">Extra Deck</h3>
                <div className="bg-sky-600/10 border border-sky-600/30 px-3 py-1 text-sky-500 text-[10px] font-black uppercase tracking-widest">Total: {extraTotal}</div>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
                {loading ? [...Array(5)].map((_, i) => <div key={i} className="aspect-[2/3] bg-surface animate-pulse border border-border" />) : extraCards.map(({ card, count }, i) => (
                  <div 
                    key={i} 
                    className="relative group flex flex-col text-center cursor-crosshair"
                    onMouseEnter={() => setHoveredCard(card)}
                  >
                    <div className="aspect-[2/3] relative bg-black border border-border/50 group-hover:border-sky-400 transition-all">
                      <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                      <div className="absolute -top-1 -right-1 bg-sky-500 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center shadow-lg">{count}</div>
                      
                      {/* Points Overlay for Genesys */}
                      {selectedFormat === 'genesys' && (
                        <div className="absolute bottom-1 left-1 bg-emerald-600/90 text-white text-[8px] font-black px-1 rounded-sm shadow-sm">
                          {(activeFormat?.rules.cardPoints?.[card.id] ?? 0) + (activeFormat?.rules.cardPointsByName?.[card.name] ?? 0)} Pts
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export const NewRunWizard: React.FC = () => {
  const { newRunStep } = useRun();
  switch (newRunStep) {
    case 1: return <GameSelect />;
    case 2: return <FormatSelect />;
    case 3: return <StarterSelection />;
    case 4: return <DeckPreview />;
    default: return <GameSelect />;
  }
};
