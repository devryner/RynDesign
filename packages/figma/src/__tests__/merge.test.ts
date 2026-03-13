import { describe, it, expect } from 'vitest';
import { mergeTokens } from '../import/merge.js';
import type { MappedToken } from '../import/fetch-variables.js';

function makeRemote(pathParts: string[], type: string, value: unknown, description?: string): MappedToken {
  return { path: pathParts, type, value, description, modes: {} };
}

describe('mergeTokens', () => {
  const existingTree = {
    color: {
      $type: 'color',
      primary: { $value: '#3B82F6', $description: 'Local primary' },
      secondary: { $value: '#6366F1' },
      localOnly: { $value: '#10B981' },
    },
    spacing: {
      $type: 'dimension',
      md: { $value: '16px' },
    },
  };

  it('should add new tokens that do not exist locally', () => {
    const remote = [
      makeRemote(['color', 'tertiary'], 'color', '#F59E0B'),
    ];

    const result = mergeTokens(existingTree, remote, { strategy: 'prefer-remote' });

    expect((result.merged as any).color.tertiary.$value).toBe('#F59E0B');
    expect(result.stats.added).toBe(1);
    expect(result.stats.updated).toBe(0);
  });

  it('should overwrite local values with prefer-remote strategy', () => {
    const remote = [
      makeRemote(['color', 'primary'], 'color', '#FF0000', 'Remote primary'),
    ];

    const result = mergeTokens(existingTree, remote, { strategy: 'prefer-remote' });

    expect((result.merged as any).color.primary.$value).toBe('#FF0000');
    expect((result.merged as any).color.primary.$description).toBe('Remote primary');
    expect(result.stats.updated).toBe(1);
  });

  it('should keep local values with prefer-local strategy', () => {
    const remote = [
      makeRemote(['color', 'primary'], 'color', '#FF0000'),
    ];

    const result = mergeTokens(existingTree, remote, { strategy: 'prefer-local' });

    expect((result.merged as any).color.primary.$value).toBe('#3B82F6');
    expect(result.stats.kept).toBe(1);
    expect(result.stats.updated).toBe(0);
  });

  it('should only add new tokens with remote-only-new strategy', () => {
    const remote = [
      makeRemote(['color', 'primary'], 'color', '#FF0000'),     // exists — skip
      makeRemote(['color', 'tertiary'], 'color', '#F59E0B'),    // new — add
    ];

    const result = mergeTokens(existingTree, remote, { strategy: 'remote-only-new' });

    expect((result.merged as any).color.primary.$value).toBe('#3B82F6'); // unchanged
    expect((result.merged as any).color.tertiary.$value).toBe('#F59E0B'); // added
    expect(result.stats.added).toBe(1);
    expect(result.stats.kept).toBe(1);
  });

  it('should preserve local-only tokens in all strategies', () => {
    const remote = [
      makeRemote(['color', 'primary'], 'color', '#FF0000'),
    ];

    for (const strategy of ['prefer-remote', 'prefer-local', 'remote-only-new'] as const) {
      const result = mergeTokens(existingTree, remote, { strategy });
      expect((result.merged as any).color.localOnly.$value).toBe('#10B981');
    }
  });

  it('should handle empty existing tree', () => {
    const remote = [
      makeRemote(['color', 'primary'], 'color', '#3B82F6'),
      makeRemote(['spacing', 'md'], 'dimension', '16px'),
    ];

    const result = mergeTokens({}, remote, { strategy: 'prefer-remote' });

    expect((result.merged as any).color.primary.$value).toBe('#3B82F6');
    expect((result.merged as any).spacing.md.$value).toBe('16px');
    expect(result.stats.added).toBe(2);
  });

  it('should handle empty remote tokens', () => {
    const result = mergeTokens(existingTree, [], { strategy: 'prefer-remote' });

    expect(result.merged).toEqual(existingTree);
    expect(result.stats.added).toBe(0);
    expect(result.stats.updated).toBe(0);
  });

  it('should create nested paths for deeply nested new tokens', () => {
    const remote = [
      makeRemote(['color', 'brand', 'accent', 'light'], 'color', '#FBBF24'),
    ];

    const result = mergeTokens(existingTree, remote, { strategy: 'prefer-remote' });

    expect((result.merged as any).color.brand.accent.light.$value).toBe('#FBBF24');
    expect(result.stats.added).toBe(1);
  });

  it('should report correct total token count', () => {
    const remote = [
      makeRemote(['color', 'tertiary'], 'color', '#F59E0B'),
    ];

    const result = mergeTokens(existingTree, remote, { strategy: 'prefer-remote' });

    // existing: primary, secondary, localOnly, md = 4 + 1 new = 5
    expect(result.stats.total).toBe(5);
  });
});
