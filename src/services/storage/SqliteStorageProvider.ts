import Database from 'better-sqlite3';
import { StorageProvider } from '../../core/storage/StorageProvider.js';
import { Card } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';
import { Deck } from '../../core/models/Deck.js';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export class SqliteStorageProvider implements StorageProvider {
  private db: Database.Database;

  constructor(dbPath: string = './data/duelpath.db') {
    // Ensure directory exists (sync for constructor simplicity, or we could have an init method)
    // For now, we assume the directory is handled or we use the default
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    // 1. Cards Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cards (
        id TEXT,
        gameId TEXT,
        name TEXT,
        type TEXT,
        subtypes TEXT,
        text TEXT,
        imageUrl TEXT,
        rarity TEXT,
        attributes TEXT,
        PRIMARY KEY (id, gameId)
      );
      CREATE INDEX IF NOT EXISTS idx_cards_game ON cards(gameId);
      CREATE INDEX IF NOT EXISTS idx_cards_name ON cards(name);
    `);

    // 2. Formats Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS formats (
        id TEXT,
        gameId TEXT,
        name TEXT,
        description TEXT,
        rules TEXT,
        PRIMARY KEY (id, gameId)
      );
    `);

    // 3. Decks Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS decks (
        id TEXT PRIMARY KEY,
        name TEXT,
        gameId TEXT,
        formatId TEXT,
        cards TEXT,
        sideboard TEXT,
        extraDeck TEXT,
        createdAt INTEGER,
        updatedAt INTEGER
      );
    `);
  }

  async saveCards(gameId: string, cards: Card[]): Promise<void> {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO cards (id, gameId, name, type, subtypes, text, imageUrl, rarity, attributes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((cardList: Card[]) => {
      for (const card of cardList) {
        insert.run(
          card.id,
          card.gameId,
          card.name,
          card.type,
          JSON.stringify(card.subtypes || []),
          card.text,
          card.imageUrl || null,
          card.rarity || null,
          JSON.stringify(card.attributes || {})
        );
      }
    });

    transaction(cards);
  }

  async loadCards(gameId: string): Promise<Card[]> {
    const rows = this.db.prepare('SELECT * FROM cards WHERE gameId = ?').all(gameId) as any[];
    return rows.map(row => ({
      id: row.id,
      gameId: row.gameId,
      name: row.name,
      type: row.type,
      subtypes: JSON.parse(row.subtypes),
      text: row.text,
      imageUrl: row.imageUrl,
      rarity: row.rarity,
      attributes: JSON.parse(row.attributes)
    }));
  }

  async saveFormats(gameId: string, formats: Format[]): Promise<void> {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO formats (id, gameId, name, description, rules)
      VALUES (?, ?, ?, ?, ?)
    `);

    const transaction = this.db.transaction((formatList: Format[]) => {
      for (const format of formatList) {
        insert.run(
          format.id,
          format.gameId,
          format.name,
          format.description || null,
          JSON.stringify(format.rules)
        );
      }
    });

    transaction(formats);
  }

  async loadFormats(gameId: string): Promise<Format[]> {
    const rows = this.db.prepare('SELECT * FROM formats WHERE gameId = ?').all(gameId) as any[];
    return rows.map(row => ({
      id: row.id,
      gameId: row.gameId,
      name: row.name,
      description: row.description,
      rules: JSON.parse(row.rules)
    }));
  }

  async saveDeck(deck: Deck): Promise<void> {
    this.db.prepare(`
      INSERT OR REPLACE INTO decks (id, name, gameId, formatId, cards, sideboard, extraDeck, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      deck.id,
      deck.name,
      deck.gameId,
      deck.formatId,
      JSON.stringify(deck.cards),
      JSON.stringify(deck.sideboard || []),
      JSON.stringify(deck.extraDeck || []),
      deck.createdAt,
      deck.updatedAt
    );
  }

  async loadDeck(deckId: string): Promise<Deck | null> {
    const row = this.db.prepare('SELECT * FROM decks WHERE id = ?').get(deckId) as any;
    if (!row) return null;

    return {
      id: row.id,
      name: row.name,
      gameId: row.gameId,
      formatId: row.formatId,
      cards: JSON.parse(row.cards),
      sideboard: JSON.parse(row.sideboard),
      extraDeck: JSON.parse(row.extraDeck),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    };
  }

  async listDecks(gameId?: string): Promise<Deck[]> {
    let rows: any[];
    if (gameId) {
      rows = this.db.prepare('SELECT * FROM decks WHERE gameId = ?').all(gameId) as any[];
    } else {
      rows = this.db.prepare('SELECT * FROM decks').all() as any[];
    }
    
    return rows.map(row => ({
      id: row.id,
      name: row.name,
      gameId: row.gameId,
      formatId: row.formatId,
      cards: JSON.parse(row.cards),
      sideboard: JSON.parse(row.sideboard),
      extraDeck: JSON.parse(row.extraDeck),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt
    }));
  }
}
