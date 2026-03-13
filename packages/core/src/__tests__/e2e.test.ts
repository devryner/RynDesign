import { describe, it, expect } from 'vitest';
import { buildTokenSet, loadComponents, resolveComponent, resolveComponentForTheme, postValidate } from '../index.js';
import path from 'node:path';

const TEMPLATES_DIR = path.resolve(__dirname, '../../../../templates');
const COMPONENTS_DIR = path.resolve(__dirname, '../../../../components');

describe('E2E: full pipeline', () => {
  it('should build full token set with dark theme and validate', async () => {
    const result = await buildTokenSet({
      tokens: ['full.tokens.json'],
      basePath: TEMPLATES_DIR,
      themes: {
        default: 'light',
        dark: { file: path.join(TEMPLATES_DIR, 'dark.tokens.json') },
      },
    });

    expect(result.tokens.length).toBeGreaterThan(0);
    expect(result.themes.themes['dark']).toBeDefined();
    expect(result.themes.themes['dark'].tokens.length).toBeGreaterThan(0);

    // Post validation should succeed without errors
    const issues = postValidate(result.tokens, result.themes);
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors).toEqual([]);
  });

  it('should populate referencedBy for aliased tokens', async () => {
    const result = await buildTokenSet({
      tokens: ['minimal.tokens.json'],
      basePath: TEMPLATES_DIR,
    });

    // color.white is referenced by color.background.primary
    const white = result.tokens.find(t => t.path.join('.') === 'color.white');
    expect(white).toBeDefined();
    expect(white!.referencedBy.length).toBeGreaterThan(0);
    expect(white!.referencedBy).toContain('color.background.primary');
  });

  it('should resolve 3-level alias chain', async () => {
    const result = await buildTokenSet({
      tokens: ['minimal.tokens.json'],
      basePath: TEMPLATES_DIR,
    });

    // color.background.primary -> {color.white} -> #FFFFFF
    const bgPrimary = result.tokens.find(t => t.path.join('.') === 'color.background.primary');
    expect(bgPrimary).toBeDefined();
    expect(bgPrimary!.$value.type).toBe('color');
    if (bgPrimary!.$value.type === 'color') {
      expect(bgPrimary!.$value.hex).toBe('#FFFFFF');
    }
  });

  it('should load components and resolve all variant combinations', async () => {
    const tokenSet = await buildTokenSet({
      tokens: ['full.tokens.json'],
      basePath: TEMPLATES_DIR,
    });

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    expect(components.length).toBe(1);

    const resolved = resolveComponent(components[0], tokenSet);
    expect(resolved.variantTokens).toBeDefined();

    // Button has 4 variants × 3 sizes
    const variants = Object.keys(resolved.variantTokens);
    expect(variants).toContain('primary');
    expect(variants).toContain('secondary');
    expect(variants).toContain('outline');
    expect(variants).toContain('ghost');

    for (const variant of variants) {
      const sizes = Object.keys(resolved.variantTokens[variant]);
      expect(sizes).toContain('sm');
      expect(sizes).toContain('md');
      expect(sizes).toContain('lg');
    }
  });

  it('should resolve component for theme with overridden tokens', async () => {
    const tokenSet = await buildTokenSet({
      tokens: ['full.tokens.json'],
      basePath: TEMPLATES_DIR,
      themes: {
        default: 'light',
        dark: { file: path.join(TEMPLATES_DIR, 'dark.tokens.json') },
      },
    });

    const components = await loadComponents(['button.component.json'], COMPONENTS_DIR);
    const lightComp = resolveComponent(components[0], tokenSet);
    const darkComp = resolveComponentForTheme(components[0], tokenSet, 'dark');

    // Both should have resolved tokens (they exist in definition)
    expect(lightComp.definition.name).toBe('Button');
    expect(darkComp.definition.name).toBe('Button');
    expect(darkComp.variantTokens).toBeDefined();
  });

  it('should validate dark theme overrides only reference existing tokens', async () => {
    const result = await buildTokenSet({
      tokens: ['full.tokens.json'],
      basePath: TEMPLATES_DIR,
      themes: {
        default: 'light',
        dark: { file: path.join(TEMPLATES_DIR, 'dark.tokens.json') },
      },
    });

    const issues = postValidate(result.tokens, result.themes);
    // No errors expected
    const errors = issues.filter(i => i.severity === 'error');
    expect(errors).toEqual([]);
  });
});
