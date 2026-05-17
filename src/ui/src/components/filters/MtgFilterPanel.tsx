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
    <div className="space-y-8">
      {/* 1. Colors */}
      <section>
        <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1">Mana Identity</h3>
        <div className="flex justify-between px-1">
          {colors.map((c) => {
            const isSelected = (attrFilters.colors || []).includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleColor(c.id)}
                title={c.name}
                className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xs font-black shadow-sm ${c.color} ${
                  isSelected ? 'opacity-100 scale-110 ring-4 ring-primary/20 z-10' : 'opacity-20 grayscale hover:opacity-70 hover:grayscale-0'
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
        <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1">Card Categories</h3>
        <div className="grid grid-cols-2 gap-1">
          {categories.map((type) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`px-3 py-2 rounded-none text-[9px] font-bold border text-left transition-all ${
                selectedTypes.includes(type)
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-background border-border text-text-muted/40 hover:border-border-hover'
              }`}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      </section>

      {/* 3. CMC */}
      <section>
        <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1 flex justify-between">
          <span>Mana Value</span>
          {attrFilters.cmc?.exact !== undefined && <span className="text-primary font-mono">{attrFilters.cmc.exact}</span>}
        </h3>
        <div className="grid grid-cols-6 gap-1">
          {[...Array(11)].map((_, i) => (
            <button
              key={i}
              onClick={() => updateAttr('cmc', attrFilters.cmc?.exact === i ? undefined : { exact: i })}
              className={`h-7 flex items-center justify-center text-[10px] font-mono font-bold border transition-all ${
                attrFilters.cmc?.exact === i
                  ? 'bg-primary text-black border-primary'
                  : 'bg-background border-border text-text-muted/20 hover:border-primary/50'
              }`}
            >
              {i}
            </button>
          ))}
          <button
            onClick={() => updateAttr('cmc', attrFilters.cmc?.min === 10 ? undefined : { min: 10 })}
            className={`h-7 flex items-center justify-center text-[10px] font-mono font-bold border transition-all ${
              attrFilters.cmc?.min === 10
                ? 'bg-primary text-black border-primary'
                : 'bg-background border-border text-text-muted/20 hover:border-primary/50'
            }`}
          >
            10+
          </button>
        </div>
      </section>

      {/* 4. Power / Toughness */}
      {(showAll || isCreatureSelected) && (
        <section className="space-y-3">
          <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em] px-1">Combat Power</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-text-muted/50 uppercase pl-1 tracking-tighter">Power</span>
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={attrFilters.power?.min ?? ''}
                  onChange={(e) => updateAttr('power', { ...attrFilters.power, min: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-mono focus:border-primary/50 outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={attrFilters.power?.max ?? ''}
                  onChange={(e) => updateAttr('power', { ...attrFilters.power, max: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-mono focus:border-primary/50 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-black text-text-muted/50 uppercase pl-1 tracking-tighter">Toughness</span>
              <div className="flex gap-1">
                <input
                  type="number"
                  placeholder="Min"
                  value={attrFilters.toughness?.min ?? ''}
                  onChange={(e) => updateAttr('toughness', { ...attrFilters.toughness, min: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-mono focus:border-primary/50 outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={attrFilters.toughness?.max ?? ''}
                  onChange={(e) => updateAttr('toughness', { ...attrFilters.toughness, max: e.target.value ? parseInt(e.target.value) : undefined })}
                  className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-mono focus:border-primary/50 outline-none"
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
