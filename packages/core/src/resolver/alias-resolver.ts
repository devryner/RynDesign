import type { RawTokenTree } from '../parser/reader.js';
import { TokenParseError } from '../parser/errors.js';
import { buildDependencyGraph, topologicalSort, extractReferences } from './cycle-detector.js';

const ALIAS_REGEX = /\{([^}]+)\}/g;

/**
 * Build a reverse reference map: Map<referencedTokenPath, Set<referencingTokenPath>>
 * This must be called before alias resolution to capture original references.
 */
export function buildReferenceMap(tree: RawTokenTree): Map<string, Set<string>> {
  const tokenMap = new Map<string, RawTokenTree>();
  flattenTokens(tree, [], tokenMap);

  const reverseMap = new Map<string, Set<string>>();

  for (const [path, token] of tokenMap) {
    const refs = extractReferences(token['$value']);
    for (const ref of refs) {
      if (!reverseMap.has(ref)) {
        reverseMap.set(ref, new Set());
      }
      reverseMap.get(ref)!.add(path);
    }
  }

  return reverseMap;
}

export function resolveAliases(tree: RawTokenTree): RawTokenTree {
  // 1. Flatten all tokens into a map
  const tokenMap = new Map<string, RawTokenTree>();
  flattenTokens(tree, [], tokenMap);

  // 2. Build dependency graph and topologically sort
  const valueMap = new Map<string, unknown>();
  for (const [path, token] of tokenMap) {
    valueMap.set(path, token['$value']);
  }

  const graph = buildDependencyGraph(valueMap);
  const sorted = topologicalSort(graph);

  // 3. Resolve in dependency order
  const resolvedValues = new Map<string, unknown>();

  for (const path of sorted) {
    const token = tokenMap.get(path);
    if (!token) continue;

    const rawValue = token['$value'];
    const resolved = resolveValue(rawValue, resolvedValues, path);
    resolvedValues.set(path, resolved);
  }

  // 4. Also resolve tokens not in the graph (no references)
  for (const [path, token] of tokenMap) {
    if (!resolvedValues.has(path)) {
      resolvedValues.set(path, token['$value']);
    }
  }

  // 5. Rebuild tree with resolved values
  return rebuildTree(tree, resolvedValues, []);
}

function resolveValue(value: unknown, resolved: Map<string, unknown>, currentPath: string): unknown {
  if (typeof value === 'string') {
    // Check if the entire value is a single reference
    const fullMatch = value.match(/^\{([^}]+)\}$/);
    if (fullMatch) {
      const refPath = fullMatch[1];
      const refValue = resolved.get(refPath);
      if (refValue === undefined) {
        throw new TokenParseError(
          `Unresolved reference: {${refPath}} in token "${currentPath}"`,
          undefined,
          currentPath.split('.')
        );
      }
      return refValue;
    }

    // Partial references in string
    return value.replace(ALIAS_REGEX, (_match, refPath: string) => {
      const refValue = resolved.get(refPath);
      if (refValue === undefined) {
        throw new TokenParseError(
          `Unresolved reference: {${refPath}} in token "${currentPath}"`,
          undefined,
          currentPath.split('.')
        );
      }
      return String(refValue);
    });
  }

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      result[k] = resolveValue(v, resolved, currentPath);
    }
    return result;
  }

  if (Array.isArray(value)) {
    return value.map(v => resolveValue(v, resolved, currentPath));
  }

  return value;
}

function flattenTokens(
  node: RawTokenTree,
  path: string[],
  result: Map<string, RawTokenTree>
): void {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;

    if (isPlainObject(value)) {
      const child = value as RawTokenTree;
      const childPath = [...path, key];

      if ('$value' in child) {
        result.set(childPath.join('.'), child);
      } else {
        flattenTokens(child, childPath, result);
      }
    }
  }
}

function rebuildTree(
  node: RawTokenTree,
  resolvedValues: Map<string, unknown>,
  path: string[]
): RawTokenTree {
  const result: RawTokenTree = {};

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      result[key] = value;
      continue;
    }

    if (isPlainObject(value)) {
      const child = value as RawTokenTree;
      const childPath = [...path, key];

      if ('$value' in child) {
        const resolvedValue = resolvedValues.get(childPath.join('.'));
        result[key] = {
          ...child,
          $value: resolvedValue ?? child['$value'],
        };
      } else {
        result[key] = rebuildTree(child, resolvedValues, childPath);
      }
    } else {
      result[key] = value;
    }
  }

  return result;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
