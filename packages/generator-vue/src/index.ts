import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface VueGeneratorOptions {
  outDir?: string;
  cssStrategy?: 'css-variables' | 'css-modules';
  typescript?: boolean;
  darkMode?: 'media' | 'class' | 'media+class';
}

export function vueGenerator(options: VueGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'vue',
    displayName: 'Vue',
    platform: 'web',
    outputExtensions: ['.vue', '.css', '.ts'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateTokenFiles(ctx, options);
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateComponentFile(comp, ctx, options);
    },
  };
}

export default vueGenerator;
