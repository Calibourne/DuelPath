/**
 * MTG Arena Deck Format Utility
 * Format: [Count] [Card Name] ([Set]) [Number]
 * Note: Since we use simple counts and names in our starter decks, we'll support a simplified version.
 */

export class MTGArena {
  /**
   * Encodes deck segments into a standard MTG Arena text string.
   */
  static encode(main: { name: string; count: number }[], sideboard: { name: string; count: number }[] = []): string {
    let output = 'Deck\n';
    main.forEach(c => {
      output += `${c.count} ${c.name}\n`;
    });

    if (sideboard.length > 0) {
      output += '\nSideboard\n';
      sideboard.forEach(c => {
        output += `${c.count} ${c.name}\n`;
      });
    }

    return output.trim();
  }

  /**
   * Decodes an MTG Arena text string into deck segments.
   */
  static decode(text: string): { main: { name: string; count: number }[]; sideboard: { name: string; count: number }[] } {
    const lines = text.split('\n');
    const main: { name: string; count: number }[] = [];
    const sideboard: { name: string; count: number }[] = [];
    let currentSegment = main;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'Deck') return;
      if (trimmed === 'Sideboard') {
        currentSegment = sideboard;
        return;
      }

      // Regex to match: [Count] [Name] ([Set]) [Number]
      // We'll be flexible to handle just [Count] [Name]
      const match = trimmed.match(/^(\d+)\s+(.+)$/);
      if (match) {
        const count = parseInt(match[1]);
        let name = match[2];
        
        // Remove ([Set]) [Number] if present
        name = name.replace(/\s*\([^)]+\)\s*\d*$/, '').trim();
        
        currentSegment.push({ name, count });
      }
    });

    return { main, sideboard };
  }
}
