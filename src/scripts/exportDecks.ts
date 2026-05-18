import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { YuGiOhAdapter } from '../games/yugioh/adapter.js';
import { MtgAdapter } from '../games/mtg/adapter.js';
import { SqliteStorageProvider } from '../services/storage/SqliteStorageProvider.js';
import { YDK } from '../core/utils/ydk.js';
import { MTGArena } from '../core/utils/mtgArena.js';

async function exportDecks() {
  console.log('📤 Starting Starter Deck Export...');

  const storage = new SqliteStorageProvider('./data/duelpath.db');
  const ygoAdapter = new YuGiOhAdapter();
  const mtgAdapter = new MtgAdapter();

  // 1. Export Yu-Gi-Oh Decks (.ydk)
  console.log('\n--- YUGIOH ---');
  const ygoDecks = await ygoAdapter.fetchStarterDecks();
  const ygoDir = './src/games/yugioh/data/starter-decks';
  await mkdir(ygoDir, { recursive: true });

  for (const deck of ygoDecks) {
    console.log(`📦 Exporting ${deck.name}...`);
    
    const resolveToIds = async (cards: { name: string; count: number }[]) => {
      const ids: number[] = [];
      for (const c of cards) {
        const results = await storage.loadCards('yugioh', { search: `$${c.name}`, limit: 1 });
        if (results.length > 0) {
          for (let i = 0; i < c.count; i++) ids.push(parseInt(results[0].id));
        } else {
          console.warn(`⚠️ Card not found in DB: ${c.name}`);
        }
      }
      return ids;
    };

    const mainIds = await resolveToIds(deck.cards);
    const extraIds = await resolveToIds(deck.extraDeck || []);
    
    const content = YDK.encode(mainIds, extraIds);
    const filePath = join(ygoDir, `${deck.id}.ydk`);
    await writeFile(filePath, content);
    console.log(`✅ Saved to ${filePath}`);
  }

  // 2. Export MTG Decks (.txt)
  console.log('\n--- MTG ---');
  const mtgDecks = await mtgAdapter.fetchStarterDecks();
  const mtgDir = './src/games/mtg/data/starter-decks';
  await mkdir(mtgDir, { recursive: true });

  for (const deck of mtgDecks) {
    console.log(`📦 Exporting ${deck.name}...`);
    const content = MTGArena.encode(deck.cards, deck.extraDeck || []);
    const filePath = join(mtgDir, `${deck.id}.txt`);
    await writeFile(filePath, content);
    console.log(`✅ Saved to ${filePath}`);
  }

  console.log('\n🎉 All decks exported successfully!');
  process.exit(0);
}

exportDecks();
