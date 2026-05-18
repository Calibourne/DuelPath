import Database from 'better-sqlite3';
import { StorageProvider } from '../../core/storage/StorageProvider.js';
import { Card } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';
import { Deck, DeckCard } from '../../core/models/Deck.js';
import { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { YDKE } from '../../core/utils/ydke.js';

export class SqliteStorageProvider implements StorageProvider {
  private db: Database.Database;

  constructor(dbPath: string = './data/duelpath.db') {
    // Ensure directory exists
    const dir = dirname(dbPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    
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

    // 4. FTS5 Search Table
    this.db.exec(`
      CREATE VIRTUAL TABLE IF NOT EXISTS cards_fts USING fts5(
        id UNINDEXED,
        gameId UNINDEXED,
        name,
        text,
        content='cards',
        content_rowid='rowid'
      );

      -- Triggers to keep FTS index in sync
      CREATE TRIGGER IF NOT EXISTS cards_ai AFTER INSERT ON cards BEGIN
        INSERT INTO cards_fts(rowid, id, gameId, name, text) VALUES (new.rowid, new.id, new.gameId, new.name, new.text);
      END;
      CREATE TRIGGER IF NOT EXISTS cards_ad AFTER DELETE ON cards BEGIN
        INSERT INTO cards_fts(cards_fts, rowid, id, gameId, name, text) VALUES('delete', old.rowid, old.id, old.gameId, old.name, old.text);
      END;
      CREATE TRIGGER IF NOT EXISTS cards_au AFTER UPDATE ON cards BEGIN
        INSERT INTO cards_fts(cards_fts, rowid, id, gameId, name, text) VALUES('delete', old.rowid, old.id, old.gameId, old.name, old.text);
        INSERT INTO cards_fts(rowid, id, gameId, name, text) VALUES (new.rowid, new.id, new.gameId, new.name, new.text);
      END;
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
    
    // Initial population of FTS if it was just created/updated
    // (In a real app, triggers handle this, but for first-time ingestion we might need to kick it)
    this.db.exec("INSERT INTO cards_fts(cards_fts) VALUES('rebuild');");
  }

  async loadCards(gameId: string, options?: { 
    limit?: number; 
    offset?: number; 
    search?: string;
    types?: string[];
    attributeFilters?: Record<string, any>;
  }): Promise<Card[]> {
    let query = '';
    const params: any[] = [];

    if (options?.search) {
      let ftsQuery = options.search;

      // 1. Handle explicit full-string name ($) or text (@) lookups
      if (ftsQuery.startsWith('$')) {
        ftsQuery = `name:"${ftsQuery.substring(1).replace(/"/g, '""')}"`;
      } else if (ftsQuery.startsWith('@')) {
        ftsQuery = `text:"${ftsQuery.substring(1).replace(/"/g, '""')}"`;
      } else {
        // 2. Handle standard multi-term EDOPro syntax
        ftsQuery = ftsQuery
          .replace(/\$([^\s]+)/g, 'name:"$1"')
          .replace(/@([^\s]+)/g, 'text:"$1"')
          .replace(/!!([^\s]+)/g, 'NOT "$1"')
          .replace(/\|\|/g, ' OR ');
      }

      // Use FTS5 MATCH for speed
      query = `
        SELECT c.* FROM cards c
        JOIN cards_fts f ON c.rowid = f.rowid
        WHERE c.gameId = ? AND cards_fts MATCH ?
      `;
      params.push(gameId, ftsQuery);
    } else {
      query = 'SELECT * FROM cards WHERE gameId = ?';
      params.push(gameId);
    }

    if (options?.types && options.types.length > 0) {
      const typeConditions = options.types.map(() => '(type = ? OR subtypes LIKE ?)').join(' OR ');
      query += ` AND (${typeConditions})`;
      options.types.forEach(t => {
        params.push(t, `%\"${t}\"%`);
      });
    }

    // Dynamic Attribute Filtering (JSON Extraction)
    if (options?.attributeFilters) {
      for (const [key, value] of Object.entries(options.attributeFilters)) {
        if (value === undefined || value === null || value === '') continue;

        if (Array.isArray(value)) {
          if (value.length === 0) continue;
          // Handle arrays (like colors in MTG)
          const conditions = value.map(() => `json_extract(attributes, '$.${key}') LIKE ?`).join(' OR ');
          query += ` AND (${conditions})`;
          params.push(...value.map(v => `%${v}%`));
        } else if (typeof value === 'object') {
          if (value.min !== undefined) {
            query += ` AND CAST(json_extract(attributes, '$.${key}') AS INTEGER) >= ?`;
            params.push(value.min);
          }
          if (value.max !== undefined) {
            query += ` AND CAST(json_extract(attributes, '$.${key}') AS INTEGER) <= ?`;
            params.push(value.max);
          }
          if (value.exact !== undefined) {
            if (key === 'level') {
              query += ` AND (CAST(json_extract(attributes, '$.level') AS INTEGER) = ? OR CAST(json_extract(attributes, '$.linkval') AS INTEGER) = ?)`;
              params.push(value.exact, value.exact);
            } else {
              query += ` AND CAST(json_extract(attributes, '$.${key}') AS INTEGER) = ?`;
              params.push(value.exact);
            }
          }
        } else {
          query += ` AND json_extract(attributes, '$.${key}') = ?`;
          params.push(value);
        }
      }
    }

    query += ' ORDER BY name ASC';

    if (options?.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
      
      if (options?.offset) {
        query += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const rows = this.db.prepare(query).all(...params) as any[];
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
    const transaction = this.db.transaction((formatList: Format[]) => {
      // Clear existing formats for this game to prevent stale entries
      this.db.prepare('DELETE FROM formats WHERE gameId = ?').run(gameId);

      const insert = this.db.prepare(`
        INSERT INTO formats (id, gameId, name, description, rules)
        VALUES (?, ?, ?, ?, ?)
      `);

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
    let cardsValue: string;
    let extraValue: string;
    let sideValue: string;

    if (deck.gameId === 'yugioh') {
      // Store Yu-Gi-Oh decks as compact YDKE URIs
      const mainIds = deck.cards.flatMap(c => Array(c.count).fill(parseInt(c.cardId)));
      const extraIds = (deck.extraDeck || []).flatMap(c => Array(c.count).fill(parseInt(c.cardId)));
      const sideIds = (deck.sideboard || []).flatMap(c => Array(c.count).fill(parseInt(c.cardId)));
      
      cardsValue = YDKE.encode(mainIds, extraIds, sideIds);
      extraValue = '[]'; // Already packed in cardsValue
      sideValue = '[]';
    } else {
      cardsValue = JSON.stringify(deck.cards);
      extraValue = JSON.stringify(deck.extraDeck || []);
      sideValue = JSON.stringify(deck.sideboard || []);
    }

    this.db.prepare(`
      INSERT OR REPLACE INTO decks (id, name, gameId, formatId, cards, sideboard, extraDeck, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      deck.id,
      deck.name,
      deck.gameId,
      deck.formatId,
      cardsValue,
      sideValue,
      extraValue,
      deck.createdAt,
      deck.updatedAt
    );
  }

  async loadDeck(deckId: string): Promise<Deck | null> {
    const row = this.db.prepare('SELECT * FROM decks WHERE id = ?').get(deckId) as any;
    if (!row) return null;

    let cards: DeckCard[];
    let extraDeck: DeckCard[] = [];
    let sideboard: DeckCard[] = [];

    if (row.cards.startsWith('ydke://')) {
      const decoded = YDKE.decode(row.cards);
      
      const countOccurrences = (ids: number[]): DeckCard[] => {
        const counts = new Map<number, number>();
        ids.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
        return Array.from(counts.entries()).map(([id, count]) => ({
          cardId: id.toString(),
          count
        }));
      };

      cards = countOccurrences(decoded.main);
      extraDeck = countOccurrences(decoded.extra);
      sideboard = countOccurrences(decoded.side);
    } else {
      cards = JSON.parse(row.cards);
      extraDeck = JSON.parse(row.extraDeck);
      sideboard = JSON.parse(row.sideboard);
    }

    return {
      id: row.id,
      name: row.name,
      gameId: row.gameId,
      formatId: row.formatId,
      cards,
      sideboard,
      extraDeck,
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
    
    return rows.map(row => {
      let cards: DeckCard[];
      let extraDeck: DeckCard[] = [];
      let sideboard: DeckCard[] = [];

      if (row.cards.startsWith('ydke://')) {
        const decoded = YDKE.decode(row.cards);
        const countOccurrences = (ids: number[]): DeckCard[] => {
          const counts = new Map<number, number>();
          ids.forEach(id => counts.set(id, (counts.get(id) || 0) + 1));
          return Array.from(counts.entries()).map(([id, count]) => ({
            cardId: id.toString(),
            count
          }));
        };
        cards = countOccurrences(decoded.main);
        extraDeck = countOccurrences(decoded.extra);
        sideboard = countOccurrences(decoded.side);
      } else {
        cards = JSON.parse(row.cards);
        extraDeck = JSON.parse(row.extraDeck);
        sideboard = JSON.parse(row.sideboard);
      }

      return {
        id: row.id,
        name: row.name,
        gameId: row.gameId,
        formatId: row.formatId,
        cards,
        sideboard,
        extraDeck,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      };
    });
  }

  async getCardTypes(gameId: string): Promise<string[]> {
    const rows = this.db.prepare('SELECT DISTINCT type FROM cards WHERE gameId = ? ORDER BY type ASC').all(gameId) as any[];
    return rows.map(row => row.type).filter(Boolean);
  }
}
