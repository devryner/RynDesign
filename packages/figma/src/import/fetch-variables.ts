import { FigmaClient, type FigmaVariable, type FigmaColor, type FigmaVariableAlias } from '../api-client.js';

export interface FetchOptions {
  fileKey: string;
  personalAccessToken?: string;
  oauthToken?: string;
  collectionFilter?: string[];
}

export interface MappedToken {
  path: string[];
  type: string;
  value: unknown;
  description?: string;
  modes: Record<string, unknown>;
}

export async function fetchFigmaVariables(options: FetchOptions): Promise<MappedToken[]> {
  const client = new FigmaClient({
    personalAccessToken: options.personalAccessToken,
    oauthToken: options.oauthToken,
  });

  const response = await client.getFileVariables(options.fileKey);
  const { variables, variableCollections } = response.meta;

  const tokens: MappedToken[] = [];

  for (const variable of Object.values(variables)) {
    // Skip remote/external variables
    if (variable.remote) continue;

    // Apply collection filter
    if (options.collectionFilter) {
      const collection = variableCollections[variable.variableCollectionId];
      if (collection && !options.collectionFilter.includes(collection.name)) continue;
    }

    const mapped = mapVariable(variable, variableCollections, variables);
    if (mapped) tokens.push(mapped);
  }

  return tokens;
}

function mapVariable(
  variable: FigmaVariable,
  collections: Record<string, { modes: Array<{ modeId: string; name: string }>; defaultModeId: string }>,
  allVariables: Record<string, FigmaVariable>
): MappedToken | null {
  // Convert Figma name (slash-separated) to path
  const path = variable.name.split('/').map(s => s.trim());

  const type = figmaTypeToTokenType(variable.resolvedType);
  if (!type) return null;

  const collection = collections[variable.variableCollectionId];
  if (!collection) return null;

  // Get values for each mode
  const modes: Record<string, unknown> = {};
  let defaultValue: unknown = null;

  for (const mode of collection.modes) {
    const rawValue = variable.valuesByMode[mode.modeId];
    const value = resolveValue(rawValue, variable.resolvedType, allVariables);
    modes[mode.name] = value;

    if (mode.modeId === collection.defaultModeId) {
      defaultValue = value;
    }
  }

  return {
    path,
    type,
    value: defaultValue,
    description: variable.description || undefined,
    modes,
  };
}

function resolveValue(
  value: unknown,
  resolvedType: string,
  allVariables: Record<string, FigmaVariable>
): unknown {
  if (value && typeof value === 'object' && 'type' in value) {
    const alias = value as FigmaVariableAlias;
    if (alias.type === 'VARIABLE_ALIAS') {
      const refVar = allVariables[alias.id];
      if (refVar) {
        // Return as reference path
        return `{${refVar.name.split('/').join('.')}}`;
      }
    }
  }

  if (resolvedType === 'COLOR' && typeof value === 'object' && value !== null) {
    const color = value as FigmaColor;
    return rgbaToHex(color.r, color.g, color.b, color.a);
  }

  return value;
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  if (a < 1) return `${hex}${toHex(a)}`;
  return hex;
}

function figmaTypeToTokenType(resolvedType: string): string | null {
  switch (resolvedType) {
    case 'COLOR': return 'color';
    case 'FLOAT': return 'number';
    case 'STRING': return 'fontFamily';
    case 'BOOLEAN': return null; // No direct W3C type
    default: return null;
  }
}

export function mapFigmaToTokens(mappedTokens: MappedToken[]): Record<string, unknown> {
  const tree: Record<string, unknown> = {};

  for (const token of mappedTokens) {
    let current: Record<string, unknown> = tree;

    for (let i = 0; i < token.path.length - 1; i++) {
      const key = token.path[i];
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    const lastKey = token.path[token.path.length - 1];
    current[lastKey] = {
      $type: token.type,
      $value: token.value,
      ...(token.description ? { $description: token.description } : {}),
    };
  }

  return tree;
}
