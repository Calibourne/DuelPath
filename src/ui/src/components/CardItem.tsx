import React from 'react';
import { Card, Format } from '../types/index';

interface CardItemProps {
  card: Card;
  format: Format | undefined;
}

export const CardItem: React.FC<CardItemProps> = ({ card, format }) => {
  const getRestrictionBadge = () => {
    if (!format) return null;

    const { rules } = format;
    
    // 1. Resolve Ban Status from Card Attributes if it's a known format
    let status: string | undefined;
    if (format.id === 'tcg-advanced') status = card.attributes?.ban_tcg as string;
    if (format.id === 'ocg-advanced') status = card.attributes?.ban_ocg as string;
    if (format.id === 'goat') status = card.attributes?.ban_goat as string;

    if (status === 'Forbidden' || rules.bannedCardIds?.includes(card.id)) {
      return <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">Banned</span>;
    }

    const restrictedCount = status === 'Limited' ? 1 : (status === 'Semi-Limited' ? 2 : rules.restrictedCardIds?.[card.id]);
    if (restrictedCount !== undefined) {
      return <span className="bg-amber-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">Max {restrictedCount}</span>;
    }

    const points = rules.cardPoints?.[card.id];
    if (points !== undefined) {
      return <span className="bg-emerald-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">{points} Pts</span>;
    }

    // Default: Check singleton
    if (rules.maxCopiesPerCard === 1) {
      return <span className="bg-sky-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">Singleton</span>;
    }

    return null;
  };

  const isBanned = format?.rules.bannedCardIds?.includes(card.id) || 
                   (format?.id === 'tcg-advanced' && card.attributes?.ban_tcg === 'Forbidden') ||
                   (format?.id === 'ocg-advanced' && card.attributes?.ban_ocg === 'Forbidden') ||
                   (format?.id === 'goat' && card.attributes?.ban_goat === 'Forbidden');

  return (
    <div className={`bg-surface border border-border rounded-normal overflow-hidden flex flex-col group hover:border-primary/50 transition-all ${isBanned ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <div className="aspect-[2/3] relative bg-black/20 flex items-center justify-center overflow-hidden">
        {card.imageUrl ? (
          <img 
            src={card.imageUrl} 
            alt={card.name} 
            className={`w-full h-full object-cover transition-transform duration-300 ${!isBanned ? 'group-hover:scale-105' : ''}`}
          />
        ) : (
          <div className="text-text-muted text-xs italic">No Image</div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {getRestrictionBadge()}
        </div>
        {isBanned && (
          <div className="absolute inset-0 bg-red-950/20 flex items-center justify-center pointer-events-none">
            <div className="border-2 border-red-600 text-red-600 font-black text-2xl uppercase tracking-tighter rotate-[-15deg] px-2 py-1 opacity-80">Forbidden</div>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className={`font-bold text-sm truncate flex-1 mr-2 ${isBanned ? 'text-text-muted' : ''}`} title={card.name}>{card.name}</h3>
          <span className="text-[10px] text-text-muted shrink-0">{card.rarity || ''}</span>
        </div>
        <p className="text-[10px] text-primary/80 mb-2 uppercase font-bold tracking-tight">{card.type}</p>
        <p className="text-xs text-text-muted line-clamp-3 italic leading-relaxed flex-1">
          {card.text || 'No rules text available.'}
        </p>
      </div>
    </div>
  );
};
