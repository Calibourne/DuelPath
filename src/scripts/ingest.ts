import { YuGiOhAdapter } from '../games/yugioh/adapter.js';
import { MtgAdapter } from '../games/mtg/adapter.js';
import { SqliteStorageProvider } from '../services/storage/SqliteStorageProvider.js';

async function ingest() {
  console.log('🚀 Starting DuelPath Full Card Ingestion...');

  const storage = new SqliteStorageProvider('./data/duelpath.db');
  const adapters = [
    new YuGiOhAdapter(),
    new MtgAdapter()
  ];

  for (const adapter of adapters) {
    try {
      console.log(`\n--- ${adapter.gameId.toUpperCase()} ---`);
      
      console.log(`📡 Fetching ${adapter.gameId} formats...`);
      const formats = await adapter.fetchFormats();
      if (adapter.gameId === 'yugioh') {
        console.log('✅ Integrated Genesys points into Yu-Gi-Oh formats.');
      }
      await storage.saveFormats(adapter.gameId, formats);
      console.log(`✅ Saved ${formats.length} formats.`);

      console.log(`📡 Fetching ${adapter.gameId} cards (Full Library)...`);
      const cards = await adapter.fetchCards();
      await storage.saveCards(adapter.gameId, cards);
      console.log(`✅ Saved ${cards.length} cards.`);

    } catch (error) {
      console.error(`❌ Failed to ingest ${adapter.gameId}:`, error);
    }
  }

  console.log('\n🎉 Ingestion complete! Rebuilding search indices...');
  // Trigger FTS rebuild if needed (the SqliteStorageProvider.saveCards already does this)
  console.log('🏁 Database is ready.');
  process.exit(0);
}

ingest();
