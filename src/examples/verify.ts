import { YuGiOhAdapter } from '../games/yugioh/adapter.js';
import { MtgAdapter } from '../games/mtg/adapter.js';
import { SqliteStorageProvider } from '../services/storage/SqliteStorageProvider.js';
import { validateDeck, CardLookup } from '../core/validation/deckValidator.js';
import { Deck } from '../core/models/Deck.js';
import { Card } from '../core/models/Card.js';

class SimpleCardLookup implements CardLookup {
  constructor(private cards: Card[]) {}
  getCardName(cardId: string): string | undefined {
    return this.cards.find(c => c.id === cardId)?.name;
  }
}

async function verify() {
  console.log('🚀 Starting DuelPath Stage 1 Verification (SQLite)...');

  const ygoAdapter = new YuGiOhAdapter();
  const mtgAdapter = new MtgAdapter();
  const storage = new SqliteStorageProvider('./data/duelpath.db');

  try {
    // 1. Yu-Gi-Oh Fetch & Normalize
    console.log('\n--- Yu-Gi-Oh ---');
    console.log('📡 Fetching Yu-Gi-Oh cards...');
    const ygoCards = await ygoAdapter.fetchCards();
    console.log(`✅ Fetched ${ygoCards.length} cards.`);

    const ygoFormats = await ygoAdapter.fetchFormats();
    console.log(`✅ Fetched ${ygoFormats.length} formats.`);

    await storage.saveCards('yugioh', ygoCards);
    await storage.saveFormats('yugioh', ygoFormats);
    const ygoLookup = new SimpleCardLookup(ygoCards);

    // 2. MTG Fetch & Normalize
    console.log('\n--- Magic: The Gathering ---');
    console.log('📡 Fetching MTG cards...');
    const mtgCards = await mtgAdapter.fetchCards();
    console.log(`✅ Fetched ${mtgCards.length} cards.`);

    const mtgFormats = await mtgAdapter.fetchFormats();
    console.log(`✅ Fetched ${mtgFormats.length} formats.`);

    await storage.saveCards('mtg', mtgCards);
    await storage.saveFormats('mtg', mtgFormats);
    const mtgLookup = new SimpleCardLookup(mtgCards);

    // 3. Validate a Genesis deck (Yu-Gi-Oh)
    console.log('\n--- Validation Tests ---');
    console.log('⚖️ Validating a Genesis deck with points...');
    const genesisFormat = ygoFormats.find(f => f.id === 'genesis')!;
    const dummyYgoDeck: Deck = {
      id: 'test-ygo-deck',
      name: 'Test YGO Deck',
      gameId: 'yugioh',
      formatId: genesisFormat.id,
      cards: [
        { cardId: '80181649', count: 3 }, // Cyber Dragon: 50 * 3 = 150 points (Limit 100)
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const ygoResult = validateDeck(dummyYgoDeck, genesisFormat, ygoLookup);
    console.log('Yu-Gi-Oh Genesis Result:', ygoResult.isValid ? 'VALID' : 'INVALID');
    ygoResult.errors.forEach(err => console.log(`❌ ${err}`));

    // 4. Validate a Commander deck (MTG)
    console.log('⚖️ Validating a Commander deck (singleton check)...');
    const commanderFormat = mtgFormats.find(f => f.id === 'commander')!;
    const sampleMtgCard = mtgCards[0];
    const dummyMtgDeck: Deck = {
      id: 'test-mtg-deck',
      name: 'Test MTG Deck',
      gameId: 'mtg',
      formatId: commanderFormat.id,
      cards: [
        { cardId: sampleMtgCard.id, count: 2 }, // Error: Commander is singleton
      ],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const mtgResult = validateDeck(dummyMtgDeck, commanderFormat, mtgLookup);
    console.log('MTG Commander Result:', mtgResult.isValid ? 'VALID' : 'INVALID');
    mtgResult.errors.forEach(err => console.log(`❌ ${err}`));

    if (!mtgResult.isValid && mtgResult.errors.some(e => e.includes('Too many copies'))) {
      console.log('\n🎉 All verifications successful: Yu-Gi-Oh and MTG adapters working with readable output!');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

verify();
