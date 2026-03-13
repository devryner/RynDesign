import { buildTokenSet, loadComponents, resolveComponent, type RawTokenTree } from '@ryndesign/core';
import type { ResolvedTokenSet, GeneratedFile, ResolvedComponent, GeneratorPlugin } from '@ryndesign/plugin-api';
import fs from 'node:fs/promises';
import path from 'node:path';

export class IncrementalBuilder {
  private tokenSet: ResolvedTokenSet | null = null;
  private components: ResolvedComponent[] = [];
  private generatedFiles: Map<string, GeneratedFile[]> = new Map();
  private generators: GeneratorPlugin[] = [];
  private cwd: string;
  private configPath?: string;

  constructor(cwd: string, configPath?: string) {
    this.cwd = cwd;
    this.configPath = configPath;
  }

  async initialBuild(): Promise<void> {
    await this.rebuild();
  }

  async rebuild(): Promise<void> {
    const configFile = this.configPath ?? 'ryndesign.config.ts';

    const tokens = ['tokens/**/*.tokens.json'];
    const componentPatterns = ['components/**/*.component.json'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let themes: any = undefined;

    try {
      const configPath = path.resolve(this.cwd, configFile);
      const content = await fs.readFile(configPath, 'utf-8');
      if (content.includes('dark')) {
        themes = {
          default: 'light',
          dark: { file: path.resolve(this.cwd, 'tokens/dark.tokens.json') },
        };
      }
    } catch {
      // Use defaults
    }

    this.tokenSet = await buildTokenSet({
      tokens,
      basePath: this.cwd,
      themes,
    });

    // Load and resolve components
    try {
      const componentDefs = await loadComponents(componentPatterns, this.cwd);
      this.components = componentDefs.map(def => resolveComponent(def, this.tokenSet!));
    } catch {
      this.components = [];
    }
  }

  getTokenSet(): ResolvedTokenSet | null {
    return this.tokenSet;
  }

  getThemes(): Record<string, unknown> {
    if (!this.tokenSet) return {};
    return {
      default: this.tokenSet.themes.default,
      available: Object.keys(this.tokenSet.themes.themes),
      themes: this.tokenSet.themes.themes,
    };
  }

  getThemeTokens(theme: string): Record<string, unknown> {
    if (!this.tokenSet) return {};
    const themeData = this.tokenSet.themes.themes[theme];
    if (!themeData) return {};
    return {
      name: themeData.name,
      tokens: themeData.tokens,
    };
  }

  getComponents(): ResolvedComponent[] {
    return this.components;
  }

  setGenerators(generators: GeneratorPlugin[]): void {
    this.generators = generators;
  }

  async generateSnippets(platform: string, componentName?: string, type?: string): Promise<string> {
    if (!this.tokenSet) return '';

    const generator = this.generators.find(g => g.name === platform);
    if (!generator) return `// Generator for "${platform}" not available`;

    const { createGeneratorHelpers } = await import('@ryndesign/core');
    const ctx = {
      tokenSet: this.tokenSet,
      config: { outDir: 'generated' },
      outputDir: path.resolve(this.cwd, 'generated'),
      helpers: createGeneratorHelpers(),
      components: this.components,
    };

    try {
      if (type === 'tokens') {
        const files = await generator.generateTokens(ctx);
        return files.map(f => `// ${f.path}\n${f.content}`).join('\n\n');
      }

      if (componentName) {
        const comp = this.components.find(c => c.definition.name === componentName);
        if (comp) {
          const files = await generator.generateComponent(comp, ctx);
          return files.map(f => `// ${f.path}\n${f.content}`).join('\n\n');
        }
        return `// Component "${componentName}" not found`;
      }

      return '// Specify a component or type=tokens';
    } catch (err) {
      return `// Error: ${(err as Error).message}`;
    }
  }

  getGeneratedFiles(platform?: string): GeneratedFile[] {
    if (!platform) {
      return Array.from(this.generatedFiles.values()).flat();
    }
    return this.generatedFiles.get(platform) ?? [];
  }

  async updateToken(tokenPath: string, value: unknown, theme?: string): Promise<void> {
    const filePath = theme
      ? path.resolve(this.cwd, `tokens/${theme}.tokens.json`)
      : path.resolve(this.cwd, 'tokens/semantic.tokens.json');

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const tree = JSON.parse(content) as RawTokenTree;

      const parts = tokenPath.split('.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = tree;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
      }

      const lastKey = parts[parts.length - 1];
      if (current[lastKey] && typeof current[lastKey] === 'object' && '$value' in current[lastKey]) {
        current[lastKey].$value = value;
      } else {
        current[lastKey] = { $type: 'color', $value: value };
      }

      await fs.writeFile(filePath, JSON.stringify(tree, null, 2), 'utf-8');
      await this.rebuild();
    } catch (err) {
      console.error(`Failed to update token: ${(err as Error).message}`);
      throw err;
    }
  }
}
