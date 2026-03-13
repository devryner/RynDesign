import { describe, it, expect } from 'vitest';
import { cssGenerator } from '../index.js';
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
    config: { outDir: 'generated/css' },
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

describe('CSS Generator', () => {
  it('should create a generator plugin with correct metadata', () => {
    const gen = cssGenerator();
    expect(gen.name).toBe('css');
    expect(gen.displayName).toBe('CSS/SCSS');
    expect(gen.platform).toBe('web');
    expect(gen.outputExtensions).toContain('.css');
  });

  it('should include .scss extension when scss option enabled', () => {
    const gen = cssGenerator({ scss: true });
    expect(gen.outputExtensions).toContain('.scss');
  });

  it('should generate CSS custom properties file', async () => {
    const gen = cssGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    const cssFile = files.find(f => f.path === 'tokens.css');
    expect(cssFile).toBeDefined();
    expect(cssFile!.content).toContain(':root');
    expect(cssFile!.content).toContain('--color-primary');
    expect(cssFile!.content).toContain('#3B82F6');
  });

  it('should generate dark theme overrides with media query', async () => {
    const gen = cssGenerator({ darkMode: 'media+class' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('prefers-color-scheme');
    expect(cssFile.content).toContain('[data-theme="dark"]');
  });

  it('should generate SCSS variables file when scss enabled', async () => {
    const gen = cssGenerator({ scss: true });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    expect(files.length).toBe(2);
    const scssFile = files.find(f => f.path === '_tokens.scss');
    expect(scssFile).toBeDefined();
    expect(scssFile!.content).toContain('$color-primary');
    expect(scssFile!.content).toContain('$theme-dark');
    expect(scssFile!.content).toContain('@mixin apply-theme');
  });

  it('should support custom prefix', async () => {
    const gen = cssGenerator({ prefix: 'ds' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('--ds-color-primary');
  });

  it('should generate component CSS with variant and size classes', async () => {
    const gen = cssGenerator();
    const ctx = await getTestContext();
    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);
    const files = await gen.generateComponent(resolved, ctx);

    expect(files.length).toBe(1);
    expect(files[0].path).toContain('button.css');

    const css = files[0].content;
    expect(css).toContain('.button--primary');
    expect(css).toContain('.button--secondary');
    expect(css).toContain('.button--sm');
    expect(css).toContain('.button--md');
    expect(css).toContain('.button--lg');
    expect(css).toContain('.button--disabled');
    expect(css).toContain(':hover');
  });

  it('should generate component SCSS with nested selectors when scss enabled', async () => {
    const gen = cssGenerator({ scss: true });
    const ctx = await getTestContext();
    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);
    const files = await gen.generateComponent(resolved, ctx);

    expect(files[0].path).toContain('.scss');
    const scss = files[0].content;
    expect(scss).toContain('&--primary');
    expect(scss).toContain('&--sm');
    expect(scss).toContain('&--disabled');
  });
});
