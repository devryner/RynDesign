import { describe, it, expect } from 'vitest';
import { mapTokensToFigma } from '../export/push-variables.js';
import type { ResolvedToken } from '@ryndesign/plugin-api';

function makeToken(
  pathParts: string[],
  type: string,
  value: Record<string, unknown>
): ResolvedToken {
  return {
    path: pathParts,
    $type: type,
    $value: { type, ...value } as any,
    $description: undefined,
    $extensions: {},
    referencedBy: [],
    originalValue: undefined,
  } as ResolvedToken;
}

describe('mapTokensToFigma', () => {
  it('should map color tokens to CREATE actions with COLOR type', () => {
    const tokens = [
      makeToken(['color', 'primary'], 'color', { hex: '#3B82F6', r: 59, g: 130, b: 246, a: 1 }),
    ];

    const changes = mapTokensToFigma(tokens);

    expect(changes.variables!.length).toBe(1);
    expect(changes.variables![0].action).toBe('CREATE');
    expect(changes.variables![0].name).toBe('color/primary');
    expect(changes.variables![0].resolvedType).toBe('COLOR');
  });

  it('should map dimension tokens to FLOAT type', () => {
    const tokens = [
      makeToken(['spacing', 'md'], 'dimension', { value: 16, unit: 'px' }),
    ];

    const changes = mapTokensToFigma(tokens);

    expect(changes.variables![0].resolvedType).toBe('FLOAT');
    expect(changes.variables![0].name).toBe('spacing/md');
  });

  it('should map fontFamily tokens to STRING type', () => {
    const tokens = [
      makeToken(['font', 'body'], 'fontFamily', { value: ['Inter', 'sans-serif'] }),
    ];

    const changes = mapTokensToFigma(tokens);

    expect(changes.variables![0].resolvedType).toBe('STRING');
  });

  it('should skip unsupported token types', () => {
    const tokens = [
      makeToken(['shadow', 'md'], 'shadow', { offsetX: '0px', offsetY: '4px' }),
      makeToken(['color', 'primary'], 'color', { hex: '#3B82F6', r: 59, g: 130, b: 246, a: 1 }),
    ];

    const changes = mapTokensToFigma(tokens);

    // shadow should be skipped
    expect(changes.variables!.length).toBe(1);
    expect(changes.variables![0].name).toBe('color/primary');
  });

  it('should use slash-separated paths for Figma names', () => {
    const tokens = [
      makeToken(['color', 'brand', 'accent', 'light'], 'color', { hex: '#FFF', r: 255, g: 255, b: 255, a: 1 }),
    ];

    const changes = mapTokensToFigma(tokens);

    expect(changes.variables![0].name).toBe('color/brand/accent/light');
  });

  it('should handle multiple tokens', () => {
    const tokens = [
      makeToken(['color', 'primary'], 'color', { hex: '#3B82F6', r: 59, g: 130, b: 246, a: 1 }),
      makeToken(['color', 'secondary'], 'color', { hex: '#6366F1', r: 99, g: 102, b: 241, a: 1 }),
      makeToken(['spacing', 'sm'], 'dimension', { value: 8, unit: 'px' }),
      makeToken(['spacing', 'md'], 'dimension', { value: 16, unit: 'px' }),
    ];

    const changes = mapTokensToFigma(tokens);

    expect(changes.variables!.length).toBe(4);
  });

  it('should handle empty token list', () => {
    const changes = mapTokensToFigma([]);

    expect(changes.variables!.length).toBe(0);
  });

  it('should include description when present', () => {
    const token = makeToken(['color', 'primary'], 'color', { hex: '#3B82F6', r: 59, g: 130, b: 246, a: 1 });
    token.$description = 'Primary brand color';

    const changes = mapTokensToFigma([token]);

    expect(changes.variables![0].description).toBe('Primary brand color');
  });
});
