import type { ResolvedTokenSet } from './tokens.js';
import type { ResolvedComponent } from './components.js';

export interface GeneratedFile {
  path: string;
  content: string;
  language?: string;
}

export interface GeneratorConfig {
  outDir: string;
  typescript?: boolean;
  darkMode?: string;
  [key: string]: unknown;
}

export interface GeneratorHelpers {
  camelCase(str: string): string;
  pascalCase(str: string): string;
  kebabCase(str: string): string;
  snakeCase(str: string): string;
  tokenToCssVar(path: string[]): string;
  tokenToScssVar(path: string[]): string;
  formatColor(hex: string, format: 'hex' | 'rgb' | 'hsl'): string;
}

export interface GeneratorContext {
  tokenSet: ResolvedTokenSet;
  config: GeneratorConfig;
  outputDir: string;
  helpers: GeneratorHelpers;
  components?: ResolvedComponent[];
}

export interface PreviewAdapter {
  previewSetup(): string;
  renderToPreviewHTML(comp: ResolvedComponent, tokens: Record<string, string>): string;
}

export interface GeneratorPlugin {
  name: string;
  displayName: string;
  platform: 'web' | 'ios' | 'android' | 'cross-platform';
  outputExtensions: string[];

  generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]>;
  generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]>;
  getPreviewAdapter?(): PreviewAdapter;
}
