import type { FigmaVariable, FigmaColor } from '../api-client.js';

export interface TokenMapping {
  path: string[];
  $type: string;
  $value: unknown;
  $description?: string;
}

export function mapFigmaVariableToToken(variable: FigmaVariable, value: unknown): TokenMapping | null {
  const path = variable.name.split('/').map(s => s.trim().replace(/\s+/g, '-').toLowerCase());
  const type = getTokenType(variable.resolvedType);

  if (!type) return null;

  return {
    path,
    $type: type,
    $value: convertValue(value, variable.resolvedType),
    $description: variable.description || undefined,
  };
}

function getTokenType(figmaType: string): string | null {
  const map: Record<string, string> = {
    COLOR: 'color',
    FLOAT: 'number',
    STRING: 'fontFamily',
  };
  return map[figmaType] ?? null;
}

function convertValue(value: unknown, resolvedType: string): unknown {
  if (resolvedType === 'COLOR' && isColorValue(value)) {
    return rgbaToHex(value.r, value.g, value.b, value.a);
  }
  return value;
}

function isColorValue(value: unknown): value is FigmaColor {
  return typeof value === 'object' && value !== null && 'r' in value && 'g' in value && 'b' in value;
}

function rgbaToHex(r: number, g: number, b: number, a: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}${a < 1 ? toHex(a) : ''}`;
}
