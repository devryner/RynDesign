import type { ResolvedToken } from '@ryndesign/plugin-api';
import type { MappedToken } from '../import/fetch-variables.js';

export interface DiffEntry {
  path: string;
  type: 'added' | 'removed' | 'modified';
  local?: unknown;
  remote?: unknown;
}

export interface DiffResult {
  added: DiffEntry[];
  removed: DiffEntry[];
  modified: DiffEntry[];
  unchanged: number;
}

export function diffFigmaTokens(
  localTokens: ResolvedToken[],
  remoteTokens: MappedToken[]
): DiffResult {
  const result: DiffResult = {
    added: [],
    removed: [],
    modified: [],
    unchanged: 0,
  };

  const remoteMap = new Map<string, MappedToken>();
  for (const token of remoteTokens) {
    remoteMap.set(token.path.join('.'), token);
  }

  const localMap = new Map<string, ResolvedToken>();
  for (const token of localTokens) {
    localMap.set(token.path.join('.'), token);
  }

  // Check for added and modified tokens
  for (const token of localTokens) {
    const path = token.path.join('.');
    const remote = remoteMap.get(path);

    if (!remote) {
      result.added.push({
        path,
        type: 'added',
        local: formatTokenValue(token),
      });
    } else {
      const localValue = formatTokenValue(token);
      const remoteValue = remote.value;

      if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
        result.modified.push({
          path,
          type: 'modified',
          local: localValue,
          remote: remoteValue,
        });
      } else {
        result.unchanged++;
      }
    }
  }

  // Check for removed tokens
  for (const token of remoteTokens) {
    const path = token.path.join('.');
    if (!localMap.has(path)) {
      result.removed.push({
        path,
        type: 'removed',
        remote: token.value,
      });
    }
  }

  return result;
}

function formatTokenValue(token: ResolvedToken): unknown {
  const value = token.$value;
  switch (value.type) {
    case 'color': return value.hex;
    case 'dimension': return `${value.value}${value.unit}`;
    case 'number': return value.value;
    case 'fontWeight': return value.value;
    case 'fontFamily': return value.value.join(', ');
    case 'duration': return `${value.value}${value.unit}`;
    default: return null;
  }
}
