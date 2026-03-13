// W3C Design Token Types
export type TokenType =
  | 'color'
  | 'dimension'
  | 'fontFamily'
  | 'fontWeight'
  | 'duration'
  | 'cubicBezier'
  | 'number'
  | 'shadow'
  | 'border'
  | 'typography'
  | 'transition'
  | 'gradient';

// Resolved value discriminated union
export interface ColorValue {
  type: 'color';
  hex: string;
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface DimensionValue {
  type: 'dimension';
  value: number;
  unit: 'px' | 'rem' | 'em' | '%' | 'vw' | 'vh';
}

export interface FontFamilyValue {
  type: 'fontFamily';
  value: string[];
}

export interface FontWeightValue {
  type: 'fontWeight';
  value: number;
  keyword?: string;
}

export interface DurationValue {
  type: 'duration';
  value: number;
  unit: 'ms' | 's';
}

export interface CubicBezierValue {
  type: 'cubicBezier';
  value: [number, number, number, number];
}

export interface NumberValue {
  type: 'number';
  value: number;
}

export interface ShadowValue {
  type: 'shadow';
  color: string;
  offsetX: string;
  offsetY: string;
  blur: string;
  spread: string;
}

export interface BorderValue {
  type: 'border';
  color: string;
  width: string;
  style: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
}

export interface TypographyValue {
  type: 'typography';
  fontFamily: string;
  fontSize: string;
  fontWeight: number;
  lineHeight: number | string;
  letterSpacing?: string;
}

export interface TransitionValue {
  type: 'transition';
  duration: string;
  delay: string;
  timingFunction: string;
}

export interface GradientStop {
  color: string;
  position: number;
}

export interface GradientValue {
  type: 'gradient';
  gradientType: 'linear' | 'radial';
  angle?: number;
  stops: GradientStop[];
}

export type ResolvedValue =
  | ColorValue
  | DimensionValue
  | FontFamilyValue
  | FontWeightValue
  | DurationValue
  | CubicBezierValue
  | NumberValue
  | ShadowValue
  | BorderValue
  | TypographyValue
  | TransitionValue
  | GradientValue;

// Resolved Token
export interface ResolvedToken {
  path: string[];
  name: string;
  $type: TokenType;
  $value: ResolvedValue;
  $description?: string;
  $deprecated?: boolean | string;
  $extensions: Record<string, unknown>;
  originalValue: unknown;
  referencedBy: string[];
}

// Token Set Metadata
export interface TokenSetMetadata {
  name?: string;
  description?: string;
  version?: string;
}

// Token Group
export interface TokenGroup {
  path: string[];
  name: string;
  $type?: TokenType;
  $description?: string;
  children: string[]; // token paths
}

// Theme
export interface ThemeOverrides {
  name: string;
  description?: string;
  tokens: ResolvedToken[];
}

export interface ThemeSet {
  default: string;
  themes: Record<string, ThemeOverrides>;
}

// Resolved Token Set - the final IR
export interface ResolvedTokenSet {
  metadata: TokenSetMetadata;
  tokens: ResolvedToken[];
  groups: TokenGroup[];
  themes: ThemeSet;
}
