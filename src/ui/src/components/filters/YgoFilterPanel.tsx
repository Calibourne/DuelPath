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
    { id: 'DARK', color: 'bg-[#5e17eb] border-[#7d48ff] text-white', hoverColor: 'hover:bg-[#5e17eb]', icon: '闇' },
    { id: 'LIGHT', color: 'bg-[#b69f49] border-[#d8c06b] text-white', hoverColor: 'hover:bg-[#b69f49]', icon: '光' },
    { id: 'EARTH', color: 'bg-[#955f2b] border-[#ba7f45] text-white', hoverColor: 'hover:bg-[#955f2b]', icon: '地' },
    { id: 'WATER', color: 'bg-[#1b71b5] border-[#3ca2ef] text-white', hoverColor: 'hover:bg-[#1b71b5]', icon: '水' },
    { id: 'FIRE', color: 'bg-[#c71b1b] border-[#f04848] text-white', hoverColor: 'hover:bg-[#c71b1b]', icon: '炎' },
    { id: 'WIND', color: 'bg-[#1b8c4c] border-[#37ca7a] text-white', hoverColor: 'hover:bg-[#1b8c4c]', icon: '風' },
    { id: 'DIVINE', color: 'bg-[#e0c400] border-[#ffe224] text-black', hoverColor: 'hover:bg-[#e0c400]', icon: '神' },
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
    <div className="space-y-8">
      {/* 0. Primary Categories */}
      <div className="flex gap-2">
        {[
          { id: 'Monster', label: 'MONSTER', active: 'bg-orange-600 text-white border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]', hover: 'hover:border-orange-500/50 hover:text-orange-400 hover:bg-orange-600/5' },
          { id: 'Spell', label: 'SPELL', active: 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]', hover: 'hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-600/5' },
          { id: 'Trap', label: 'TRAP', active: 'bg-pink-600 text-white border-pink-500 shadow-[0_0_15px_rgba(219,39,119,0.3)]', hover: 'hover:border-pink-500/50 hover:text-pink-400 hover:bg-pink-600/5' }
        ].map((cat) => {
          const isSelected = selectedTypes.includes(cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => toggleType(cat.id)}
              className={`flex-1 py-3 text-[11px] font-black border transition-all ${
                isSelected 
                  ? cat.active 
                  : `bg-background border-border text-text-muted ${cat.hover}`
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-8">
        {/* 1. Monster Sub-Types Grid - ALWAYS SHOW if Monster or ShowAll */}
        {(showAll || isMonsterSelected) && (
          <section>
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Monster Category
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {monsterSubTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-2.5 py-2 rounded-none text-[10px] font-bold border text-left transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-orange-600/20 border-orange-500 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.1)]'
                      : 'bg-background border-border text-text-muted hover:border-orange-500/50 hover:text-orange-400 hover:bg-orange-600/5'
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
          <div className="space-y-8">
            <section>
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Attribute
              </h3>
              <div className="flex flex-wrap gap-2">
                {attributes.map((attr) => (
                  <button
                    key={attr.id}
                    onClick={() => updateAttr('attribute', attrFilters.attribute === attr.id ? undefined : attr.id)}
                    title={attr.id}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-black border-2 transition-all ${
                      attrFilters.attribute === attr.id
                        ? `${attr.color.replace('border-', 'border-white ')} scale-110 z-10 shadow-[0_0_15px_rgba(255,255,255,0.1)] border-white`
                        : `bg-background border-border text-text-muted grayscale opacity-40 hover:grayscale-0 hover:opacity-100 hover:scale-110 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:border-white/50 ${attr.hoverColor}`
                    }`}
                  >
                    {attr.icon}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                </div>
                Level / Rank / Link
              </h3>
              <div className="flex flex-wrap gap-2">
                {[...Array(12)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => updateAttr('level', attrFilters.level?.exact === i + 1 ? undefined : { exact: i + 1 })}
                    className={`w-7 h-7 flex items-center justify-center text-[11px] font-black border transition-all ${
                      attrFilters.level?.exact === i + 1
                        ? 'bg-yellow-500 text-black border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-110'
                        : 'bg-background border-border text-text-muted/60 hover:text-yellow-500 hover:border-yellow-500/50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                Combat Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="ATK Min"
                    value={attrFilters.atk?.min ?? ''}
                    onChange={(e) => updateAttr('atk', { ...attrFilters.atk, min: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-3 py-2 text-[11px] font-bold focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={attrFilters.atk?.max ?? ''}
                    onChange={(e) => updateAttr('atk', { ...attrFilters.atk, max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-3 py-2 text-[11px] font-bold focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                  />
                </div>
                <div className="flex gap-1">
                  <input
                    type="number"
                    placeholder="DEF Min"
                    value={attrFilters.def?.min ?? ''}
                    onChange={(e) => updateAttr('def', { ...attrFilters.def, min: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-3 py-2 text-[11px] font-bold focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={attrFilters.def?.max ?? ''}
                    onChange={(e) => updateAttr('def', { ...attrFilters.def, max: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="w-full bg-background border border-border px-3 py-2 text-[11px] font-bold focus:border-primary outline-none placeholder:text-text-muted/60 text-text"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Monster Race
              </h3>
              <div className="relative group">
                <select 
                  value={attrFilters.race || ''} 
                  onChange={(e) => updateAttr('race', e.target.value || undefined)}
                  className="w-full bg-background border border-border px-3 py-2.5 text-[11px] font-bold focus:border-primary outline-none appearance-none cursor-pointer hover:bg-white/[0.04] text-text transition-colors"
                >
                  <option value="" className="text-text-muted">( ANY RACE )</option>
                  {races.map(r => <option key={r} value={r} className="text-text">{r.toUpperCase()}</option>)}
                </select>
                <div className="absolute right-3 top-3.5 pointer-events-none text-text-muted/40 group-hover:text-text-muted transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 3. Spell / Trap Specifics - Only if Spell or Trap context */}
        {(showAll || isSpellSelected || isTrapSelected) && (
          <section>
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              S / T Property
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {spellTrapProperties.map((type) => (
                <button
                  key={type}
                  onClick={() => toggleType(type)}
                  className={`px-3 py-2 rounded-none text-[10px] font-bold border transition-all ${
                    selectedTypes.includes(type)
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                      : 'bg-background border-border text-text-muted hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-600/5'
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
