import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface AndroidViewGeneratorOptions {
  outDir?: string;
  packageName?: string;
  minSdkVersion?: number;
  useViewBinding?: boolean;
}

export function androidViewGenerator(options: AndroidViewGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'android-view',
    displayName: 'Android View',
    platform: 'android',
    outputExtensions: ['.kt', '.xml'],
    async generateTokens(ctx) { return generateTokenFiles(ctx, options); },
    async generateComponent(comp, ctx) { return generateComponentFile(comp, ctx, options); },
  };
}

export default androidViewGenerator;
