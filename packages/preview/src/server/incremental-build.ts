import { buildTokenSet, type RawTokenTree } from '@ryndesign/core';
import type { ResolvedTokenSet, GeneratedFile } from '@ryndesign/plugin-api';
import fs from 'node:fs/promises';
import path from 'node:path';

export class IncrementalBuilder {
  private tokenSet: ResolvedTokenSet | null = null;
  private generatedFiles: Map<string, GeneratedFile[]> = new Map();
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

    // Try to load config, fallback to defaults
    let tokens = ['tokens/**/*.tokens.json'];
    let themes: any = undefined;

    try {
      const configPath = path.resolve(this.cwd, configFile);
      const content = await fs.readFile(configPath, 'utf-8');
      // Basic config parsing (in production, use jiti)
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

  getComponents(): unknown[] {
    // TODO: Load component definitions
    return [];
  }

  getGeneratedFiles(platform?: string): GeneratedFile[] {
    if (!platform) {
      return Array.from(this.generatedFiles.values()).flat();
    }
    return this.generatedFiles.get(platform) ?? [];
  }

  async updateToken(tokenPath: string, value: unknown, theme?: string): Promise<void> {
    // Update the token in the file
    const filePath = theme
      ? path.resolve(this.cwd, `tokens/${theme}.tokens.json`)
      : path.resolve(this.cwd, 'tokens/semantic.tokens.json');

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const tree = JSON.parse(content) as RawTokenTree;

      // Navigate to the token path and update
      const parts = tokenPath.split('.');
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

      // Rebuild
      await this.rebuild();
    } catch (err) {
      console.error(`Failed to update token: ${(err as Error).message}`);
      throw err;
    }
  }
}
