/**
 * YDK (Yu-Gi-Oh! Deck) File Utility
 * Format:
 * #main
 * [passcode]
 * ...
 * #extra
 * ...
 * !side
 * ...
 */

export class YDK {
  /**
   * Encodes deck segments into a classic .ydk file string.
   */
  static encode(mainIds: number[], extraIds: number[] = [], sideIds: number[] = []): string {
    let output = '#main\n';
    mainIds.forEach(id => output += `${id}\n`);
    
    output += '#extra\n';
    extraIds.forEach(id => output += `${id}\n`);
    
    output += '!side\n';
    sideIds.forEach(id => output += `${id}\n`);
    
    return output.trim();
  }

  /**
   * Decodes a .ydk file string into deck segments.
   */
  static decode(text: string): { main: number[]; extra: number[]; side: number[] } {
    const lines = text.split('\n');
    const main: number[] = [];
    const extra: number[] = [];
    const side: number[] = [];
    let currentSegment = main;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#created by')) return;

      if (trimmed === '#main') {
        currentSegment = main;
      } else if (trimmed === '#extra') {
        currentSegment = extra;
      } else if (trimmed === '!side') {
        currentSegment = side;
      } else if (/^\d+$/.test(trimmed)) {
        currentSegment.push(parseInt(trimmed));
      }
    });

    return { main, extra, side };
  }
}
