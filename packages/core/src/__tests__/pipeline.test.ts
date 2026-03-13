import { describe, it, expect } from 'vitest';
import { buildTokenSet } from '../pipeline.js';
import path from 'node:path';

const TEMPLATES_DIR = path.resolve(__dirname, '../../../../templates');

describe('buildTokenSet', () => {
  it('should parse minimal tokens', async () => {
    const result = await buildTokenSet({
      tokens: ['minimal.tokens.json'],
      basePath: TEMPLATES_DIR,
    });

    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.groups.length).toBeGreaterThan(0);

    // Check a specific token
    const primaryColor = result.tokens.find(t => t.path.join('.') === 'color.primary');
    expect(primaryColor).toBeDefined();
    expect(primaryColor!.$type).toBe('color');
    expect(primaryColor!.$value.type).toBe('color');
  });

  it('should resolve alias references', async () => {
    const result = await buildTokenSet({
      tokens: ['minimal.tokens.json'],
      basePath: TEMPLATES_DIR,
    });

    // color.background.primary references {color.white}
    const bgPrimary = result.tokens.find(t => t.path.join('.') === 'color.background.primary');
    expect(bgPrimary).toBeDefined();
    expect(bgPrimary!.$value.type).toBe('color');
    if (bgPrimary!.$value.type === 'color') {
      expect(bgPrimary!.$value.hex).toBe('#FFFFFF');
    }
  });

  it('should resolve dark theme', async () => {
    const result = await buildTokenSet({
      tokens: ['minimal.tokens.json'],
      basePath: TEMPLATES_DIR,
      themes: {
        default: 'light',
        dark: { file: path.join(TEMPLATES_DIR, 'dark.tokens.json') },
      },
    });

    expect(result.themes.default).toBe('light');
    expect(result.themes.themes['dark']).toBeDefined();
    expect(result.themes.themes['dark'].name).toBe('dark');
    expect(result.themes.themes['dark'].tokens.length).toBeGreaterThan(0);
  });
});
