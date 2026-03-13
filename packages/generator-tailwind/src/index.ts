import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface TailwindGeneratorOptions {
  outDir?: string;
  configFormat?: 'ts' | 'js' | 'cjs';
  cssPath?: string;
  prefix?: string;
}

export function tailwindGenerator(options: TailwindGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'tailwind',
    displayName: 'Tailwind CSS',
    platform: 'web',
    outputExtensions: ['.ts', '.js', '.css'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateTokenFiles(ctx, options);
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateComponentFile(comp, ctx, options);
    },
  };
}

export default tailwindGenerator;
