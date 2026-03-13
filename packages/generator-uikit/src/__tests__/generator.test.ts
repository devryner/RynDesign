import { describe, it, expect } from 'vitest';
import { uikitGenerator } from '../index.js';
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

describe('UIKit Generator', () => {
  it('should create a generator plugin with correct metadata', () => {
    const gen = uikitGenerator();
    expect(gen.name).toBe('uikit');
    expect(gen.displayName).toBe('UIKit');
    expect(gen.platform).toBe('ios');
    expect(gen.outputExtensions).toContain('.swift');
  });

  it('should generate Color, Spacing, and Typography files', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    expect(files.length).toBe(3);

    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift');
    expect(colorFile).toBeDefined();
    expect(colorFile!.content).toContain('import UIKit');
    expect(colorFile!.content).toContain('extension UIColor');
    expect(colorFile!.content).toContain('DesignSystem');

    const spacingFile = files.find(f => f.path === 'DesignTokens+Spacing.swift');
    expect(spacingFile).toBeDefined();
    expect(spacingFile!.content).toContain('enum DesignSpacing');

    const typoFile = files.find(f => f.path === 'DesignTokens+Typography.swift');
    expect(typoFile).toBeDefined();
    expect(typoFile!.content).toContain('enum DesignTypography');
  });

  it('should generate UIColor tokens with hex values', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift')!;

    expect(colorFile.content).toContain('color_primary');
    expect(colorFile.content).toContain('#3B82F6');
    expect(colorFile.content).toContain('UIColor(hex:');
    expect(colorFile.content).toContain('convenience init(hex: String)');
  });

  it('should generate dynamic provider colors when darkMode is dynamic-provider', async () => {
    const gen = uikitGenerator({ darkMode: 'dynamic-provider' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift')!;

    expect(colorFile.content).toContain('dynamicProvider');
    expect(colorFile.content).toContain('traitCollection');
    expect(colorFile.content).toContain('userInterfaceStyle == .dark');
  });

  it('should not use dynamic provider when darkMode is not set', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift')!;

    expect(colorFile.content).not.toContain('dynamicProvider');
  });

  it('should generate spacing constants with CGFloat', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const spacingFile = files.find(f => f.path === 'DesignTokens+Spacing.swift')!;

    expect(spacingFile.content).toContain('import UIKit');
    expect(spacingFile.content).toContain('spacing_xs');
    expect(spacingFile.content).toContain('CGFloat = 4');
    expect(spacingFile.content).toContain('static let');
  });

  it('should include UIColor hex init extension', async () => {
    const gen = uikitGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignTokens+Color.swift')!;

    expect(colorFile.content).toContain('scanHexInt64');
    expect(colorFile.content).toContain('CGFloat(r) / 255');
  });
});
