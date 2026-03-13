import { describe, it, expect } from 'vitest';
import { diffFigmaTokens } from '../export/diff.js';
import type { ResolvedToken } from '@ryndesign/plugin-api';

function makeLocalToken(
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
  } as ResolvedToken;
}

function makeRemoteToken(pathParts: string[], type: string, value: unknown) {
  return {
    path: pathParts,
    type,
    value,
    modes: {},
  };
}

describe('diffFigmaTokens', () => {
  it('should detect tokens that exist locally but not remotely as added', () => {
    const localTokens = [
      makeLocalToken(['color', 'primary'], 'color', { hex: '#3B82F6' }),
      makeLocalToken(['color', 'secondary'], 'color', { hex: '#6366F1' }),
    ];
    const remoteTokens = [
      makeRemoteToken(['color', 'primary'], 'color', '#3B82F6'),
    ];

    const result = diffFigmaTokens(localTokens, remoteTokens);

    expect(result.added.length).toBe(1);
    expect(result.added[0].path).toBe('color.secondary');
    expect(result.added[0].type).toBe('added');
    expect(result.added[0].local).toBe('#6366F1');
  });

  it('should detect tokens that exist remotely but not locally as removed', () => {
    const localTokens = [
      makeLocalToken(['color', 'primary'], 'color', { hex: '#3B82F6' }),
    ];
    const remoteTokens = [
      makeRemoteToken(['color', 'primary'], 'color', '#3B82F6'),
      makeRemoteToken(['color', 'deprecated'], 'color', '#FF0000'),
    ];

    const result = diffFigmaTokens(localTokens, remoteTokens);

    expect(result.removed.length).toBe(1);
    expect(result.removed[0].path).toBe('color.deprecated');
    expect(result.removed[0].type).toBe('removed');
    expect(result.removed[0].remote).toBe('#FF0000');
  });

  it('should detect tokens with different values as modified', () => {
    const localTokens = [
      makeLocalToken(['color', 'primary'], 'color', { hex: '#3B82F6' }),
    ];
    const remoteTokens = [
      makeRemoteToken(['color', 'primary'], 'color', '#FF0000'),
    ];

    const result = diffFigmaTokens(localTokens, remoteTokens);

    expect(result.modified.length).toBe(1);
    expect(result.modified[0].path).toBe('color.primary');
    expect(result.modified[0].type).toBe('modified');
    expect(result.modified[0].local).toBe('#3B82F6');
    expect(result.modified[0].remote).toBe('#FF0000');
  });

  it('should count unchanged tokens correctly', () => {
    const localTokens = [
      makeLocalToken(['color', 'primary'], 'color', { hex: '#3B82F6' }),
      makeLocalToken(['color', 'white'], 'color', { hex: '#FFFFFF' }),
    ];
    const remoteTokens = [
      makeRemoteToken(['color', 'primary'], 'color', '#3B82F6'),
      makeRemoteToken(['color', 'white'], 'color', '#FFFFFF'),
    ];

    const result = diffFigmaTokens(localTokens, remoteTokens);

    expect(result.unchanged).toBe(2);
    expect(result.added.length).toBe(0);
    expect(result.removed.length).toBe(0);
    expect(result.modified.length).toBe(0);
  });

  it('should handle empty token sets', () => {
    const result = diffFigmaTokens([], []);

    expect(result.unchanged).toBe(0);
    expect(result.added.length).toBe(0);
    expect(result.removed.length).toBe(0);
    expect(result.modified.length).toBe(0);
  });

  it('should handle dimension tokens', () => {
    const localTokens = [
      makeLocalToken(['spacing', 'md'], 'dimension', { value: 16, unit: 'px' }),
    ];
    const remoteTokens = [
      makeRemoteToken(['spacing', 'md'], 'dimension', '16px'),
    ];

    const result = diffFigmaTokens(localTokens, remoteTokens);

    expect(result.unchanged).toBe(1);
  });

  it('should handle complex diff with adds, removes, and modifications', () => {
    const localTokens = [
      makeLocalToken(['color', 'primary'], 'color', { hex: '#3B82F6' }),
      makeLocalToken(['color', 'secondary'], 'color', { hex: '#6366F1' }),
      makeLocalToken(['color', 'new'], 'color', { hex: '#10B981' }),
    ];
    const remoteTokens = [
      makeRemoteToken(['color', 'primary'], 'color', '#FF0000'), // modified
      makeRemoteToken(['color', 'secondary'], 'color', '#6366F1'), // unchanged
      makeRemoteToken(['color', 'old'], 'color', '#EF4444'), // removed
    ];

    const result = diffFigmaTokens(localTokens, remoteTokens);

    expect(result.added.length).toBe(1);
    expect(result.added[0].path).toBe('color.new');

    expect(result.removed.length).toBe(1);
    expect(result.removed[0].path).toBe('color.old');

    expect(result.modified.length).toBe(1);
    expect(result.modified[0].path).toBe('color.primary');

    expect(result.unchanged).toBe(1);
  });
});
