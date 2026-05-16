export type GameId = 'yugioh' | 'mtg' | 'pokemon' | 'hearthstone';

export interface Card {
  id: string; // Unique ID (e.g., card code or generated UUID)
  gameId: GameId;
  name: string;
  type: string; // e.g., 'Monster', 'Spell', 'Creature', 'Instant'
  subtypes?: string[]; // e.g., 'Effect', 'Warrior', 'Dragon'
  text: string; // Rules text
  imageUrl?: string;
  rarity?: string;
  // Metadata for filtering/sorting
  attributes?: Record<string, string | number | boolean>; // e.g., ATK, DEF, Mana Cost, Level
}
