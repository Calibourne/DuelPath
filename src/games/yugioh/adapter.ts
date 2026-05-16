import { GameAdapter } from '../../core/interfaces/GameAdapter.js';
import { Card, GameId } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';

export class YuGiOhAdapter implements GameAdapter {
  gameId: GameId = 'yugioh';
  private apiBase = 'https://db.ygoprodeck.com/api/v7';

  async fetchCards(): Promise<Card[]> {
    // For prototype, we fetch a limited set (e.g., first 50 cards)
    const response = await fetch(`${this.apiBase}/cardinfo.php?num=50&offset=0`);
    if (!response.ok) {
      throw new Error(`Failed to fetch Yu-Gi-Oh cards: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data.map((raw: any) => this.normalizeCard(raw));
  }

  async fetchFormats(): Promise<Format[]> {
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
          cardPoints: {
            '80181649': 50, // Cyber Dragon (example)
            '34218066': 30, // Black Luster Soldier (example)
          }
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

  normalizeCard(raw: any): Card {
    return {
      id: raw.id.toString(),
      gameId: 'yugioh',
      name: raw.name,
      type: raw.type,
      subtypes: raw.race ? [raw.race] : [],
      text: raw.desc,
      imageUrl: raw.card_images?.[0]?.image_url,
      rarity: raw.card_sets?.[0]?.set_rarity,
      attributes: {
        atk: raw.atk,
        def: raw.def,
        level: raw.level,
        attribute: raw.attribute,
        race: raw.race,
      }
    };
  }
}
