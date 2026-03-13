import type { TokenType } from '@ryndesign/plugin-api';
import type { RawTokenTree } from '../parser/reader.js';

const RESERVED_KEYS = new Set(['$type', '$value', '$description', '$deprecated', '$extensions', '$schema']);

export function inheritTypes(tree: RawTokenTree): RawTokenTree {
  return inheritTypesRecursive(tree, undefined);
}

function inheritTypesRecursive(node: RawTokenTree, parentType: TokenType | undefined): RawTokenTree {
  const currentType = (node['$type'] as TokenType | undefined) ?? parentType;
  const result: RawTokenTree = {};

  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) {
      result[key] = value;
      continue;
    }

    if (isPlainObject(value)) {
      const child = value as RawTokenTree;
      if ('$value' in child) {
        // Token node - apply inherited type if not specified
        result[key] = {
          ...child,
          $type: (child['$type'] as TokenType | undefined) ?? currentType,
        };
      } else {
        // Group node - recurse
        result[key] = inheritTypesRecursive(child, currentType);
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
