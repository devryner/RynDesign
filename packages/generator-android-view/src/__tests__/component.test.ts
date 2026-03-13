import { describe, it, expect } from 'vitest';
import { androidViewGenerator } from '../index.js';
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
    config: { outDir: 'generated/android-view' },
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

describe('Android View Component Generation', () => {
  it('should generate Kotlin + XML files for Button', async () => {
    const gen = androidViewGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    expect(files.length).toBe(3);

    const kt = files.find(f => f.path.includes('DSButton.kt'));
    const viewXml = files.find(f => f.path.includes('view_button.xml'));
    const attrsXml = files.find(f => f.path.includes('attrs_button.xml'));
    expect(kt).toBeDefined();
    expect(viewXml).toBeDefined();
    expect(attrsXml).toBeDefined();
  });

  it('should generate variant enum', async () => {
    const gen = androidViewGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const kt = files.find(f => f.path.includes('DSButton.kt'))!;

    expect(kt.content).toContain('enum class DSButtonVariant');
    expect(kt.content).toContain('PRIMARY');
    expect(kt.content).toContain('SECONDARY');
  });

  it('should generate helper methods using token values', async () => {
    const gen = androidViewGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const kt = files.find(f => f.path.includes('DSButton.kt'))!;

    expect(kt.content).toContain('getBackgroundColor');
    expect(kt.content).toContain('getTextColor');
    expect(kt.content).toContain('getHorizontalPadding');
    expect(kt.content).toContain('getFontSize');
  });

  it('should generate XML layout', async () => {
    const gen = androidViewGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const viewXml = files.find(f => f.path.includes('view_button.xml'))!;

    expect(viewXml.content).toContain('LinearLayout');
    expect(viewXml.content).toContain('title_text');
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
