import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface UIKitGeneratorOptions {
  outDir?: string;
  minimumDeploymentTarget?: string;
  darkMode?: 'dynamic-provider' | 'trait-collection';
  useAutoLayout?: boolean;
}

export function uikitGenerator(options: UIKitGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'uikit',
    displayName: 'UIKit',
    platform: 'ios',
    outputExtensions: ['.swift'],
    async generateTokens(ctx) { return generateTokenFiles(ctx, options); },
    async generateComponent(comp, ctx) { return generateComponentFile(comp, ctx, options); },
  };
}

export default uikitGenerator;
