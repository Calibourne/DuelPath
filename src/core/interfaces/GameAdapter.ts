import { Card, GameId } from '../models/Card.js';
import { Format } from '../models/Format.js';
import { StarterDeck } from '../models/StarterDeck.js';

export interface GameAdapter {
  gameId: GameId;
  
  /**
   * Fetches all available cards for the game.
   */
  fetchCards(): Promise<Card[]>;

  /**
   * Fetches all available formats/legality rules for the game.
   */
  fetchFormats(): Promise<Format[]>;

  /**
   * Fetches curated starter decks for the game.
   */
  fetchStarterDecks(): Promise<StarterDeck[]>;

  /**
   * Normalizes raw card data from external APIs into the internal Card model.
   */
  normalizeCard(rawCard: any): Card;
}
