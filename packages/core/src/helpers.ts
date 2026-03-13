export interface GeneratorHelpers {
  camelCase(str: string): string;
  pascalCase(str: string): string;
  kebabCase(str: string): string;
  snakeCase(str: string): string;
  tokenToCssVar(path: string[]): string;
  tokenToScssVar(path: string[]): string;
  formatColor(hex: string, format?: 'hex' | 'rgb' | 'hsl'): string;
}

export function createGeneratorHelpers(): GeneratorHelpers {
  return {
    camelCase(str: string): string {
      return str
        .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/^(.)/, (_, c) => c.toLowerCase());
    },

    pascalCase(str: string): string {
      return str
        .replace(/[-_\s]+(.)/g, (_, c) => c.toUpperCase())
        .replace(/^(.)/, (_, c) => c.toUpperCase());
    },

    kebabCase(str: string): string {
      return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[_\s]+/g, '-')
        .toLowerCase();
    },

    snakeCase(str: string): string {
      return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[-\s]+/g, '_')
        .toLowerCase();
    },

    tokenToCssVar(path: string[]): string {
      return `--${path.join('-')}`;
    },

    tokenToScssVar(path: string[]): string {
      return `$${path.join('-')}`;
    },

    formatColor(hex: string, format: 'hex' | 'rgb' | 'hsl' = 'hex'): string {
      if (format === 'hex') return hex;

      const h = hex.replace('#', '');
      const r = parseInt(h.substring(0, 2), 16);
      const g = parseInt(h.substring(2, 4), 16);
      const b = parseInt(h.substring(4, 6), 16);

      if (format === 'rgb') {
        return `rgb(${r}, ${g}, ${b})`;
      }

      // HSL conversion
      const rn = r / 255;
      const gn = g / 255;
      const bn = b / 255;
      const max = Math.max(rn, gn, bn);
      const min = Math.min(rn, gn, bn);
      const l = (max + min) / 2;

      if (max === min) {
        return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
      }

      const d = max - min;
      const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      let hue = 0;

      if (max === rn) hue = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      else if (max === gn) hue = ((bn - rn) / d + 2) / 6;
      else hue = ((rn - gn) / d + 4) / 6;

      return `hsl(${Math.round(hue * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
    },
  };
}
