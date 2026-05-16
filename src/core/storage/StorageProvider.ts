import { Card } from '../models/Card.js';
import { Format } from '../models/Format.js';
import { Deck } from '../models/Deck.js';

export interface StorageProvider {
  saveCards(gameId: string, cards: Card[]): Promise<void>;
  loadCards(gameId: string): Promise<Card[]>;
  
  saveFormats(gameId: string, formats: Format[]): Promise<void>;
  loadFormats(gameId: string): Promise<Format[]>;
  
  saveDeck(deck: Deck): Promise<void>;
  loadDeck(deckId: string): Promise<Deck | null>;
  listDecks(gameId?: string): Promise<Deck[]>;
}
