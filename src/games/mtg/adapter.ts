import { GameAdapter } from '../../core/interfaces/GameAdapter.js';
import { Card, GameId } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';
import { StarterDeck } from '../../core/models/StarterDeck.js';

export class MtgAdapter implements GameAdapter {
  gameId: GameId = 'mtg';
  private apiBase = 'https://api.scryfall.com';

  async fetchCards(): Promise<Card[]> {
    console.log('📦 Fetching MTG bulk data metadata...');
    const bulkMetadataRes = await fetch(`${this.apiBase}/bulk-data`);
    if (!bulkMetadataRes.ok) {
      throw new Error(`Failed to fetch MTG bulk metadata: ${bulkMetadataRes.statusText}`);
    }
    const bulkMetadata = await bulkMetadataRes.json();
    const oracleCardsUri = bulkMetadata.data.find((d: any) => d.type === 'oracle_cards')?.download_uri;

    if (!oracleCardsUri) {
      throw new Error('Could not find download URI for MTG Oracle Cards bulk data.');
    }

    console.log('📦 Downloading MTG bulk data (this may take a moment)...');
    const response = await fetch(oracleCardsUri);
    if (!response.ok) {
      throw new Error(`Failed to download MTG bulk data: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Downloaded ${data.length} MTG cards. Normalizing...`);
    return data.map((raw: any) => this.normalizeCard(raw));
  }

  async fetchFormats(): Promise<Format[]> {
    return [
      {
        id: 'standard',
        gameId: 'mtg',
        name: 'Standard',
        rules: {
          minDeckSize: 60,
          maxCopiesPerCard: 4,
        }
      },
      {
        id: 'commander',
        gameId: 'mtg',
        name: 'Commander / EDH',
        description: '100-card singleton format.',
        rules: {
          minDeckSize: 100,
          maxDeckSize: 100,
          maxCopiesPerCard: 1,
        }
      },
      {
        id: 'modern',
        gameId: 'mtg',
        name: 'Modern',
        rules: {
          minDeckSize: 60,
          maxCopiesPerCard: 4,
        }
      },
      {
        id: 'pauper',
        gameId: 'mtg',
        name: 'Pauper',
        description: 'Common cards only.',
        rules: {
          minDeckSize: 60,
          maxCopiesPerCard: 4,
          allowedCardTypes: ['Common'], // Simplified representation
        }
      },
      {
        id: 'pioneer',
        gameId: 'mtg',
        name: 'Pioneer',
        rules: {
          minDeckSize: 60,
          maxCopiesPerCard: 4,
        }
      },
      {
        id: 'legacy',
        gameId: 'mtg',
        name: 'Legacy',
        rules: {
          minDeckSize: 60,
          maxCopiesPerCard: 4,
        }
      },
      {
        id: 'vintage',
        gameId: 'mtg',
        name: 'Vintage',
        rules: {
          minDeckSize: 60,
          maxCopiesPerCard: 4,
        }
      }
    ];
  }

  async fetchStarterDecks(): Promise<StarterDeck[]> {
    return [
      {
        id: 'mtg-challenger-white',
        gameId: 'mtg',
        formatId: 'standard',
        name: 'Mono White Aggro',
        description: 'Fast, disruptive creature-based pressure. White-weenie style.',
        coverCardName: 'Thalia, Guardian of Thraben',
        cards: [
          { name: 'Thalia, Guardian of Thraben', count: 4 },
          { name: 'Adeline, Resplendent Cathar', count: 1 },
          { name: 'Luminarch Aspirant', count: 4 },
          { name: 'Skyclave Apparition', count: 4 },
          { name: 'Elite Spellbinder', count: 4 },
          { name: 'Plains', count: 20 },
        ]
      },
      {
        id: 'mtg-challenger-dimir',
        gameId: 'mtg',
        formatId: 'standard',
        name: 'Dimir Control',
        description: '"Draw-go" style with heavy removal and counterspells.',
        coverCardName: 'Hullbreaker Horror',
        cards: [
          { name: 'Hullbreaker Horror', count: 2 },
          { name: 'Iymrith, Desert Doom', count: 1 },
          { name: 'Memory Deluge', count: 4 },
          { name: 'Saw It Coming', count: 4 },
          { name: 'Infernal Grasp', count: 4 },
          { name: 'Island', count: 10 },
          { name: 'Swamp', count: 10 },
        ]
      }
    ];
  }

  normalizeCard(raw: any): Card {
    const typeLine = raw.type_line || '';
    
    // Canonical Type Normalization
    let canonicalType = 'Other';
    if (typeLine.includes('Creature')) canonicalType = 'Creature';
    else if (typeLine.includes('Instant')) canonicalType = 'Instant';
    else if (typeLine.includes('Sorcery')) canonicalType = 'Sorcery';
    else if (typeLine.includes('Artifact')) canonicalType = 'Artifact';
    else if (typeLine.includes('Enchantment')) canonicalType = 'Enchantment';
    else if (typeLine.includes('Land')) canonicalType = 'Land';
    else if (typeLine.includes('Planeswalker')) canonicalType = 'Planeswalker';

    return {
      id: raw.id,
      gameId: 'mtg',
      name: raw.name,
      type: canonicalType,
      subtypes: typeLine.split('—').pop()?.trim().split(' ') || [],
      text: raw.oracle_text || '',
      imageUrl: raw.image_uris?.normal || raw.card_faces?.[0]?.image_uris?.normal,
      rarity: raw.rarity,
      attributes: {
        mana_cost: raw.mana_cost,
        cmc: raw.cmc,
        power: raw.power,
        toughness: raw.toughness,
        colors: raw.colors,
        set: raw.set_name,
        // Store original type line
        original_type: typeLine,
      }
    };
  }
}
