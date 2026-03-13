import { describe, it, expect } from 'vitest';
import { swiftuiGenerator } from '../index.js';
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

describe('SwiftUI Generator', () => {
  it('should create a generator plugin with correct metadata', () => {
    const gen = swiftuiGenerator();
    expect(gen.name).toBe('swiftui');
    expect(gen.displayName).toBe('SwiftUI');
    expect(gen.platform).toBe('ios');
    expect(gen.outputExtensions).toContain('.swift');
  });

  it('should generate Color extension, Spacing, and Typography files', async () => {
    const gen = swiftuiGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    expect(files.length).toBe(3);

    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift');
    expect(colorFile).toBeDefined();
    expect(colorFile!.content).toContain('import SwiftUI');
    expect(colorFile!.content).toContain('extension Color');
    expect(colorFile!.content).toContain('DesignSystem');

    const spacingFile = files.find(f => f.path === 'DesignTokens+Spacing.swift');
    expect(spacingFile).toBeDefined();
    expect(spacingFile!.content).toContain('enum DesignSpacing');
    expect(spacingFile!.content).toContain('CGFloat');

    const typoFile = files.find(f => f.path === 'DesignTokens+Typography.swift');
    expect(typoFile).toBeDefined();
    expect(typoFile!.content).toContain('extension Font');
  });

  it('should generate Color tokens with hex values', async () => {
    const gen = swiftuiGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift')!;

    expect(colorFile.content).toContain('color_primary');
    expect(colorFile.content).toContain('#3B82F6');
    expect(colorFile.content).toContain('Color(hex:');
    expect(colorFile.content).toContain('init(hex: String)');
  });

  it('should generate spacing constants with CGFloat values', async () => {
    const gen = swiftuiGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const spacingFile = files.find(f => f.path === 'DesignTokens+Spacing.swift')!;

    expect(spacingFile.content).toContain('spacing_xs');
    expect(spacingFile.content).toContain('spacing_md');
    expect(spacingFile.content).toContain('static let');
    expect(spacingFile.content).toContain('CGFloat = 4');
    expect(spacingFile.content).toContain('CGFloat = 16');
  });

  it('should generate dynamic colors when darkMode is dynamic-color', async () => {
    const gen = swiftuiGenerator({ darkMode: 'dynamic-color' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift')!;

    // Dark theme tokens that override light should use dynamic color
    expect(colorFile.content).toContain('Color(light:');
    expect(colorFile.content).toContain('dark:');
    expect(colorFile.content).toContain('init(light: Color, dark: Color)');
  });

  it('should include hex init extension', async () => {
    const gen = swiftuiGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift')!;

    expect(colorFile.content).toContain('scanHexInt64');
    expect(colorFile.content).toContain('.sRGB');
  });
});
