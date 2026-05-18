import { Deck, DeckCard } from '../models/Deck.js';
import { Format } from '../models/Format.js';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CardLookup {
  getCardName(cardId: string): string | undefined;
}

export function validateDeck(deck: Deck, format: Format, lookup?: CardLookup): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  const { rules } = format;

  const getDisplayName = (cardId: string) => {
    const name = lookup?.getCardName(cardId);
    return name ? `\`${name}\` (${cardId})` : cardId;
  };
  
  // 1. Validate Deck Size
  const totalMainCards = deck.cards.reduce((sum, c) => sum + c.count, 0);
  if (totalMainCards < rules.minDeckSize) {
    result.errors.push(`Main deck too small: ${totalMainCards}/${rules.minDeckSize}`);
  }
  if (rules.maxDeckSize && totalMainCards > rules.maxDeckSize) {
    result.errors.push(`Main deck too large: ${totalMainCards}/${rules.maxDeckSize}`);
  }

  // 2. Validate Card Copies
  const allCards: DeckCard[] = [
    ...deck.cards,
    ...(deck.sideboard || []),
    ...(deck.extraDeck || []),
  ];

  const cardCounts = new Map<string, number>();
  for (const { cardId, count } of allCards) {
    const currentCount = cardCounts.get(cardId) || 0;
    cardCounts.set(cardId, currentCount + count);
  }

  for (const [cardId, count] of cardCounts.entries()) {
    const maxAllowed = rules.restrictedCardIds?.[cardId] ?? rules.maxCopiesPerCard;
    const displayName = getDisplayName(cardId);
    
    if (rules.bannedCardIds?.includes(cardId)) {
      result.errors.push(`Card ${displayName} is banned in this format.`);
    } else if (count > maxAllowed) {
      result.errors.push(`Too many copies of ${displayName}: ${count}/${maxAllowed}`);
    }
  }

  // 3. Validate Points
  if (rules.maxPoints !== undefined) {
    let totalPoints = 0;
    for (const { cardId, count } of allCards) {
      const cardName = lookup?.getCardName(cardId);
      const pointsPerCard = (rules.cardPoints?.[cardId] ?? 0) + (cardName ? (rules.cardPointsByName?.[cardName] ?? 0) : 0);
      totalPoints += pointsPerCard * count;
    }

    if (totalPoints > rules.maxPoints) {
      result.errors.push(`Deck exceeds point limit: ${totalPoints}/${rules.maxPoints}`);
    }
  }

  result.isValid = result.errors.length === 0;
  return result;
}
