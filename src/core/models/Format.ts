import { GameId } from './Card.js';

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
    restrictedCardIds?: Record<string, number>; // cardId -> max copies allowed if different from default
    maxPoints?: number;
    cardPoints?: Record<string, number>; // cardId -> points value
  };
}
