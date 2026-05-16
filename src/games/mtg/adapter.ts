import { GameAdapter } from '../../core/interfaces/GameAdapter.js';
import { Card, GameId } from '../../core/models/Card.js';
import { Format } from '../../core/models/Format.js';

export class MtgAdapter implements GameAdapter {
  gameId: GameId = 'mtg';
  private apiBase = 'https://api.scryfall.com';

  async fetchCards(): Promise<Card[]> {
    // For prototype, fetch a small set of cards
    const response = await fetch(`${this.apiBase}/cards/search?q=f:standard&order=name`);
    if (!response.ok) {
      throw new Error(`Failed to fetch MTG cards: ${response.statusText}`);
    }
    const data = await response.json();
    // Scryfall returns up to 175 cards per page
    return data.data.slice(0, 50).map((raw: any) => this.normalizeCard(raw));
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

  normalizeCard(raw: any): Card {
    return {
      id: raw.id,
      gameId: 'mtg',
      name: raw.name,
      type: raw.type_line,
      subtypes: raw.type_line.split('—').pop()?.trim().split(' ') || [],
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
      }
    };
  }
}
