export type GameId = 'yugioh' | 'mtg' | 'pokemon' | 'hearthstone';

export interface Card {
  id: string;
  gameId: GameId;
  name: string;
  type: string;
  subtypes?: string[];
  text: string;
  imageUrl?: string;
  rarity?: string;
  attributes?: Record<string, string | number | boolean>;
}

export interface Format {
  id: string;
  gameId: GameId;
  name: string;
  description?: string;
  rules: {
    minDeckSize: number;
    maxDeckSize?: number;
    maxCopiesPerCard: number;
    allowedCardTypes?: string[];
    bannedCardIds?: string[];
    restrictedCardIds?: Record<string, number>;
    maxPoints?: number;
    cardPoints?: Record<string, number>;
  };
}

export interface Game {
  id: string;
  name: string;
}

export interface StarterDeckCard {
  name: string;
  count: number;
}

export interface StarterDeck {
  id: string;
  gameId: GameId;
  formatId: string;
  name: string;
  description: string;
  coverCardName: string;
  cards: StarterDeckCard[];
  extraDeck?: StarterDeckCard[];
}

export interface Run {
  id: string;
  gameId: GameId;
  formatId: string;
  starterDeckId: string;
  currentDeck: { cardId: string; count: number }[];
  currentExtraDeck?: { cardId: string; count: number }[];
  status: 'active' | 'completed' | 'failed';
  floor: number;
}
