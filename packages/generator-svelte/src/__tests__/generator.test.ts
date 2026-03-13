import { describe, it, expect } from 'vitest';
import { svelteGenerator } from '../index.js';
import { buildTokenSet } from '@ryndesign/core';
import path from 'node:path';

const TEMPLATES_DIR = path.resolve(__dirname, '../../../../templates');

async function getTestContext() {
  const tokenSet = await buildTokenSet({
    tokens: ['minimal.tokens.json'],
    basePath: TEMPLATES_DIR,
    themes: {
      default: 'light',
      dark: { file: path.join(TEMPLATES_DIR, 'dark.tokens.json') },
    },
  });

  return {
    tokenSet,
    config: { outDir: 'generated/svelte', typescript: true, darkMode: 'media+class' as const },
    outputDir: '/tmp/test-output',
    helpers: {
      camelCase: (s: string) => s.replace(/[-_](\w)/g, (_, c) => c.toUpperCase()),
      pascalCase: (s: string) => s.replace(/(^|[-_])(\w)/g, (_, __, c) => c.toUpperCase()),
      kebabCase: (s: string) => s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      snakeCase: (s: string) => s.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase(),
      tokenToCssVar: (p: string[]) => `--${p.join('-')}`,
      tokenToScssVar: (p: string[]) => `$${p.join('-')}`,
      formatColor: (hex: string) => hex,
    },
  };
}

describe('Svelte Generator', () => {
  it('should create a generator plugin with correct metadata', () => {
    const gen = svelteGenerator({ typescript: true });
    expect(gen.name).toBe('svelte');
    expect(gen.displayName).toBe('Svelte');
    expect(gen.platform).toBe('web');
    expect(gen.outputExtensions).toContain('.svelte');
    expect(gen.outputExtensions).toContain('.css');
    expect(gen.outputExtensions).toContain('.ts');
  });

  it('should generate CSS, TS tokens, and theme store', async () => {
    const gen = svelteGenerator({ typescript: true, darkMode: 'media+class' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    expect(files.length).toBeGreaterThanOrEqual(3);

    const cssFile = files.find(f => f.path === 'tokens.css');
    expect(cssFile).toBeDefined();
    expect(cssFile!.content).toContain(':root');
    expect(cssFile!.content).toContain('--color-primary');

    const tsFile = files.find(f => f.path === 'tokens.ts');
    expect(tsFile).toBeDefined();
    expect(tsFile!.content).toContain('export const tokens');

    const themeStore = files.find(f => f.path === 'themeStore.ts');
    expect(themeStore).toBeDefined();
    expect(themeStore!.content).toContain('writable');
    expect(themeStore!.content).toContain("from 'svelte/store'");
  });

  it('should generate Svelte theme store with writable and helpers', async () => {
    const gen = svelteGenerator({ typescript: true });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const themeStore = files.find(f => f.path === 'themeStore.ts')!;

    expect(themeStore.content).toContain('export const theme = writable');
    expect(themeStore.content).toContain('setTheme');
    expect(themeStore.content).toContain('toggleTheme');
    expect(themeStore.content).toContain("type Theme =");
    expect(themeStore.content).toContain('data-theme');
  });

  it('should include dark mode CSS', async () => {
    const gen = svelteGenerator({ darkMode: 'media+class' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('prefers-color-scheme');
    expect(cssFile.content).toContain('[data-theme="dark"]');
  });

  it('should generate correct CSS token values from minimal template', async () => {
    const gen = svelteGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('#3B82F6');
    expect(cssFile.content).toContain('--spacing-md');
    expect(cssFile.content).toContain('16px');
  });

  it('should skip TS tokens file when typescript is false', async () => {
    const gen = svelteGenerator({ typescript: false });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    expect(files.find(f => f.path === 'tokens.ts')).toBeUndefined();
    expect(files.find(f => f.path === 'themeStore.ts')).toBeDefined();
  });
});
