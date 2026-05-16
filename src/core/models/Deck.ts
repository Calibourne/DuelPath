import { GameId } from './Card.js';

export interface DeckCard {
  cardId: string;
  count: number;
}

export interface Deck {
  id: string;
  name: string;
  gameId: GameId;
  formatId: string;
  cards: DeckCard[];
  sideboard?: DeckCard[];
  extraDeck?: DeckCard[]; // Specific to games like Yu-Gi-Oh
  createdAt: number;
  updatedAt: number;
}
