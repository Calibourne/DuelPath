import { GameId } from './Card.js';

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
