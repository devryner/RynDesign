import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent, PreviewAdapter } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';
import { ReactPreviewAdapter } from './preview-adapter.js';

export interface ReactGeneratorOptions {
  outDir?: string;
  cssStrategy?: 'css-variables' | 'css-modules';
  typescript?: boolean;
  darkMode?: 'media' | 'class' | 'media+class';
}

export function reactGenerator(options: ReactGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'react',
    displayName: 'React',
    platform: 'web',
    outputExtensions: ['.tsx', '.css', '.ts'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateTokenFiles(ctx, options);
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      return generateComponentFile(comp, ctx, options);
    },

    getPreviewAdapter(): PreviewAdapter {
      return new ReactPreviewAdapter();
    },
  };
}

export default reactGenerator;
