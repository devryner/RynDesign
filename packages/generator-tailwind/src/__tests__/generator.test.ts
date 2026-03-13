import { describe, it, expect } from 'vitest';
import { tailwindGenerator } from '../index.js';
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
    config: { outDir: 'generated/tailwind' },
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

describe('Tailwind Generator', () => {
  it('should create a generator plugin with correct metadata', () => {
    const gen = tailwindGenerator();
    expect(gen.name).toBe('tailwind');
    expect(gen.displayName).toBe('Tailwind CSS');
    expect(gen.platform).toBe('web');
  });

  it('should generate Tailwind config file with theme extension', async () => {
    const gen = tailwindGenerator({ configFormat: 'ts' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    const configFile = files.find(f => f.path.includes('tailwind.tokens'));
    expect(configFile).toBeDefined();
    expect(configFile!.content).toContain('theme:');
    expect(configFile!.content).toContain('extend:');
    expect(configFile!.content).toContain('colors:');
    expect(configFile!.content).toContain('satisfies Partial<Config>');
  });

  it('should generate CJS config when format is cjs', async () => {
    const gen = tailwindGenerator({ configFormat: 'cjs' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    const configFile = files.find(f => f.path.endsWith('.cjs'));
    expect(configFile).toBeDefined();
    expect(configFile!.content).toContain('module.exports');
  });

  it('should generate CSS layer with custom properties', async () => {
    const gen = tailwindGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    const cssFile = files.find(f => f.path === 'tokens.css');
    expect(cssFile).toBeDefined();
    expect(cssFile!.content).toContain('@layer base');
    expect(cssFile!.content).toContain(':root');
    expect(cssFile!.content).toContain('--color-primary');
  });

  it('should include dark theme in CSS layer', async () => {
    const gen = tailwindGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('.dark');
    expect(cssFile.content).toContain('prefers-color-scheme');
  });

  it('should support custom prefix', async () => {
    const gen = tailwindGenerator({ prefix: 'ds' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const cssFile = files.find(f => f.path === 'tokens.css')!;

    expect(cssFile.content).toContain('--ds-color-primary');
  });

  it('should generate color tokens with CSS variable references in config', async () => {
    const gen = tailwindGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const configFile = files.find(f => f.path.includes('tailwind.tokens'))!;

    expect(configFile.content).toContain('var(--color-primary)');
    expect(configFile.content).toContain('var(--spacing-');
  });

  it('should generate component class map with variant and size maps', async () => {
    const gen = tailwindGenerator();
    const ctx = await getTestContext();
    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);
    const files = await gen.generateComponent(resolved, ctx);

    expect(files.length).toBe(1);
    expect(files[0].path).toContain('button.classes.ts');

    const ts = files[0].content;
    expect(ts).toContain('buttonBase');
    expect(ts).toContain('buttonVariant');
    expect(ts).toContain('primary:');
    expect(ts).toContain('secondary:');
    expect(ts).toContain('buttonSize');
    expect(ts).toContain('sm:');
    expect(ts).toContain('md:');
    expect(ts).toContain('lg:');
    expect(ts).toContain('buttonState');
    expect(ts).toContain('getButtonClasses');
  });
});
