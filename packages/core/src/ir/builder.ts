import type {
  ResolvedToken,
  ResolvedValue,
  TokenType,
  TokenGroup,
  ColorValue,
  DimensionValue,
  FontWeightValue,
  DurationValue,
  NumberValue,
  ShadowValue,
  BorderValue,
  TypographyValue,
  FontFamilyValue,
} from '@ryndesign/plugin-api';
import type { RawTokenTree } from '../parser/reader.js';

export function buildTokensFromTree(tree: RawTokenTree): ResolvedToken[] {
  const tokens: ResolvedToken[] = [];
  collectTokens(tree, [], tokens);
  return tokens;
}

export function buildGroupsFromTree(tree: RawTokenTree): TokenGroup[] {
  const groups: TokenGroup[] = [];
  collectGroups(tree, [], groups);
  return groups;
}

function collectTokens(node: RawTokenTree, path: string[], tokens: ResolvedToken[]): void {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;

    if (isPlainObject(value)) {
      const child = value as RawTokenTree;
      const childPath = [...path, key];

      if ('$value' in child) {
        const type = child['$type'] as TokenType;
        const resolvedValue = convertValue(child['$value'], type);

        tokens.push({
          path: childPath,
          name: key,
          $type: type,
          $value: resolvedValue,
          $description: child['$description'] as string | undefined,
          $deprecated: child['$deprecated'] as boolean | string | undefined,
          $extensions: (child['$extensions'] as Record<string, unknown>) ?? {},
          originalValue: child['$value'],
          referencedBy: [],
        });
      } else {
        collectTokens(child, childPath, tokens);
      }
    }
  }
}

function collectGroups(node: RawTokenTree, path: string[], groups: TokenGroup[]): void {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;

    if (isPlainObject(value)) {
      const child = value as RawTokenTree;
      const childPath = [...path, key];

      if (!('$value' in child)) {
        const children: string[] = [];
        for (const [childKey, childVal] of Object.entries(child)) {
          if (!childKey.startsWith('$') && isPlainObject(childVal)) {
            children.push([...childPath, childKey].join('.'));
          }
        }

        groups.push({
          path: childPath,
          name: key,
          $type: child['$type'] as TokenType | undefined,
          $description: child['$description'] as string | undefined,
          children,
        });

        collectGroups(child, childPath, groups);
      }
    }
  }
}

function convertValue(raw: unknown, type: TokenType): ResolvedValue {
  switch (type) {
    case 'color':
      return parseColor(raw);
    case 'dimension':
      return parseDimension(raw);
    case 'fontFamily':
      return parseFontFamily(raw);
    case 'fontWeight':
      return parseFontWeight(raw);
    case 'duration':
      return parseDuration(raw);
    case 'number':
      return { type: 'number', value: Number(raw) };
    case 'shadow':
      return parseShadow(raw);
    case 'border':
      return parseBorder(raw);
    case 'typography':
      return parseTypography(raw);
    case 'cubicBezier':
      return parseCubicBezier(raw);
    case 'transition':
      return parseTransition(raw);
    case 'gradient':
      return parseGradient(raw);
    default:
      // Fallback: try to infer type
      return inferValue(raw);
  }
}

function parseColor(raw: unknown): ColorValue {
  const hex = String(raw);
  const { r, g, b, a } = hexToRgba(hex);
  return { type: 'color', hex, r, g, b, a };
}

function hexToRgba(hex: string): { r: number; g: number; b: number; a: number } {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
  if (h.length === 6) h += 'ff';

  const num = parseInt(h, 16);
  return {
    r: (num >> 24) & 0xff,
    g: (num >> 16) & 0xff,
    b: (num >> 8) & 0xff,
    a: ((num & 0xff) / 255),
  };
}

function parseDimension(raw: unknown): DimensionValue {
  const str = String(raw);
  const match = str.match(/^(-?\d*\.?\d+)(px|rem|em|%|vw|vh)$/);
  if (match) {
    return {
      type: 'dimension',
      value: parseFloat(match[1]),
      unit: match[2] as DimensionValue['unit'],
    };
  }
  return { type: 'dimension', value: parseFloat(str) || 0, unit: 'px' };
}

function parseFontFamily(raw: unknown): FontFamilyValue {
  if (Array.isArray(raw)) {
    return { type: 'fontFamily', value: raw.map(String) };
  }
  return {
    type: 'fontFamily',
    value: String(raw).split(',').map(s => s.trim()),
  };
}

function parseFontWeight(raw: unknown): ResolvedValue {
  const num = Number(raw);
  const keywords: Record<number, string> = {
    100: 'thin', 200: 'extralight', 300: 'light', 400: 'normal',
    500: 'medium', 600: 'semibold', 700: 'bold', 800: 'extrabold', 900: 'black',
  };
  return {
    type: 'fontWeight',
    value: num,
    keyword: keywords[num],
  };
}

function parseDuration(raw: unknown): ResolvedValue {
  const str = String(raw);
  const match = str.match(/^(\d*\.?\d+)(ms|s)$/);
  if (match) {
    return { type: 'duration', value: parseFloat(match[1]), unit: match[2] as 'ms' | 's' };
  }
  return { type: 'duration', value: parseFloat(str) || 0, unit: 'ms' };
}

function parseShadow(raw: unknown): ShadowValue {
  const obj = raw as Record<string, string>;
  return {
    type: 'shadow',
    color: obj.color ?? '#000000',
    offsetX: obj.offsetX ?? '0px',
    offsetY: obj.offsetY ?? '0px',
    blur: obj.blur ?? '0px',
    spread: obj.spread ?? '0px',
  };
}

function parseBorder(raw: unknown): BorderValue {
  const obj = raw as Record<string, string>;
  return {
    type: 'border',
    color: obj.color ?? '#000000',
    width: obj.width ?? '1px',
    style: (obj.style as BorderValue['style']) ?? 'solid',
  };
}

function parseTypography(raw: unknown): TypographyValue {
  const obj = raw as Record<string, unknown>;
  return {
    type: 'typography',
    fontFamily: String(obj.fontFamily ?? 'sans-serif'),
    fontSize: String(obj.fontSize ?? '16px'),
    fontWeight: Number(obj.fontWeight ?? 400),
    lineHeight: obj.lineHeight as number | string ?? 1.5,
    letterSpacing: obj.letterSpacing as string | undefined,
  };
}

function parseCubicBezier(raw: unknown): ResolvedValue {
  const arr = raw as number[];
  return {
    type: 'cubicBezier',
    value: [arr[0] ?? 0, arr[1] ?? 0, arr[2] ?? 1, arr[3] ?? 1],
  };
}

function parseTransition(raw: unknown): ResolvedValue {
  const obj = raw as Record<string, string>;
  return {
    type: 'transition',
    duration: obj.duration ?? '250ms',
    delay: obj.delay ?? '0ms',
    timingFunction: obj.timingFunction ?? 'ease',
  };
}

function parseGradient(raw: unknown): ResolvedValue {
  const obj = raw as Record<string, unknown>;
  return {
    type: 'gradient',
    gradientType: (obj.type as 'linear' | 'radial') ?? 'linear',
    angle: obj.angle as number | undefined,
    stops: (obj.stops as Array<{ color: string; position: number }>) ?? [],
  };
}

function inferValue(raw: unknown): ResolvedValue {
  if (typeof raw === 'number') {
    return { type: 'number', value: raw };
  }
  if (typeof raw === 'string') {
    if (raw.startsWith('#')) return parseColor(raw);
    if (/^\d/.test(raw) && /px|rem|em|%|vw|vh/.test(raw)) return parseDimension(raw);
    if (/^\d+ms|s$/.test(raw)) return parseDuration(raw);
  }
  return { type: 'number', value: 0 };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
