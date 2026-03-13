import type { GeneratorPlugin } from './generator.js';
import type { ResolvedTokenSet } from './tokens.js';
import type { GeneratedFile } from './generator.js';

export interface ThemeConfig {
  file: string;
}

export interface FigmaConfig {
  fileKey?: string;
  personalAccessToken?: string;
  modeMapping?: Record<string, string>;
}

export interface PreviewConfig {
  port?: number;
  open?: boolean;
}

export interface RynDesignConfig {
  tokens: string[];
  components?: string[];
  outDir?: string;
  themes?: {
    default?: string;
    [key: string]: string | ThemeConfig | undefined;
  };
  generators?: GeneratorPlugin[];
  figma?: FigmaConfig;
  preview?: PreviewConfig;
  hooks?: {
    'tokens:resolved'?: (tokenSet: ResolvedTokenSet) => Promise<void> | void;
    'generate:complete'?: (files: GeneratedFile[]) => Promise<void> | void;
  };
}

export function defineConfig(config: RynDesignConfig): RynDesignConfig {
  return config;
}
