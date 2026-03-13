import { describe, it, expect } from 'vitest';
import { resolveFigmaModes } from '../import/mode-resolver.js';
import type { MappedToken } from '../import/fetch-variables.js';

function makeToken(pathParts: string[], type: string, modes: Record<string, unknown>): MappedToken {
  const defaultMode = modes['Light'] ?? modes['Default'] ?? Object.values(modes)[0];
  return { path: pathParts, type, value: defaultMode, modes };
}

describe('resolveFigmaModes', () => {
  it('should split tokens into separate files by mode', () => {
    const tokens: MappedToken[] = [
      makeToken(['color', 'bg'], 'color', { Light: '#FFFFFF', Dark: '#111827' }),
      makeToken(['color', 'text'], 'color', { Light: '#111827', Dark: '#F9FAFB' }),
    ];

    const mapping = {
      Light: 'tokens/light.tokens.json',
      Dark: 'tokens/dark.tokens.json',
    };

    const result = resolveFigmaModes(tokens, mapping);

    expect(result['tokens/light.tokens.json']).toBeDefined();
    expect(result['tokens/dark.tokens.json']).toBeDefined();

    // Light file should have both tokens
    const light = result['tokens/light.tokens.json'] as any;
    expect(light.color.bg.$value).toBe('#FFFFFF');
    expect(light.color.text.$value).toBe('#111827');
  });

  it('should only include differing tokens in non-default mode file', () => {
    const tokens: MappedToken[] = [
      makeToken(['color', 'bg'], 'color', { Light: '#FFFFFF', Dark: '#111827' }),
      makeToken(['color', 'primary'], 'color', { Light: '#3B82F6', Dark: '#3B82F6' }), // same in both
    ];

    const mapping = {
      Light: 'tokens/light.tokens.json',
      Dark: 'tokens/dark.tokens.json',
    };

    const result = resolveFigmaModes(tokens, mapping);

    const dark = result['tokens/dark.tokens.json'] as any;
    // bg differs, so it should be in dark file
    expect(dark.color.bg.$value).toBe('#111827');
    // primary is the same — should NOT be in dark file
    expect(dark.color?.primary).toBeUndefined();
  });

  it('should add theme extension metadata for non-default modes', () => {
    const tokens: MappedToken[] = [
      makeToken(['color', 'bg'], 'color', { Light: '#FFF', Dark: '#000' }),
    ];

    const mapping = {
      Light: 'tokens/light.tokens.json',
      Dark: 'tokens/dark.tokens.json',
    };

    const result = resolveFigmaModes(tokens, mapping);

    const dark = result['tokens/dark.tokens.json'] as any;
    expect(dark.$extensions).toBeDefined();
    expect(dark.$extensions['com.ryndesign.theme'].name).toBe('dark');
    expect(dark.$extensions['com.ryndesign.theme'].extends).toBe('default');

    // Light (default) should not have extensions
    const light = result['tokens/light.tokens.json'] as any;
    expect(light.$extensions).toBeUndefined();
  });

  it('should skip modes not in the mapping', () => {
    const tokens: MappedToken[] = [
      makeToken(['color', 'bg'], 'color', { Light: '#FFF', Dark: '#000', HighContrast: '#111' }),
    ];

    const mapping = {
      Light: 'tokens/light.tokens.json',
      Dark: 'tokens/dark.tokens.json',
      // HighContrast not mapped
    };

    const result = resolveFigmaModes(tokens, mapping);

    expect(Object.keys(result)).toEqual(['tokens/light.tokens.json', 'tokens/dark.tokens.json']);
  });

  it('should handle single-mode tokens', () => {
    const tokens: MappedToken[] = [
      makeToken(['spacing', 'md'], 'dimension', { Default: '16px' }),
    ];

    const mapping = { Default: 'tokens/base.tokens.json' };

    const result = resolveFigmaModes(tokens, mapping);
    const base = result['tokens/base.tokens.json'] as any;
    expect(base.spacing.md.$value).toBe('16px');
  });

  it('should include description when present', () => {
    const token: MappedToken = {
      path: ['color', 'bg'],
      type: 'color',
      value: '#FFFFFF',
      description: 'Background color',
      modes: { Light: '#FFFFFF' },
    };

    const mapping = { Light: 'tokens/light.tokens.json' };
    const result = resolveFigmaModes([token], mapping);
    const light = result['tokens/light.tokens.json'] as any;
    expect(light.color.bg.$description).toBe('Background color');
  });
});
