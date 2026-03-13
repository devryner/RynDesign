import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';
import { generateTokenFiles } from './tokens.js';
import { generateComponentFile } from './component.js';

export interface SwiftUIGeneratorOptions {
  outDir?: string;
  minimumDeploymentTarget?: string;
  darkMode?: 'dynamic-color' | 'environment';
}

export function swiftuiGenerator(options: SwiftUIGeneratorOptions = {}): GeneratorPlugin {
  return {
    name: 'swiftui',
    displayName: 'SwiftUI',
    platform: 'ios',
    outputExtensions: ['.swift'],
    async generateTokens(ctx) { return generateTokenFiles(ctx, options); },
    async generateComponent(comp, ctx) { return generateComponentFile(comp, ctx, options); },
  };
}
export default swiftuiGenerator;
