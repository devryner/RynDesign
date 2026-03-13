import { describe, it, expect } from 'vitest';
import { uikitGenerator } from '../index.js';
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
    config: { outDir: 'generated/uikit' },
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

describe('UIKit Component Generation', () => {
  it('should generate Swift file for Button', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    expect(files.length).toBe(1);
    expect(files[0].path).toContain('DSButton.swift');
    expect(files[0].language).toBe('swift');
  });

  it('should generate variant enum', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const swift = files[0].content;

    expect(swift).toContain('enum DSButtonVariant');
    expect(swift).toContain('case primary');
    expect(swift).toContain('case secondary');
  });

  it('should generate size enum', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const swift = files[0].content;

    expect(swift).toContain('enum DSButtonSize');
    expect(swift).toContain('case sm');
    expect(swift).toContain('case md');
    expect(swift).toContain('case lg');
  });

  it('should generate computed properties using token values', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const swift = files[0].content;

    expect(swift).toContain('currentBackgroundColor');
    expect(swift).toContain('currentTextColor');
    expect(swift).toContain('currentHorizontalPadding');
    expect(swift).toContain('currentFont');
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
