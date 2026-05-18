import React from 'react';
import { useFormat } from '../context/FormatContext';
import { YgoFilterPanel } from './filters/YgoFilterPanel';
import { MtgFilterPanel } from './filters/MtgFilterPanel';
import { GameId } from '../types';

interface FilterPanelProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  attrFilters: any;
  setAttrFilters: (filters: any) => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  searchQuery,
  setSearchQuery,
  selectedTypes,
  setSelectedTypes,
  attrFilters,
  setAttrFilters,
}) => {
  const { games, formats, selectedGame, selectedFormat, setSelectedGame, setSelectedFormat } = useFormat();

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setAttrFilters({});
  };

  return (
    <div className="w-[320px] border-l border-border bg-surface h-full flex flex-col shrink-0 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-border bg-white/[0.02] flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-wider uppercase text-text">Card Filters</h2>
        <button
          onClick={clearFilters}
          className="text-[10px] font-bold text-primary hover:text-primary-light transition-colors px-2 py-1 border border-primary/20 hover:border-primary/50"
        >
          RESET
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-8 pb-10">
        {/* Game & Format Selection Area */}
        <section className="bg-white/[0.03] border border-border p-4 rounded-sm space-y-4">
          <div className="flex flex-col gap-3">
            {/* Game Segmented Control */}
            <div className="grid grid-cols-2 p-1 bg-black/40 border border-border/50 rounded-none">
              {games
                .filter(game => !['pokemon', 'hearthstone'].includes(game.id))
                .map(game => (
                  <button
                    key={game.id}
                    onClick={() => setSelectedGame(game.id as GameId)}
                    className={`py-2 text-[10px] font-black transition-all ${
                      selectedGame === game.id 
                        ? game.id === 'yugioh' 
                          ? 'bg-orange-600 text-white shadow-[0_0_10px_rgba(234,88,12,0.3)]' 
                          : 'bg-primary text-black shadow-[0_0_10px_rgba(0,212,170,0.3)]'
                        : 'text-text-muted/60 hover:text-text hover:bg-white/5'
                    }`}
                  >
                    {game.name.toUpperCase()}
                  </button>
                ))}
            </div>

            {/* Format Custom Dropdown */}
            {formats.length > 0 && (
              <div className="relative group">
                <select 
                  value={selectedFormat || ''} 
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="w-full bg-background border border-border/80 px-3 py-2.5 text-[11px] font-bold text-text focus:border-sky-500 outline-none appearance-none cursor-pointer hover:bg-white/[0.04] transition-all pl-10"
                >
                  {formats.map(format => (
                    <option key={format.id} value={format.id} className="bg-surface text-text">
                      {format.name.toUpperCase()}
                    </option>
                  ))}
                </select>
                <div className="absolute left-3 top-3 pointer-events-none text-sky-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="m17 17-5 5-5-5"/><path d="m7 7 5-5 5 5"/></svg>
                </div>
                <div className="absolute right-3 top-3.5 pointer-events-none text-text-muted/40 group-hover:text-text-muted transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Search Section */}
        <section className="space-y-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-none pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-text-muted/60 font-medium text-text"
            />
            <div className="absolute left-3.5 top-3 text-text-muted/80">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-1">
            <span className="text-[10px] text-text-muted font-bold"><span className="text-primary">$</span> Name</span>
            <span className="text-[10px] text-text-muted font-bold"><span className="text-primary">@</span> Effect</span>
            <span className="text-[10px] text-text-muted font-bold"><span className="text-primary">!!</span> Not</span>
            <span className="text-[10px] text-text-muted font-bold"><span className="text-primary">||</span> Or</span>
          </div>
        </section>

        {/* Dynamic Game Filters */}
        <div className="space-y-8">
          {selectedGame === 'yugioh' && (
            <YgoFilterPanel 
              selectedTypes={selectedTypes} 
              setSelectedTypes={setSelectedTypes}
              attrFilters={attrFilters}
              setAttrFilters={setAttrFilters}
            />
          )}
          {selectedGame === 'mtg' && (
            <MtgFilterPanel 
              selectedTypes={selectedTypes} 
              setSelectedTypes={setSelectedTypes}
              attrFilters={attrFilters}
              setAttrFilters={setAttrFilters}
            />
          )}
          {selectedGame !== 'yugioh' && selectedGame !== 'mtg' && (
            <div className="text-[10px] text-text-muted italic uppercase tracking-widest text-center py-10 opacity-30">
              Advanced filters coming soon
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
