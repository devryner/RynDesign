import { describe, it, expect } from 'vitest';
import { vueGenerator } from '../index.js';
import { buildTokenSet, loadComponents, resolveComponent } from '@ryndesign/core';
import path from 'node:path';

const TEMPLATES_DIR = path.resolve(__dirname, '../../../../templates');
const COMPONENTS_DIR = path.resolve(__dirname, '../../../../components');

async function getTestContext() {
  const tokenSet = await buildTokenSet({
    tokens: ['full.tokens.json'],
    basePath: TEMPLATES_DIR,
    themes: {
      default: 'light',
      dark: { file: path.join(TEMPLATES_DIR, 'dark.tokens.json') },
    },
  });

  return {
    tokenSet,
    config: { outDir: 'generated/vue' },
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

describe('Vue Component Generation', () => {
  it('should generate Vue SFC for Button component', async () => {
    const gen = vueGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    expect(files.length).toBe(1);
    expect(files[0].path).toContain('.vue');
  });

  it('should generate CSS with all variant classes', async () => {
    const gen = vueGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const vue = files[0].content;

    expect(vue).toContain('.button--primary');
    expect(vue).toContain('.button--secondary');
    expect(vue).toContain('.button--outline');
    expect(vue).toContain('.button--ghost');
  });

  it('should generate CSS with all size classes', async () => {
    const gen = vueGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const vue = files[0].content;

    expect(vue).toContain('.button--sm');
    expect(vue).toContain('.button--md');
    expect(vue).toContain('.button--lg');
  });

  it('should generate state styles', async () => {
    const gen = vueGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const vue = files[0].content;

    expect(vue).toContain(':hover');
    expect(vue).toContain('.button--disabled');
  });

  it('should include variantTokens in resolved component', async () => {
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    expect(resolved.variantTokens).toBeDefined();
    expect(resolved.variantTokens['primary']).toBeDefined();
    expect(resolved.variantTokens['primary']['md']).toBeDefined();
  });
});
