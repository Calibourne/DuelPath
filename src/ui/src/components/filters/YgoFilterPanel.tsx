import React from 'react';

interface YgoFilters {
  atk?: { min?: number; max?: number };
  def?: { min?: number; max?: number };
  attribute?: string;
  race?: string;
  level?: { exact?: number; min?: number; max?: number };
}

interface YgoFilterPanelProps {
  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  attrFilters: YgoFilters;
  setAttrFilters: (filters: YgoFilters) => void;
}

export const YgoFilterPanel: React.FC<YgoFilterPanelProps> = ({
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

  const updateAttr = (key: keyof YgoFilters, value: any) => {
    setAttrFilters({ ...attrFilters, [key]: value });
  };

  const attributes = [
    { id: 'DARK', color: 'bg-[#5e17eb] border-[#7d48ff] text-white', icon: '闇' },
    { id: 'LIGHT', color: 'bg-[#b69f49] border-[#d8c06b] text-white', icon: '光' },
    { id: 'EARTH', color: 'bg-[#955f2b] border-[#ba7f45] text-white', icon: '地' },
    { id: 'WATER', color: 'bg-[#1b71b5] border-[#3ca2ef] text-white', icon: '水' },
    { id: 'FIRE', color: 'bg-[#c71b1b] border-[#f04848] text-white', icon: '炎' },
    { id: 'WIND', color: 'bg-[#1b8c4c] border-[#37ca7a] text-white', icon: '風' },
    { id: 'DIVINE', color: 'bg-[#e0c400] border-[#ffe224] text-black', icon: '神' },
  ];

  // Logic: Pendulums can be many things. We allow multi-select.
  const monsterSubTypes = ['Normal Monster', 'Effect Monster', 'Ritual Monster', 'Fusion Monster', 'Synchro Monster', 'XYZ Monster', 'Link Monster', 'Pendulum Effect Monster'];
  const spellTrapProperties = ['Continuous', 'Quick-Play', 'Equip', 'Field', 'Ritual', 'Counter'];
  const races = ['Warrior', 'Spellcaster', 'Dragon', 'Zombie', 'Fiend', 'Rock', 'Machine', 'Aqua', 'Pyro', 'Thunder', 'Beast', 'Plant', 'Reptile', 'Insect', 'Psychic', 'Cyberse', 'Wyrm'];

  const isMonsterSelected = selectedTypes.includes('Monster') || selectedTypes.some(t => monsterSubTypes.includes(t));
  const isSpellSelected = selectedTypes.includes('Spell');
  const isTrapSelected = selectedTypes.includes('Trap');
  
  // Show All if nothing selected
  const showAll = selectedTypes.length === 0;

  return (
    <div className="space-y-6">
      {/* 0. Primary Categories */}
      <div className="flex gap-1">
        {[
          { id: 'Monster', label: 'MONSTER', color: 'border-orange-600/50 text-orange-400 bg-orange-600/5' },
          { id: 'Spell', label: 'SPELL', color: 'border-emerald-600/50 text-emerald-400 bg-emerald-600/5' },
          { id: 'Trap', label: 'TRAP', color: 'border-pink-600/50 text-pink-400 bg-pink-600/5' }
        ].map((cat) => {
          const isSelected = selectedTypes.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleType(cat.id)}
              className={`flex-1 py-2 text-[10px] font-black border transition-all ${
                isSelected ? cat.color.replace('bg-', 'bg-').replace('/5', '/20').replace('border-', 'border-') : 'bg-background border-border text-text-muted hover:border-text-muted/50'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-6">
        {/* 1. Monster Sub-Types Grid - ALWAYS SHOW if Monster or ShowAll */}
        {(showAll || isMonsterSelected) && (
          <section>
            <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Monster Category
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {monsterSubTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-2 py-1.5 rounded-none text-[9px] font-bold border text-left transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400'
                      : 'bg-background border-border text-text-muted/40 hover:border-border-hover'
                  }`}
                >
                  {type.replace(' Monster', '').replace(' Effect', '')}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 2. Attributes & Level - Shown if Monster context */}
        {(showAll || isMonsterSelected) && (
          <div className="space-y-6">
            <section>
              <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Attribute
              </h3>
              <div className="flex flex-wrap gap-1">
                {attributes.map((attr) => (
                  <button
                    key={attr.id}
                    onClick={() => updateAttr('attribute', attrFilters.attribute === attr.id ? undefined : attr.id)}
                    title={attr.id}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-black border transition-all ${
                      attrFilters.attribute === attr.id
                        ? `${attr.color} border-white/50 scale-110 z-10 shadow-lg`
                        : 'bg-background border-border text-text-muted/20 grayscale opacity-40 hover:grayscale-0 hover:opacity-100'
                    }`}
                  >
                    {attr.icon}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                Level / Rank
              </h3>
              <div className="flex flex-wrap gap-1">
                {[...Array(12)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => updateAttr('level', attrFilters.level?.exact === i + 1 ? undefined : { exact: i + 1 })}
                    className={`w-6 h-6 flex items-center justify-center text-[10px] font-black border transition-all ${
                      attrFilters.level?.exact === i + 1
                        ? 'bg-yellow-600/20 border-yellow-500 text-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                        : 'bg-background border-border text-text-muted/20 hover:text-yellow-500/50'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                Combat Stats
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="ATK Min"
                    value={attrFilters.atk?.min ?? ''}
                    onChange={(e) => updateAttr('atk', { ...attrFilters.atk, min: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-bold focus:border-primary/50 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={attrFilters.atk?.max ?? ''}
                    onChange={(e) => updateAttr('atk', { ...attrFilters.atk, max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-bold focus:border-primary/50 outline-none"
                  />
                </div>
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="DEF Min"
                    value={attrFilters.def?.min ?? ''}
                    onChange={(e) => updateAttr('def', { ...attrFilters.def, min: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-bold focus:border-primary/50 outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={attrFilters.def?.max ?? ''}
                    onChange={(e) => updateAttr('def', { ...attrFilters.def, max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-2 py-1.5 text-[10px] font-bold focus:border-primary/50 outline-none"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Monster Race
              </h3>
              <select 
                value={attrFilters.race || ''} 
                onChange={(e) => updateAttr('race', e.target.value || undefined)}
                className="w-full bg-background border border-border px-2 py-2 text-[10px] font-bold focus:border-primary/50 outline-none appearance-none cursor-pointer hover:bg-white/[0.02]"
              >
                <option value="">( ANY RACE )</option>
                {races.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
              </select>
            </section>
          </div>
        )}

        {/* 3. Spell / Trap Specifics - Only if Spell or Trap context */}
        {(showAll || isSpellSelected || isTrapSelected) && (
          <section>
            <h3 className="text-[9px] font-black text-text-muted/60 uppercase tracking-[0.2em] mb-3 px-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              S / T Property
            </h3>
            <div className="grid grid-cols-2 gap-1">
              {spellTrapProperties.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-1.5 rounded-none text-[10px] font-bold border transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                      : 'bg-background border-border text-text-muted/40 hover:border-border-hover'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};
