import { describe, it, expect } from 'vitest';
import { railsGenerator } from '../index.js';
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
    config: { outDir: 'generated/rails' },
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

describe('Rails Component Generation', () => {
  it('should generate Ruby component, ERB template, and SCSS', async () => {
    const gen = railsGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    expect(files.length).toBe(3);

    const rb = files.find(f => f.path.includes('_component.rb'));
    const erb = files.find(f => f.path.includes('.html.erb'));
    const scss = files.find(f => f.path.includes('.scss'));
    expect(rb).toBeDefined();
    expect(erb).toBeDefined();
    expect(scss).toBeDefined();
  });

  it('should generate SCSS with variant classes', async () => {
    const gen = railsGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const scss = files.find(f => f.path.includes('.scss'))!;

    expect(scss.content).toContain('&--primary');
    expect(scss.content).toContain('&--secondary');
    expect(scss.content).toContain('&--outline');
    expect(scss.content).toContain('&--ghost');
  });

  it('should generate SCSS with size classes', async () => {
    const gen = railsGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const scss = files.find(f => f.path.includes('.scss'))!;

    expect(scss.content).toContain('&--sm');
    expect(scss.content).toContain('&--md');
    expect(scss.content).toContain('&--lg');
  });

  it('should generate SCSS with state styles', async () => {
    const gen = railsGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const scss = files.find(f => f.path.includes('.scss'))!;

    expect(scss.content).toContain('&--disabled');
    expect(scss.content).toContain(':hover');
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
