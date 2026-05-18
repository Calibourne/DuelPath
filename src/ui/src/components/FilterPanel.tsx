import React, { useState, useMemo, useRef } from 'react';
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

interface ActiveFilter {
  label: string;
  onRemove: () => void;
  color: string;
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
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
    setAttrFilters({});
    searchRef.current?.focus();
  };

  const activeFilters = useMemo<ActiveFilter[]>(() => {
    const filters: ActiveFilter[] = [];

    if (searchQuery) {
      filters.push({
        label: `"${searchQuery}"`,
        onRemove: () => setSearchQuery(''),
        color: 'bg-primary/20 text-primary border-primary/40',
      });
    }

    selectedTypes.forEach(type => {
      filters.push({
        label: type,
        onRemove: () => setSelectedTypes(selectedTypes.filter(t => t !== type)),
        color: 'bg-sky-500/20 text-sky-400 border-sky-500/40',
      });
    });

    // MTG
    if (attrFilters.colors?.length) {
      filters.push({
        label: `Colors: ${attrFilters.colors.join('')}`,
        onRemove: () => setAttrFilters({ ...attrFilters, colors: undefined }),
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      });
    }
    if (attrFilters.cmc?.exact !== undefined) {
      filters.push({
        label: `CMC: ${attrFilters.cmc.exact}`,
        onRemove: () => setAttrFilters({ ...attrFilters, cmc: undefined }),
        color: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
      });
    }
    if (attrFilters.cmc?.min !== undefined) {
      filters.push({
        label: `CMC: ${attrFilters.cmc.min}+`,
        onRemove: () => setAttrFilters({ ...attrFilters, cmc: undefined }),
        color: 'bg-teal-500/20 text-teal-400 border-teal-500/40',
      });
    }
    if (attrFilters.power?.min !== undefined || attrFilters.power?.max !== undefined) {
      const p = attrFilters.power;
      const lbl = p.min !== undefined && p.max !== undefined
        ? `Pow: ${p.min}-${p.max}`
        : p.min !== undefined ? `Pow: ${p.min}+` : `Pow: <=${p.max}`;
      filters.push({ label: lbl, onRemove: () => setAttrFilters({ ...attrFilters, power: undefined }), color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' });
    }
    if (attrFilters.toughness?.min !== undefined || attrFilters.toughness?.max !== undefined) {
      const t = attrFilters.toughness;
      const lbl = t.min !== undefined && t.max !== undefined
        ? `Tgh: ${t.min}-${t.max}`
        : t.min !== undefined ? `Tgh: ${t.min}+` : `Tgh: <=${t.max}`;
      filters.push({ label: lbl, onRemove: () => setAttrFilters({ ...attrFilters, toughness: undefined }), color: 'bg-rose-500/20 text-rose-400 border-rose-500/40' });
    }

    // YGO
    if (attrFilters.attribute) {
      filters.push({
        label: `Attr: ${attrFilters.attribute}`,
        onRemove: () => setAttrFilters({ ...attrFilters, attribute: undefined }),
        color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      });
    }
    if (attrFilters.atk?.min !== undefined || attrFilters.atk?.max !== undefined) {
      const a = attrFilters.atk;
      const lbl = a.min !== undefined && a.max !== undefined
        ? `ATK: ${a.min}-${a.max}`
        : a.min !== undefined ? `ATK: ${a.min}+` : `ATK: <=${a.max}`;
      filters.push({ label: lbl, onRemove: () => setAttrFilters({ ...attrFilters, atk: undefined }), color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' });
    }
    if (attrFilters.def?.min !== undefined || attrFilters.def?.max !== undefined) {
      const d = attrFilters.def;
      const lbl = d.min !== undefined && d.max !== undefined
        ? `DEF: ${d.min}-${d.max}`
        : d.min !== undefined ? `DEF: ${d.min}+` : `DEF: <=${d.max}`;
      filters.push({ label: lbl, onRemove: () => setAttrFilters({ ...attrFilters, def: undefined }), color: 'bg-orange-500/20 text-orange-400 border-orange-500/40' });
    }
    if (attrFilters.level?.exact !== undefined) {
      filters.push({ label: `Lv: ${attrFilters.level.exact}`, onRemove: () => setAttrFilters({ ...attrFilters, level: undefined }), color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' });
    }
    if (attrFilters.race) {
      filters.push({ label: `Race: ${attrFilters.race}`, onRemove: () => setAttrFilters({ ...attrFilters, race: undefined }), color: 'bg-blue-500/20 text-blue-400 border-blue-500/40' });
    }

    return filters;
  }, [searchQuery, selectedTypes, attrFilters]);

  const activeFormat = formats.find(f => f.id === selectedFormat);
  const activeCount = activeFilters.length;

  return (
    <div className="w-[320px] border-l border-border bg-surface h-full flex flex-col shrink-0 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[10px] font-black tracking-wider uppercase text-text">Filters</h2>
          {activeCount > 0 && (
            <span className="text-[9px] font-bold text-primary tracking-wider">{activeCount} active</span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-[9px] font-bold text-primary hover:text-primary-light transition-colors px-2 py-1 border border-primary/20 hover:border-primary/50"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Active Filters Bar */}
      {activeCount > 0 && (
        <div className="px-4 py-2 bg-primary/[0.02] border-b border-primary/10 shrink-0">
          <div className="flex flex-wrap gap-1">
            {activeFilters.map((f, i) => (
              <span
                key={i}
                onClick={f.onRemove}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider border cursor-pointer hover:brightness-125 transition-all leading-none ${f.color}`}
              >
                {f.label}
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-5 pb-10">
        {/* Game & Format */}
        <div className="space-y-2.5">
          <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest border-l-2 border-sky-500/50 pl-2">Game & Format</span>
          <div className="grid grid-cols-2 p-0.5 bg-black/40">
            {games
              .filter(game => !['pokemon', 'hearthstone'].includes(game.id))
              .map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id as GameId)}
                  className={`py-2 text-[10px] font-black transition-all ${
                    selectedGame === game.id
                      ? game.id === 'yugioh'
                        ? 'bg-orange-600 text-white'
                        : 'bg-primary text-black'
                      : 'text-text-muted/60 hover:text-text hover:bg-white/5'
                  }`}
                >
                  {game.name.toUpperCase()}
                </button>
              ))}
          </div>

          {formats.length > 0 && (
            <div className="relative group">
              <select
                value={selectedFormat || ''}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full bg-background border border-border/80 px-3 py-2 text-[11px] font-bold text-text focus:border-sky-500 outline-none appearance-none cursor-pointer hover:bg-white/[0.04] transition-all pl-8"
              >
                {formats.map(format => (
                  <option key={format.id} value={format.id}>{format.name.toUpperCase()}</option>
                ))}
              </select>
              <div className="absolute left-2.5 top-2.5 pointer-events-none text-sky-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20" />
                  <path d="m17 17-5 5-5-5" />
                  <path d="m7 7 5-5 5 5" />
                </svg>
              </div>
              <div className="absolute right-2.5 top-3 pointer-events-none text-text-muted/40 group-hover:text-text-muted transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          )}

          {activeFormat && activeFormat.description && (
            <p className="text-[9px] text-text-muted/60 italic leading-relaxed">{activeFormat.description}</p>
          )}
        </div>

        {/* Search */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest border-l-2 border-primary/50 pl-2">Search</span>
            <span className="text-[8px] text-text-muted/30 font-bold uppercase tracking-wider">$name @text !!not ||or</span>
          </div>
          <div className={`relative border transition-all duration-200 ${searchFocused ? 'border-primary shadow-[0_0_15px_rgba(0,212,170,0.12)]' : 'border-border'}`}>
            <input
              ref={searchRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full bg-background pl-8 pr-[26px] py-2 text-xs focus:outline-none placeholder:text-text-muted/50 font-medium text-text"
            />
            <div className={`absolute left-2.5 top-2.5 transition-colors duration-200 ${searchFocused ? 'text-primary' : 'text-text-muted/50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); searchRef.current?.focus(); }}
                className="absolute right-2 top-2.5 text-text-muted/40 hover:text-text-muted transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Card Attributes */}
        <div className="space-y-5">
          <span className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest border-l-2 border-amber-500/50 pl-2">Card Attributes</span>
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