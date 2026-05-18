import express from 'express';
import cors from 'cors';
import { SqliteStorageProvider } from '../services/storage/SqliteStorageProvider.js';
import { YuGiOhAdapter } from '../games/yugioh/adapter.js';
import { MtgAdapter } from '../games/mtg/adapter.js';

const app = express();
const port = 3001;
const storage = new SqliteStorageProvider('./data/duelpath.db');

const ygoAdapter = new YuGiOhAdapter();
const mtgAdapter = new MtgAdapter();

app.use(cors());
app.use(express.json());

// Get available games (hardcoded for now based on our models)
app.get('/api/games', (req, res) => {
  res.json([
    { id: 'yugioh', name: 'Yu-Gi-Oh!' },
    { id: 'mtg', name: 'Magic: The Gathering' },
    { id: 'pokemon', name: 'Pokémon TCG' },
    { id: 'hearthstone', name: 'Hearthstone' }
  ]);
});

// Get formats for a specific game
app.get('/api/games/:gameId/formats', async (req, res) => {
  try {
    const formats = await storage.loadFormats(req.params.gameId);
    res.json(formats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load formats' });
  }
});

// Get cards for a specific game
app.get('/api/games/:gameId/cards', async (req, res) => {
  try {
    const { limit, offset, search, type, types, attributes } = req.query;
    // Support both single 'type' and multiple 'types' (from EDOPro panel)
    let typeArray: string[] = [];
    if (types) {
      typeArray = Array.isArray(types) ? (types as string[]) : [types as string];
    } else if (type) {
      typeArray = [type as string];
    }

    let attrFilters: Record<string, any> = {};
    if (attributes) {
      try {
        attrFilters = JSON.parse(attributes as string);
      } catch (e) {
        console.warn('⚠️ [API] Failed to parse attributes JSON:', attributes);
      }
    }

    console.log(`🔍 [API] Fetching ${req.params.gameId} cards | Search: "${search || ''}" | Types: [${typeArray.join(', ')}] | Attrs: ${JSON.stringify(attrFilters)} | Offset: ${offset || 0}`);
    
    const cards = await storage.loadCards(req.params.gameId, {
      limit: limit ? parseInt(limit as string) : 50,
      offset: offset ? parseInt(offset as string) : 0,
      search: search as string,
      types: typeArray,
      attributeFilters: attrFilters,
    });
    res.json(cards);
  } catch (error) {
    console.error('❌ [API] Error loading cards:', error);
    res.status(500).json({ error: 'Failed to load cards' });
  }
});

// Get unique card types for a specific game
app.get('/api/games/:gameId/types', async (req, res) => {
  try {
    const types = await storage.getCardTypes(req.params.gameId);
    res.json(types);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load card types' });
  }
});

// Get starter decks for a game and format
app.get('/api/games/:gameId/formats/:formatId/starter-decks', async (req, res) => {
  try {
    const { gameId, formatId } = req.params;
    let decks = [];
    if (gameId === 'yugioh') {
      decks = await ygoAdapter.fetchStarterDecks();
    } else if (gameId === 'mtg') {
      decks = await mtgAdapter.fetchStarterDecks();
    }
    
    // Filter by format
    const filtered = decks.filter(d => d.formatId === formatId);
    res.json(filtered);
  } catch (error) {
    console.error('❌ [API] Error loading starter decks:', error);
    res.status(500).json({ error: 'Failed to load starter decks' });
  }
});

// Get cards by name (batch)
app.post('/api/games/:gameId/cards/by-names', async (req, res) => {
  try {
    const { names } = req.body;
    if (!Array.isArray(names)) {
      return res.status(400).json({ error: 'Names must be an array' });
    }
    
    // Resolve each name to a card
    const results = [];
    for (const name of names) {
      const cards = await storage.loadCards(req.params.gameId, {
        search: `$${name}`, // Use the $ prefix we implemented for exact name match
        limit: 1
      });
      if (cards.length > 0) results.push(cards[0]);
    }
    res.json(results);
  } catch (error) {
    console.error('❌ [API] Error loading cards by names:', error);
    res.status(500).json({ error: 'Failed to load cards' });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`📡 DuelPath API Server running at http://0.0.0.0:${port}`);
});
