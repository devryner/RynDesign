import type { ResolvedToken } from '@ryndesign/plugin-api';
import type { FigmaColor } from '../api-client.js';

export interface FigmaVariableData {
  name: string;
  resolvedType: string;
  value: unknown;
  description?: string;
  scopes?: string[];
}

export function mapTokenToFigmaVariable(token: ResolvedToken): FigmaVariableData | null {
  const name = token.path.join('/');
  const resolvedType = getResolvedType(token.$type);

  if (!resolvedType) return null;

  return {
    name,
    resolvedType,
    value: convertToFigmaValue(token),
    description: token.$description,
    scopes: getScopesForType(token.$type),
  };
}

function getResolvedType(tokenType: string): string | null {
  switch (tokenType) {
    case 'color': return 'COLOR';
    case 'dimension':
    case 'number':
    case 'fontWeight':
    case 'duration': return 'FLOAT';
    case 'fontFamily': return 'STRING';
    default: return null;
  }
}

function convertToFigmaValue(token: ResolvedToken): unknown {
  const val = token.$value;
  switch (val.type) {
    case 'color':
      return { r: val.r / 255, g: val.g / 255, b: val.b / 255, a: val.a } satisfies FigmaColor;
    case 'dimension':
      return val.value;
    case 'number':
      return val.value;
    case 'fontWeight':
      return val.value;
    case 'fontFamily':
      return val.value.join(', ');
    case 'duration':
      return val.unit === 's' ? val.value * 1000 : val.value;
    default:
      return null;
  }
}

function getScopesForType(type: string): string[] {
  switch (type) {
    case 'color': return ['ALL_FILLS', 'STROKE_COLOR'];
    case 'dimension': return ['GAP', 'WIDTH_HEIGHT'];
    case 'fontFamily': return ['FONT_FAMILY'];
    case 'fontWeight': return ['FONT_STYLE'];
    default: return ['ALL_SCOPES'];
  }
}
