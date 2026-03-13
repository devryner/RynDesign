import { describe, it, expect } from 'vitest';
import { buildDependencyGraph, topologicalSort, extractReferences } from '../resolver/cycle-detector.js';
import { CircularReferenceError } from '../parser/errors.js';

describe('extractReferences', () => {
  it('should extract references from string values', () => {
    expect(extractReferences('{color.primary}')).toEqual(['color.primary']);
    expect(extractReferences('{a.b} and {c.d}')).toEqual(['a.b', 'c.d']);
    expect(extractReferences('no refs')).toEqual([]);
  });

  it('should extract references from objects', () => {
    expect(extractReferences({ a: '{x.y}', b: '{z.w}' })).toEqual(['x.y', 'z.w']);
  });
});

describe('topologicalSort', () => {
  it('should sort tokens in dependency order', () => {
    const graph = buildDependencyGraph(new Map([
      ['a', '{b}'],
      ['b', '{c}'],
      ['c', 'value'],
    ]));

    const sorted = topologicalSort(graph);
    expect(sorted.indexOf('c')).toBeLessThan(sorted.indexOf('b'));
    expect(sorted.indexOf('b')).toBeLessThan(sorted.indexOf('a'));
  });

  it('should detect circular references', () => {
    const graph = buildDependencyGraph(new Map([
      ['a', '{b}'],
      ['b', '{c}'],
      ['c', '{a}'],
    ]));

    expect(() => topologicalSort(graph)).toThrow(CircularReferenceError);
  });
});
