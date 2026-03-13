import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface RailsGeneratorOptions {
  outDir?: string;
  cssStrategy?: 'scss-variables' | 'css-variables';
  darkMode?: 'media' | 'class' | 'media+class';
}

export function railsGenerator(options: RailsGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'rails',
    displayName: 'Rails',
    platform: 'web',
    outputExtensions: ['.scss', '.erb', '.rb'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateTokenFiles(ctx, options);
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateComponentFile(comp, ctx, options);
    },
  };
}

export default railsGenerator;
