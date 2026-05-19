/**
 * YDKE (Yu-Gi-Oh! Deck Encoding) Utility
 * Format: ydke://[MainB64]![ExtraB64]![SideB64]!
 * Logic: Card passcodes as 32-bit Little Endian integers packed and Base64 encoded.
 */

export class YDKE {
  /**
   * Encodes deck segments into a YDKE URI string.
   */
  static encode(main: number[], extra: number[] = [], side: number[] = []): string {
    const encodeSegment = (ids: number[]) => {
      if (ids.length === 0) return '';
      const buffer = new ArrayBuffer(ids.length * 4);
      const view = new DataView(buffer);
      ids.forEach((id, i) => {
        view.setUint32(i * 4, id, true); // true = Little Endian
      });
      
      // Convert ArrayBuffer to Base64 (Platform agnostic way)
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    return `ydke://${encodeSegment(main)}!${encodeSegment(extra)}!${encodeSegment(side)}!`;
  }

  /**
   * Decodes a YDKE URI string into deck segments.
   */
  static decode(ydke: string): { main: number[]; extra: number[]; side: number[] } {
    if (!ydke.startsWith('ydke://')) {
      throw new Error('Invalid YDKE protocol');
    }

    const segments = ydke.replace('ydke://', '').split('!');
    
    const decodeSegment = (b64: string): number[] => {
      if (!b64) return [];
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      
      const ids: number[] = [];
      const view = new DataView(bytes.buffer);
      for (let i = 0; i < bytes.length; i += 4) {
        ids.push(view.getUint32(i, true)); // true = Little Endian
      }
      return ids;
    };

    return {
      main: decodeSegment(segments[0] || ''),
      extra: decodeSegment(segments[1] || ''),
      side: decodeSegment(segments[2] || '')
    };
  }
}

/**
 * Universal btoa/atob for Node/Browser compatibility
 */
function btoa(str: string): string {
  if (typeof window !== 'undefined' && window.btoa) return window.btoa(str);
  return Buffer.from(str, 'binary').toString('base64');
}

function atob(b64: string): string {
  if (typeof window !== 'undefined' && window.atob) return window.atob(b64);
  return Buffer.from(b64, 'base64').toString('binary');
}
