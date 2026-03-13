import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface SvelteGeneratorOptions {
  outDir?: string;
  cssStrategy?: 'css-variables' | 'css-modules';
  typescript?: boolean;
  darkMode?: 'media' | 'class' | 'media+class';
}

export function svelteGenerator(options: SvelteGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'svelte',
    displayName: 'Svelte',
    platform: 'web',
    outputExtensions: ['.svelte', '.css', '.ts'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateTokenFiles(ctx, options);
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateComponentFile(comp, ctx, options);
    },
  };
}

export default svelteGenerator;
