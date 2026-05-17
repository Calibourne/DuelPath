import React from 'react';
import { useFormat } from '../context/FormatContext';
import { YgoFilterPanel } from './filters/YgoFilterPanel';
import { MtgFilterPanel } from './filters/MtgFilterPanel';

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
  const { selectedGame } = useFormat();

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setAttrFilters({});
  };

  return (
    <div className="w-[320px] border-l border-border bg-surface h-full flex flex-col shrink-0 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-3 border-b border-border bg-white/[0.02] flex items-center justify-between">
        <h2 className="text-[10px] font-black tracking-widest uppercase text-text-muted">Card Filters</h2>
        <button
          onClick={clearFilters}
          className="text-[10px] font-bold text-primary hover:text-primary-light transition-colors px-2 py-1"
        >
          RESET
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-8 pb-10">
        {/* Search Section */}
        <section className="space-y-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-none pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-muted/40 font-medium"
            />
            <div className="absolute left-3 top-2.5 text-text-muted/40">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            <span className="text-[9px] text-text-muted/50 font-bold"><span className="text-primary">$</span> Name</span>
            <span className="text-[9px] text-text-muted/50 font-bold"><span className="text-primary">@</span> Effect</span>
            <span className="text-[9px] text-text-muted/50 font-bold"><span className="text-primary">!!</span> Not</span>
            <span className="text-[9px] text-text-muted/50 font-bold"><span className="text-primary">||</span> Or</span>
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
