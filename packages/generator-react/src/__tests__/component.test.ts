import { describe, it, expect } from 'vitest';
import { reactGenerator } from '../index.js';
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
    config: { outDir: 'generated/react', typescript: true, darkMode: 'media+class' as const },
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

describe('React Component Generation', () => {
  it('should generate TSX and CSS for Button component', async () => {
    const gen = reactGenerator({ typescript: true });
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    expect(files.length).toBe(2);

    const tsx = files.find(f => f.path.endsWith('.tsx'));
    const css = files.find(f => f.path.endsWith('.css'));
    expect(tsx).toBeDefined();
    expect(css).toBeDefined();
  });

  it('should generate CSS with all variant classes', async () => {
    const gen = reactGenerator({ typescript: true });
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const css = files.find(f => f.path.endsWith('.css'))!;

    // Should have variant classes
    expect(css.content).toContain('.button--primary');
    expect(css.content).toContain('.button--secondary');
    expect(css.content).toContain('.button--outline');
    expect(css.content).toContain('.button--ghost');

    // Should have size classes
    expect(css.content).toContain('.button--sm');
    expect(css.content).toContain('.button--md');
    expect(css.content).toContain('.button--lg');

    // Should have state styles
    expect(css.content).toContain('.button--disabled');
    expect(css.content).toContain(':hover');
  });

  it('should generate TSX with variant props', async () => {
    const gen = reactGenerator({ typescript: true });
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const tsx = files.find(f => f.path.endsWith('.tsx'))!;

    expect(tsx.content).toContain('ButtonProps');
    expect(tsx.content).toContain("'primary' | 'secondary' | 'outline' | 'ghost'");
    expect(tsx.content).toContain("'sm' | 'md' | 'lg'");
    expect(tsx.content).toContain('React.forwardRef');
  });

  it('should include variantTokens in resolved component', async () => {
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    // Check variantTokens structure
    expect(resolved.variantTokens).toBeDefined();
    expect(resolved.variantTokens['primary']).toBeDefined();
    expect(resolved.variantTokens['primary']['md']).toBeDefined();
  });
});
