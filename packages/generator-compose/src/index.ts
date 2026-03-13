import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface ComposeGeneratorOptions {
  outDir?: string;
  packageName?: string;
  darkMode?: 'system' | 'manual';
  materialVersion?: 2 | 3;
}

export function composeGenerator(options: ComposeGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'compose',
    displayName: 'Jetpack Compose',
    platform: 'android',
    outputExtensions: ['.kt'],
    async generateTokens(ctx) { return generateTokenFiles(ctx, options); },
    async generateComponent(comp, ctx) { return generateComponentFile(comp, ctx, options); },
  };
}

export default composeGenerator;
