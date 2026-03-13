import { describe, it, expect } from 'vitest';
import { composeGenerator } from '../index.js';
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
    config: { outDir: 'generated/compose', packageName: 'com.test.tokens' },
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

describe('Compose Generator', () => {
  it('should create a generator plugin with correct metadata', () => {
    const gen = composeGenerator();
    expect(gen.name).toBe('compose');
    expect(gen.displayName).toBe('Jetpack Compose');
    expect(gen.platform).toBe('android');
    expect(gen.outputExtensions).toContain('.kt');
  });

  it('should generate Color, Spacing, Typography, and Theme files', async () => {
    const gen = composeGenerator({ packageName: 'com.test.tokens' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);

    expect(files.length).toBe(4);

    const colorFile = files.find(f => f.path === 'DesignColors.kt');
    expect(colorFile).toBeDefined();
    expect(colorFile!.content).toContain('package com.test.tokens');
    expect(colorFile!.content).toContain('import androidx.compose.ui.graphics.Color');

    const spacingFile = files.find(f => f.path === 'DesignSpacing.kt');
    expect(spacingFile).toBeDefined();
    expect(spacingFile!.content).toContain('object DesignSpacing');

    const typoFile = files.find(f => f.path === 'DesignTypography.kt');
    expect(typoFile).toBeDefined();
    expect(typoFile!.content).toContain('object DesignTypography');

    const themeFile = files.find(f => f.path === 'DesignTheme.kt');
    expect(themeFile).toBeDefined();
    expect(themeFile!.content).toContain('DesignTheme');
  });

  it('should generate LightColors and DarkColors objects', async () => {
    const gen = composeGenerator({ packageName: 'com.test.tokens' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignColors.kt')!;

    expect(colorFile.content).toContain('object LightColors');
    expect(colorFile.content).toContain('object DarkColors');
    expect(colorFile.content).toContain('data class DesignColors');
    expect(colorFile.content).toContain('fun lightDesignColors()');
    expect(colorFile.content).toContain('fun darkDesignColors()');
  });

  it('should generate color values in ARGB hex format', async () => {
    const gen = composeGenerator({ packageName: 'com.test.tokens' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignColors.kt')!;

    // #3B82F6 -> 0xFF3B82F6
    expect(colorFile.content).toContain('0xFF3B82F6');
    expect(colorFile.content).toContain('color_primary');
  });

  it('should generate DesignTheme composable with isSystemInDarkTheme', async () => {
    const gen = composeGenerator({ packageName: 'com.test.tokens' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const themeFile = files.find(f => f.path === 'DesignTheme.kt')!;

    expect(themeFile.content).toContain('isSystemInDarkTheme');
    expect(themeFile.content).toContain('@Composable');
    expect(themeFile.content).toContain('CompositionLocalProvider');
    expect(themeFile.content).toContain('LocalDesignColors');
    expect(themeFile.content).toContain('darkDesignColors');
    expect(themeFile.content).toContain('lightDesignColors');
  });

  it('should generate spacing with dp units', async () => {
    const gen = composeGenerator({ packageName: 'com.test.tokens' });
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const spacingFile = files.find(f => f.path === 'DesignSpacing.kt')!;

    expect(spacingFile.content).toContain('import androidx.compose.ui.unit.dp');
    expect(spacingFile.content).toContain('.dp');
    expect(spacingFile.content).toContain('spacing_xs');
    expect(spacingFile.content).toContain('val spacing_xs: Dp = 4.dp');
  });

  it('should use default package name when not specified', async () => {
    const gen = composeGenerator();
    const ctx = await getTestContext();
    const files = await gen.generateTokens(ctx);
    const colorFile = files.find(f => f.path === 'DesignColors.kt')!;

    expect(colorFile.content).toContain('package com.ryndesign.tokens');
  });
});
