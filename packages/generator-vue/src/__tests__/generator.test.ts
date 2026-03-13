import { describe, it, expect } from 'vitest';
import { vueGenerator } from '../index.js';
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
    config: { outDir: 'generated/vue', typescript: true, darkMode: 'media+class' as const },
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

describe('Vue Generator', () => {
  it('should create a generator plugin with correct metadata', () => {
    const gen = vueGenerator({ typescript: true });
    expect(gen.name).toBe('vue');
    expect(gen.displayName).toBe('Vue');
    expect(gen.platform).toBe('web');
    expect(gen.outputExtensions).toContain('.vue');
    expect(gen.outputExtensions).toContain('.css');
    expect(gen.outputExtensions).toContain('.ts');
  });

  it('should generate CSS, TS tokens, and useTheme composable', async () => {
    const gen = vueGenerator({ typescript: true, darkMode: 'media+class' });
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

    const themeFile = files.find(f => f.path === 'useTheme.ts');
    expect(themeFile).toBeDefined();
    expect(themeFile!.content).toContain('useTheme');
    expect(themeFile!.content).toContain("from 'vue'");
  });

  it('should generate useTheme composable with Vue ref and watchEffect', async () => {
    const gen = vueGenerator({ typescript: true });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const themeFile = files.find(f => f.path === 'useTheme.ts')!;

    expect(themeFile.content).toContain('ref');
    expect(themeFile.content).toContain('watchEffect');
    expect(themeFile.content).toContain('setTheme');
    expect(themeFile.content).toContain('toggleTheme');
    expect(themeFile.content).toContain("type Theme =");
  });

  it('should include dark mode with media query and data-attribute', async () => {
    const gen = vueGenerator({ darkMode: 'media+class' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('prefers-color-scheme');
    expect(cssFile.content).toContain('[data-theme="dark"]');
  });

  it('should generate CSS with correct token values', async () => {
    const gen = vueGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('#3B82F6');
    expect(cssFile.content).toContain('--spacing-xs');
    expect(cssFile.content).toContain('4px');
  });

  it('should skip TS tokens file when typescript is false', async () => {
    const gen = vueGenerator({ typescript: false });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const tsFile = files.find(f => f.path === 'tokens.ts');

    expect(tsFile).toBeUndefined();
    // useTheme should still exist
    const themeFile = files.find(f => f.path === 'useTheme.ts');
    expect(themeFile).toBeDefined();
  });
});
