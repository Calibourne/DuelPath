import { writeFile, readFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { StorageProvider } from '../../core/storage/StorageProvider.js';
import { Card } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';
import { Deck } from '../../core/models/Deck.js';

export class JsonFileStorageProvider implements StorageProvider {
  private dataDir: string;

  constructor(dataDir: string = './data') {
    this.dataDir = dataDir;
  }

  private async ensureDir(path: string) {
    await mkdir(path, { recursive: true });
  }

  private getFilePath(gameId: string, type: 'cards' | 'formats' | 'decks'): string {
    return join(this.dataDir, gameId, `${type}.json`);
  }

  async saveCards(gameId: string, cards: Card[]): Promise<void> {
    const path = join(this.dataDir, gameId);
    await this.ensureDir(path);
    await writeFile(this.getFilePath(gameId, 'cards'), JSON.stringify(cards, null, 2));
  }

  async loadCards(gameId: string): Promise<Card[]> {
    try {
      const data = await readFile(this.getFilePath(gameId, 'cards'), 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveFormats(gameId: string, formats: Format[]): Promise<void> {
    const path = join(this.dataDir, gameId);
    await this.ensureDir(path);
    await writeFile(this.getFilePath(gameId, 'formats'), JSON.stringify(formats, null, 2));
  }

  async loadFormats(gameId: string): Promise<Format[]> {
    try {
      const data = await readFile(this.getFilePath(gameId, 'formats'), 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  async saveDeck(deck: Deck): Promise<void> {
    const path = join(this.dataDir, deck.gameId, 'decks');
    await this.ensureDir(path);
    await writeFile(join(path, `${deck.id}.json`), JSON.stringify(deck, null, 2));
  }

  async loadDeck(deckId: string): Promise<Deck | null> {
    // This implementation is a bit inefficient as it doesn't know the gameId
    // In a real app, we'd probably have an index or store decks differently
    // For this prototype, we'll assume we might need to search or know gameId
    return null; // Placeholder for now
  }

  async listDecks(gameId?: string): Promise<Deck[]> {
    return []; // Placeholder for now
  }
}
