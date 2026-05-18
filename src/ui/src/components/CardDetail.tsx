import React from 'react';
import { useUI } from '../context/UIContext';

export const CardDetail: React.FC = () => {
  const { hoveredCard } = useUI();

  if (!hoveredCard) {
    return (
      <div className="w-[300px] border-r border-border bg-surface/30 h-full flex items-center justify-center p-8 text-center shrink-0">
        <p className="text-[10px] font-black text-text-muted/20 uppercase tracking-[0.3em]">Hover a card to view data</p>
      </div>
    );
  }

  const isMonster = hoveredCard.type === 'Monster' || hoveredCard.type === 'Creature';

  return (
    <div className="w-[300px] border-r border-border bg-surface h-full flex flex-col shrink-0 overflow-hidden shadow-2xl animate-in fade-in duration-300">
      {/* Card Art Header */}
      <div className="aspect-[2/3] w-full bg-black/40 overflow-hidden border-b border-border relative shrink-0">
        {hoveredCard.imageUrl ? (
          <img 
            src={hoveredCard.imageUrl} 
            alt={hoveredCard.name} 
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px] uppercase font-black tracking-widest italic opacity-20">No Visual Data</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
      </div>

      {/* Card Info Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
        <div>
          <h2 className="text-xl font-black italic tracking-tighter leading-tight text-white uppercase mb-1">
            {hoveredCard.name}
          </h2>
          
          {/* Concise Info Line for Non-Monsters */}
          {!isMonster ? (
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-black text-primary uppercase tracking-wider italic opacity-80">
              <span>{hoveredCard.type}</span>
              <div className="w-1 h-1 rounded-full bg-primary/40"></div>
              <span>
                {hoveredCard.gameId === 'yugioh' 
                  ? (hoveredCard.subtypes?.[0] || 'Normal')
                  : (hoveredCard.attributes?.original_type?.toString().replace(' Card', '') || 'Normal')}
              </span>
              <div className="w-1 h-1 rounded-full bg-primary/40"></div>
              <span className="text-text-muted/60">{hoveredCard.rarity || 'Common'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">{hoveredCard.type}</span>
              <div className="h-1 w-1 rounded-full bg-text-muted/30"></div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">{hoveredCard.rarity || 'Common'}</span>
            </div>
          )}
        </div>

        {/* 1. Attributes Section - Conditional based on card type */}
        {isMonster && (
          <section className="space-y-3">
            <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary/40 pl-2">Attributes</h3>
            
            <div className="grid grid-cols-2 gap-px bg-border border border-border">
              {/* YGO Specifics */}
              {hoveredCard.gameId === 'yugioh' && (
                <>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">Attribute</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{hoveredCard.attributes?.attribute || '—'}</span>
                  </div>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">
                      {hoveredCard.attributes?.linkval ? 'Link Tier' : 'Level / Rank'}
                    </span>
                    <span className="text-[10px] font-black text-yellow-500 uppercase tracking-tighter">
                      {hoveredCard.attributes?.linkval ? `LINK-${hoveredCard.attributes.linkval}` : `★ ${hoveredCard.attributes?.level || '—'}`}
                    </span>
                  </div>
                  <div className="bg-surface p-2 flex flex-col gap-0.5 col-span-2">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">Race / Type</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">{hoveredCard.attributes?.race || '—'}</span>
                  </div>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">ATK</span>
                    <span className="text-xs font-mono font-black text-white">{hoveredCard.attributes?.atk ?? '—'}</span>
                  </div>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">DEF</span>
                    <span className="text-xs font-mono font-black text-white">{hoveredCard.attributes?.linkval ? '—' : (hoveredCard.attributes?.def ?? '—')}</span>
                  </div>
                </>
              )}

              {/* MTG Specifics */}
              {hoveredCard.gameId === 'mtg' && (
                <>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">Mana Value</span>
                    <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{hoveredCard.attributes?.cmc ?? 0}</span>
                  </div>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">Colors</span>
                    <span className="text-[10px] font-black text-white uppercase tracking-tighter">
                      {Array.isArray(hoveredCard.attributes?.colors) ? hoveredCard.attributes.colors.join('') : 'C'}
                    </span>
                  </div>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">Power</span>
                    <span className="text-xs font-mono font-black text-white">{hoveredCard.attributes?.power ?? '—'}</span>
                  </div>
                  <div className="bg-surface p-2 flex flex-col gap-0.5">
                    <span className="text-[8px] font-black text-text-muted uppercase opacity-60">Toughness</span>
                    <span className="text-xs font-mono font-black text-white">{hoveredCard.attributes?.toughness ?? '—'}</span>
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        {/* 2. Effect Text Area */}
        <section className="space-y-3">
          <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] border-l-2 border-primary/40 pl-2">Effect & Lore</h3>
          <div className="bg-black/20 p-4 border border-border/50 rounded-none shadow-inner min-h-[120px]">
            <p className="text-[13px] leading-relaxed text-text font-medium whitespace-pre-wrap selection:bg-primary/40 selection:text-white">
              {hoveredCard.text || 'No description available.'}
            </p>
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="p-3 bg-black/40 border-t border-border flex justify-between items-center shrink-0">
        <span className="text-[8px] font-bold text-text-muted/30 uppercase tracking-widest">ID: {hoveredCard.id}</span>
        <span className="text-[8px] font-black text-primary/40 uppercase tracking-widest">{hoveredCard.gameId}</span>
      </div>
    </div>
  );
};
