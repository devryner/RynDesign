import type { MappedToken } from './fetch-variables.js';

export interface ModeMapping {
  [modeName: string]: string; // modeName -> output file path
}

export interface ResolvedModeFiles {
  [filePath: string]: Record<string, unknown>;
}

export function resolveFigmaModes(
  tokens: MappedToken[],
  modeMapping: ModeMapping
): ResolvedModeFiles {
  const result: ResolvedModeFiles = {};

  // Find all unique modes
  const allModes = new Set<string>();
  for (const token of tokens) {
    for (const mode of Object.keys(token.modes)) {
      allModes.add(mode);
    }
  }

  // Build tree for each mode
  for (const modeName of allModes) {
    const filePath = modeMapping[modeName];
    if (!filePath) continue;

    const tree: Record<string, unknown> = {};

    // Add theme extension if not the default mode
    const isDefault = modeName === 'Light' || modeName === 'light' || modeName === 'Default';
    if (!isDefault) {
      tree['$extensions'] = {
        'com.ryndesign.theme': {
          name: modeName.toLowerCase(),
          extends: 'default',
        },
      };
    }

    for (const token of tokens) {
      const value = token.modes[modeName];
      if (value === undefined) continue;

      // For non-default modes, only include tokens that differ from default
      if (!isDefault) {
        const defaultMode = Object.keys(token.modes).find(
          m => m === 'Light' || m === 'light' || m === 'Default'
        );
        if (defaultMode && token.modes[defaultMode] === value) continue;
      }

      setNestedValue(tree, token.path, {
        $type: token.type,
        $value: value,
        ...(token.description ? { $description: token.description } : {}),
      });
    }

    result[filePath] = tree;
  }

  return result;
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
