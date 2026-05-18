import React from 'react';

interface MtgFilters {
  power?: { min?: number; max?: number };
  toughness?: { min?: number; max?: number };
  colors?: string[];
  cmc?: { exact?: number; min?: number; max?: number };
}

interface MtgFilterPanelProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  attrFilters: MtgFilters;
  setAttrFilters: (filters: MtgFilters) => void;
}

export const MtgFilterPanel: React.FC<MtgFilterPanelProps> = ({
  selectedTypes,
  setSelectedTypes,
  attrFilters,
  setAttrFilters,
}) => {
  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
    }
  };

  const updateAttr = (key: keyof MtgFilters, value: any) => {
    setAttrFilters({ ...attrFilters, [key]: value });
  };

  const toggleColor = (color: string) => {
    const current = attrFilters.colors || [];
    if (current.includes(color)) {
      updateAttr('colors', current.filter(c => c !== color));
    } else {
      updateAttr('colors', [...current, color]);
    }
  };

  const categories = ['Creature', 'Instant', 'Sorcery', 'Artifact', 'Enchantment', 'Land', 'Planeswalker'];
  const colors = [
    { id: 'W', name: 'White', color: 'bg-[#f9faf4] text-black border-[#d1d1b8]' },
    { id: 'U', name: 'Blue', color: 'bg-[#0e68ab] text-white border-[#31a5d6]' },
    { id: 'B', name: 'Black', color: 'bg-[#150b00] text-white border-[#444444]' },
    { id: 'R', name: 'Red', color: 'bg-[#d3202a] text-white border-[#f85555]' },
    { id: 'G', name: 'Green', color: 'bg-[#00733e] text-white border-[#22b14c]' },
  ];

  const isCreatureSelected = selectedTypes.includes('Creature');
  const showAll = selectedTypes.length === 0;

  return (
    <div className="space-y-10">
      {/* 1. Colors */}
      <section>
        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-4 px-1">Mana Identity</h3>
        <div className="flex justify-between px-2">
          {colors.map((c) => {
            const isSelected = (attrFilters.colors || []).includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleColor(c.id)}
                title={c.name}
                className={`w-11 h-11 rounded-full border-2 transition-all flex items-center justify-center text-[13px] font-black shadow-md ${c.color} ${
                  isSelected 
                    ? 'opacity-100 scale-110 ring-4 ring-primary/20 z-10 border-white' 
                    : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110 hover:border-white/50 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                }`}
              >
                {c.id}
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Categories */}
      <section>
        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-3 px-1">Card Categories</h3>
        <div className="grid grid-cols-2 gap-2">
          {categories.map((type) => {
            const isSelected = selectedTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`px-3 py-2.5 rounded-none text-[10px] font-bold border text-left transition-all ${
                  isSelected
                    ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(0,212,170,0.2)]'
                    : 'bg-background border-border text-text-muted hover:border-primary/50 hover:text-primary hover:bg-primary/5'
                }`}
              >
                {type.toUpperCase()}
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. CMC */}
      <section>
        <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-4 px-1 flex justify-between items-center">
          <span>Mana Value</span>
          {attrFilters.cmc?.exact !== undefined && <span className="text-primary font-mono text-xs">{attrFilters.cmc.exact}</span>}
        </h3>
        <div className="grid grid-cols-6 gap-1.5">
          {[...Array(11)].map((_, i) => (
            <button
              key={i}
              onClick={() => updateAttr('cmc', attrFilters.cmc?.exact === i ? undefined : { exact: i })}
              className={`h-8 flex items-center justify-center text-[11px] font-mono font-bold border transition-all ${
                attrFilters.cmc?.exact === i
                  ? 'bg-primary text-black border-primary scale-110 z-10'
                  : 'bg-background border-border text-text-muted/60 hover:text-primary hover:border-primary/50'
              }`}
            >
              {i}
            </button>
          ))}
          <button
            onClick={() => updateAttr('cmc', attrFilters.cmc?.min === 10 ? undefined : { min: 10 })}
            className={`h-8 flex items-center justify-center text-[11px] font-mono font-bold border transition-all ${
              attrFilters.cmc?.min === 10
                ? 'bg-primary text-black border-primary scale-110 z-10'
                : 'bg-background border-border text-text-muted/60 hover:text-primary hover:border-primary/50'
            }`}
          >
            10+
          </button>
        </div>
      </section>

      {/* 4. Power / Toughness */}
      {(showAll || isCreatureSelected) && (
        <section className="space-y-4">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider px-1">Combat Power</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-text-muted uppercase pl-1">Power</span>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={attrFilters.power?.min ?? ''}
                  onChange={(e) => updateAttr('power', { ...attrFilters.power, min: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-3 py-2 text-[11px] font-mono focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={attrFilters.power?.max ?? ''}
                  onChange={(e) => updateAttr('power', { ...attrFilters.power, max: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-3 py-2 text-[11px] font-mono focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-text-muted uppercase pl-1">Toughness</span>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={attrFilters.toughness?.min ?? ''}
                  onChange={(e) => updateAttr('toughness', { ...attrFilters.toughness, min: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-3 py-2 text-[11px] font-mono focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={attrFilters.toughness?.max ?? ''}
                  onChange={(e) => updateAttr('toughness', { ...attrFilters.toughness, max: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-3 py-2 text-[11px] font-mono focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
