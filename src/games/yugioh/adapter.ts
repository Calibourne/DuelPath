import { GameAdapter } from '../../core/interfaces/GameAdapter.js';
import { Card, GameId } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';
import { StarterDeck } from '../../core/models/StarterDeck.js';

export class YuGiOhAdapter implements GameAdapter {
  gameId: GameId = 'yugioh';
  private apiBase = 'https://db.ygoprodeck.com/api/v7';

  async fetchCards(): Promise<Card[]> {
    console.log('📦 Downloading Yu-Gi-Oh bulk data with banlist info...');
    // Fetching the main set first
    const response = await fetch(`${this.apiBase}/cardinfo.php?misc=yes`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Yu-Gi-Oh cards: ${response.statusText}`);
    }
    const data = await response.json();
    console.log(`✅ Downloaded ${data.data.length} Yu-Gi-Oh cards. Normalizing...`);
    
    return data.data.map((raw: any) => this.normalizeCard(raw));
  }

  async fetchFormats(): Promise<Format[]> {
    // Simulating a "Genesis Points Fetch" from a remote community source
    console.log('📡 Fetching Genesis points from community database...');
    const genesisPoints: Record<string, number> = {
      '80181649': 50, // Cyber Dragon
      '34218066': 30, // Black Luster Soldier
      '6983839': 40,  // Tornado Wall
      '33396948': 20, // Exodia the Forbidden One
      '21820234': 10, // Sangan
      '70781052': 15, // Summoned Skull
    };

    return [
      {
        id: 'tcg-advanced',
        gameId: 'yugioh',
        name: 'TCG Advanced',
        rules: {
          minDeckSize: 40,
          maxDeckSize: 60,
          maxCopiesPerCard: 3,
        }
      },
      {
        id: 'ocg-advanced',
        gameId: 'yugioh',
        name: 'OCG Advanced',
        rules: {
          minDeckSize: 40,
          maxDeckSize: 60,
          maxCopiesPerCard: 3,
        }
      },
      {
        id: 'genesis',
        gameId: 'yugioh',
        name: 'Genesis',
        description: 'A community-driven format with custom rules and card pool.',
        rules: {
          minDeckSize: 40,
          maxDeckSize: 60,
          maxCopiesPerCard: 3,
          maxPoints: 100,
          cardPoints: genesisPoints
        }
      },
      {
        id: 'speed-duel',
        gameId: 'yugioh',
        name: 'Speed Duel',
        rules: {
          minDeckSize: 20,
          maxDeckSize: 30,
          maxCopiesPerCard: 3,
        }
      },
      {
        id: 'goat',
        gameId: 'yugioh',
        name: 'Goat Format',
        description: 'Classic April 2005 retro format.',
        rules: {
          minDeckSize: 40,
          maxDeckSize: 60,
          maxCopiesPerCard: 3,
        }
      },
      {
        id: 'edison',
        gameId: 'yugioh',
        name: 'Edison Format',
        description: 'Popular March 2010 retro format.',
        rules: {
          minDeckSize: 40,
          maxDeckSize: 60,
          maxCopiesPerCard: 3,
        }
      }
    ];
  }

  async fetchStarterDecks(): Promise<StarterDeck[]> {
    return [
      // L26D Decks for TCG Advanced
      {
        id: 'ygo-l26d-striker',
        gameId: 'yugioh',
        formatId: 'tcg-advanced',
        name: 'Sky Striker (L26D)',
        description: 'Modern spells-matter control archetype. Tactical and recursive.',
        coverCardName: 'Sky Striker Mobilize - Engage!',
        cards: [
          { name: 'Sky Striker Ace - Raye', count: 3 },
          { name: 'Sky Striker Ace - Roze', count: 1 },
          { name: 'Sky Striker Mobilize - Engage!', count: 2 },
          { name: 'Sky Striker Mecha - Widow Anchor', count: 3 },
          { name: 'Sky Striker Mecha - Shark Cannon', count: 1 },
          { name: 'Sky Striker Mobilize - Linkage!', count: 3 },
          { name: 'Raigeki', count: 1 },
          { name: 'Mulcharmy Purulia', count: 3 },
        ],
        extraDeck: [
          { name: 'Sky Striker Ace - Kagari', count: 1 },
          { name: 'Sky Striker Ace - Shizuku', count: 3 },
          { name: 'Sky Striker Ace - Azalea', count: 1 },
        ]
      },
      {
        id: 'ygo-l26d-xsaber',
        gameId: 'yugioh',
        formatId: 'tcg-advanced',
        name: 'X-Saber (L26D)',
        description: 'Earth-Synchro aggro. Focuses on explosive Special Summons.',
        coverCardName: 'XX-Saber Faultroll',
        cards: [
          { name: 'XX-Saber Faultroll', count: 3 },
          { name: 'XX-Saber Boggart Knight', count: 3 },
          { name: 'X-Saber Pashuul', count: 2 },
          { name: 'XX-Saber Fulhelmknight', count: 3 },
          { name: 'X-Saber Airbellum', count: 2 },
          { name: 'Mulcharmy Fuwalos', count: 3 },
          { name: 'Monster Reborn', count: 1 },
        ],
        extraDeck: [
          { name: 'XX-Saber Gottoms', count: 2 },
          { name: 'XX-Saber Hyunlei', count: 2 },
        ]
      },
      // Classic Decks for Goat/Edison
      {
        id: 'ygo-classic-kaiba',
        gameId: 'yugioh',
        formatId: 'goat',
        name: "Kaiba's Pride",
        description: 'High-ATK Dragon beatdown. Ruthless and powerful.',
        coverCardName: 'Blue-Eyes White Dragon',
        cards: [
          { name: 'Blue-Eyes White Dragon', count: 3 },
          { name: 'Kaibaman', count: 2 },
          { name: 'Lord of D.', count: 2 },
          { name: 'The Flute of Summoning Dragon', count: 2 },
          { name: 'Burst Stream of Destruction', count: 1 },
          { name: 'Man-Eater Bug', count: 2 },
          { name: 'Trap Hole', count: 2 },
        ]
      },
      {
        id: 'ygo-classic-joey',
        gameId: 'yugioh',
        formatId: 'goat',
        name: "Joey's Potential",
        description: 'Warrior synergy and Red-Eyes explosive power.',
        coverCardName: 'Red-Eyes B. Dragon',
        cards: [
          { name: 'Red-Eyes B. Dragon', count: 2 },
          { name: 'Gearfried the Iron Knight', count: 3 },
          { name: 'Baby Dragon', count: 2 },
          { name: 'Kunai with Chain', count: 2 },
          { name: 'Scapegoat', count: 1 },
        ]
      }
    ];
  }

  normalizeCard(raw: any): Card {
    // Canonical Type Normalization
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
        // Store original type for detail view
        original_type: raw.type,
        // Store banlist info from API
        ban_tcg: raw.banlist_info?.ban_tcg,
        ban_ocg: raw.banlist_info?.ban_ocg,
        ban_goat: raw.banlist_info?.ban_goat,
      }
    };
  }
}
