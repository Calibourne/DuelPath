import { GameId } from './Card.js';
import { DeckCard } from './Deck.js';

export interface Run {
  id: string;
  gameId: GameId;
  formatId: string;
  starterDeckId: string;
  currentDeck: DeckCard[];
  currentExtraDeck?: DeckCard[];
  currentSideboard?: DeckCard[];
  seed: string;
  floor: number;
  status: 'active' | 'completed' | 'failed';
  createdAt: number;
  updatedAt: number;
}
