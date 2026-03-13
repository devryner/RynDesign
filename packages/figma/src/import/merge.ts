import type { MappedToken } from './fetch-variables.js';

export type MergeStrategy = 'prefer-remote' | 'prefer-local' | 'remote-only-new';

export interface MergeOptions {
  strategy: MergeStrategy;
}

export interface MergeResult {
  merged: Record<string, unknown>;
  stats: {
    added: number;
    updated: number;
    kept: number;
    total: number;
  };
}

/**
 * Merge fetched Figma tokens with an existing local token tree.
 *
 * Strategies:
 * - prefer-remote: Remote values win for conflicts; new remote tokens added; local-only tokens kept.
 * - prefer-local: Local values win for conflicts; new remote tokens added; local-only tokens kept.
 * - remote-only-new: Only add tokens that don't exist locally; never overwrite.
 */
export function mergeTokens(
  existingTree: Record<string, unknown>,
  remoteTokens: MappedToken[],
  options: MergeOptions = { strategy: 'prefer-remote' }
): MergeResult {
  const { strategy } = options;

  // Deep clone existing tree to avoid mutations
  const merged = structuredClone(existingTree);

  let added = 0;
  let updated = 0;
  let kept = 0;

  for (const token of remoteTokens) {
    const existing = getNestedValue(merged, token.path);
    const isExisting = existing !== undefined && existing !== null && typeof existing === 'object' && '$value' in (existing as Record<string, unknown>);

    if (!isExisting) {
      // Token doesn't exist locally — always add
      setNestedValue(merged, token.path, {
        $type: token.type,
        $value: token.value,
        ...(token.description ? { $description: token.description } : {}),
      });
      added++;
    } else if (strategy === 'remote-only-new') {
      // Skip — local exists, we only add new
      kept++;
    } else if (strategy === 'prefer-remote') {
      // Overwrite local with remote
      setNestedValue(merged, token.path, {
        $type: token.type,
        $value: token.value,
        ...(token.description ? { $description: token.description } : {}),
      });
      updated++;
    } else {
      // prefer-local — keep local value
      kept++;
    }
  }

  // Count total tokens in merged tree
  const total = countTokens(merged);

  return {
    merged,
    stats: { added, updated, kept, total },
  };
}

function getNestedValue(obj: Record<string, unknown>, path: string[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function setNestedValue(obj: Record<string, unknown>, path: string[], value: unknown): void {
  let current = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key] as Record<string, unknown>;
  }
  current[path[path.length - 1]] = value;
}

function countTokens(obj: Record<string, unknown>): number {
  let count = 0;
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') {
      const rec = value as Record<string, unknown>;
      if ('$value' in rec) {
        count++;
      } else {
        count += countTokens(rec);
      }
    }
  }
  return count;
}
