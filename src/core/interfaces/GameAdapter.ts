import { Card, GameId } from '../models/Card.js';
import { Format } from '../models/Format.js';

export interface GameAdapter {
  gameId: GameId;
  
  /**
   * Fetches all available cards for the game.
   * Implementation should use the standard universal 'fetch' API.
   */
  fetchCards(): Promise<Card[]>;

  /**
   * Fetches all available formats/legality rules for the game.
   */
  fetchFormats(): Promise<Format[]>;

  /**
   * Normalizes raw card data from external APIs into the internal Card model.
   */
  normalizeCard(rawCard: any): Card;
}
