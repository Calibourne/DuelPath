import React, { useState, useEffect } from 'react';
import { useFormat } from '../context/FormatContext';
import { Card } from '../types/index';
import { CardItem } from './CardItem';
import { FilterPanel } from './FilterPanel';

export const CardGrid: React.FC = () => {
  const { selectedGame, selectedFormat, formats, loading: formatsLoading } = useFormat();
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [attrFilters, setAttrFilters] = useState<any>({});
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 50;

  const activeFormat = formats.find(f => f.id === selectedFormat);

  // Reset filters when game changes
  useEffect(() => {
    setSearchQuery('');
    setSelectedTypes([]);
    setAttrFilters({});
    setOffset(0);
    setHasMore(true);
  }, [selectedGame]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCards = async (reset: boolean = false) => {
    const newOffset = reset ? 0 : offset;
    setLoading(true);
    
    const params = new URLSearchParams({
      limit: PAGE_SIZE.toString(),
      offset: newOffset.toString(),
      search: debouncedSearch,
    });

    // Add multiple types to query params
    selectedTypes.forEach(t => params.append('types', t));

    // Add dynamic attribute filters
    if (Object.keys(attrFilters).length > 0) {
      params.append('attributes', JSON.stringify(attrFilters));
    }

    try {
      const res = await fetch(`/api/games/${selectedGame}/cards?${params}`);
      const data = await res.json();
      
      if (reset) {
        setCards(data);
      } else {
        setCards(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === PAGE_SIZE);
      setOffset(newOffset + data.length);
    } catch (err) {
      console.error('❌ [UI] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards(true);
  }, [selectedGame, debouncedSearch, selectedTypes, attrFilters]);

  if (formatsLoading && cards.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted animate-pulse">
        Loading Library...
      </div>
    );
  }

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Grid Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-background/30 overflow-hidden">
        <header className="p-4 border-b border-border bg-surface/50 backdrop-blur-sm flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold leading-tight">{activeFormat?.name || 'Library'}</h2>
            <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">
              {cards.length} Cards Loaded
            </p>
          </div>
          <div className="text-[10px] text-text-muted/60 font-mono hidden sm:block">
            {selectedGame.toUpperCase()} // {selectedFormat?.toUpperCase() || 'NONE'}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
            {cards.map(card => (
              <CardItem key={card.id} card={card} format={activeFormat} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center py-8">
              <button
                onClick={() => fetchCards(false)}
                disabled={loading}
                className="px-8 py-2 bg-surface border border-border rounded-none hover:bg-border text-[11px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}

          {!loading && cards.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-normal text-text-muted">
              No cards found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Right Filter Sidebar (The "EDOPro" Panel) */}
      <FilterPanel 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedTypes={selectedTypes}
        setSelectedTypes={setSelectedTypes}
        attrFilters={attrFilters}
        setAttrFilters={setAttrFilters}
      />
    </div>
  );
};
