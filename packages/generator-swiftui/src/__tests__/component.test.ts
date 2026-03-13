import { describe, it, expect } from 'vitest';
import { swiftuiGenerator } from '../index.js';
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
    config: { outDir: 'generated/swiftui' },
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

describe('SwiftUI Component Generation', () => {
  it('should generate Swift file for Button component', async () => {
    const gen = swiftuiGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    expect(files.length).toBe(1);
    expect(files[0].path).toContain('DSButton.swift');
    expect(files[0].language).toBe('swift');
  });

  it('should generate Swift view with variant enums', async () => {
    const gen = swiftuiGenerator();
    const ctx = await getTestContext();

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const resolved = resolveComponent(components[0], ctx.tokenSet);

    const files = await gen.generateComponent(resolved, ctx);
    const swift = files[0].content;

    expect(swift).toContain('struct DSButton: View');
    expect(swift).toContain('enum Variant');
    expect(swift).toContain('case primary');
    expect(swift).toContain('case secondary');
    expect(swift).toContain('enum Size');
    expect(swift).toContain('case sm');
    expect(swift).toContain('case md');
    expect(swift).toContain('case lg');
  });

  it('should generate token files with colors and spacing', async () => {
    const gen = swiftuiGenerator();
    const ctx = await getTestContext();

    const files = await gen.generateTokens(ctx);
    expect(files.length).toBe(3);

    const colorFile = files.find(f => f.path.includes('Color'));
    expect(colorFile).toBeDefined();
    expect(colorFile!.content).toContain('enum DesignSystem');

    const spacingFile = files.find(f => f.path.includes('Spacing'));
    expect(spacingFile).toBeDefined();
    expect(spacingFile!.content).toContain('DesignSpacing');
  });

  it('should generate dark mode support with dynamic-color option', async () => {
    const gen = swiftuiGenerator({ darkMode: 'dynamic-color' });
    const ctx = await getTestContext();

    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path.includes('Color'))!;

    expect(colorFile.content).toContain('init(light: Color, dark: Color)');
  });
});
