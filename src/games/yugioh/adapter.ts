import { GameAdapter } from '../../core/interfaces/GameAdapter.js';
import { Card, GameId } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';
import { StarterDeck } from '../../core/models/StarterDeck.js';
import starterDecks from './data/starter-decks.json' with { type: 'json' };

export class YuGiOhAdapter implements GameAdapter {
  gameId: GameId = 'yugioh';
  private apiBase = 'https://db.ygoprodeck.com/api/v7';

  async fetchCards(): Promise<Card[]> {
    console.log('📦 Downloading Yu-Gi-Oh bulk data with banlist info...');
    const response = await fetch(`${this.apiBase}/cardinfo.php?misc=yes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Yu-Gi-Oh cards: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`✅ Downloaded ${data.data.length} Yu-Gi-Oh cards. Normalizing...`);
    return data.data.map((raw: any) => this.normalizeCard(raw));
  }

  async fetchFormats(): Promise<Format[]> {
    console.log('📡 Fetching Genesys point list from live API...');
    let genesysPoints: Record<string, number> = {};
    try {
      const response = await fetch(`${this.apiBase}/cardinfo.php?format=genesys&misc=yes`);
      if (response.ok) {
        const data = await response.json();
        data.data.forEach((card: any) => {
          const points = card.misc_info?.[0]?.genesys_points;
          if (points !== undefined) genesysPoints[card.name] = points;
        });
        console.log(`✅ Successfully synced ${Object.keys(genesysPoints).length} Genesys point values.`);
      }
    } catch (e) {
      console.warn('⚠️ [YGO] Failed to fetch live Genesys points.');
    }

    return [
      { id: 'tcg-advanced', gameId: 'yugioh', name: 'TCG Advanced', rules: { minDeckSize: 40, maxDeckSize: 60, maxCopiesPerCard: 3 } },
      { id: 'ocg-advanced', gameId: 'yugioh', name: 'OCG Advanced', rules: { minDeckSize: 40, maxDeckSize: 60, maxCopiesPerCard: 3 } },
      {
        id: 'genesys',
        gameId: 'yugioh',
        name: 'Genesys',
        description: 'A community-driven format with custom rules and card pool.',
        rules: { minDeckSize: 40, maxDeckSize: 60, maxCopiesPerCard: 3, maxPoints: 100, cardPointsByName: genesysPoints }
      },
      { id: 'speed-duel', gameId: 'yugioh', name: 'Speed Duel', rules: { minDeckSize: 20, maxDeckSize: 30, maxCopiesPerCard: 3 } },
      { id: 'goat', gameId: 'yugioh', name: 'Goat Format', description: 'Classic April 2005 retro format.', rules: { minDeckSize: 40, maxDeckSize: 60, maxCopiesPerCard: 3 } },
      { id: 'edison', gameId: 'yugioh', name: 'Edison Format', description: 'Popular March 2010 retro format.', rules: { minDeckSize: 40, maxDeckSize: 60, maxCopiesPerCard: 3 } }
    ];
  }

  async fetchStarterDecks(): Promise<StarterDeck[]> {
    return starterDecks as StarterDeck[];
  }

  normalizeCard(raw: any): Card {
    let canonicalType = 'Other';
    if (raw.type?.toLowerCase().includes('monster')) canonicalType = 'Monster';
    else if (raw.type?.toLowerCase().includes('spell')) canonicalType = 'Spell';
    else if (raw.type?.toLowerCase().includes('trap')) canonicalType = 'Trap';

    return {
      id: raw.id.toString(),
      gameId: 'yugioh',
      name: raw.name,
      type: canonicalType,
      subtypes: raw.race ? [raw.race, raw.type] : [raw.type],
      text: raw.desc,
      imageUrl: raw.card_images?.[0]?.image_url,
      rarity: raw.card_sets?.[0]?.set_rarity,
      attributes: {
        atk: raw.atk,
        def: raw.def,
        level: raw.level,
        attribute: raw.attribute,
        race: raw.race,
        linkval: raw.linkval,
        original_type: raw.type,
        ban_tcg: raw.banlist_info?.ban_tcg,
        ban_ocg: raw.banlist_info?.ban_ocg,
        ban_goat: raw.banlist_info?.ban_goat,
      }
    };
  }
}
