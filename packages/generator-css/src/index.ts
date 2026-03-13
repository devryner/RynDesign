import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface CssGeneratorOptions {
  outDir?: string;
  scss?: boolean;
  cssModules?: boolean;
  darkMode?: 'media' | 'class' | 'media+class';
  prefix?: string;
}

export function cssGenerator(options: CssGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'css',
    displayName: 'CSS/SCSS',
    platform: 'web',
    outputExtensions: options.scss ? ['.scss', '.css'] : ['.css'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateTokenFiles(ctx, options);
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateComponentFile(comp, ctx, options);
    },
  };
}

export default cssGenerator;
