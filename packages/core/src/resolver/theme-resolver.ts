import type { ThemeSet, ThemeOverrides, ResolvedToken } from '@ryndesign/plugin-api';
import type { RawTokenTree } from '../parser/reader.js';
import { readTokenFile, deepMerge } from '../parser/reader.js';
import { inheritTypes } from './type-inheritor.js';
import { resolveAliases } from './alias-resolver.js';

export interface ThemeConfig {
  default?: string;
  [key: string]: string | { file: string } | undefined;
}

export async function resolveThemes(
  baseTree: RawTokenTree,
  themeConfig: ThemeConfig | undefined,
  buildTokensFn: (tree: RawTokenTree) => ResolvedToken[]
): Promise<ThemeSet> {
  const themes: Record<string, ThemeOverrides> = {};
  const defaultTheme = themeConfig?.default ?? 'light';

  if (!themeConfig) {
    return { default: defaultTheme, themes: {} };
  }

  for (const [key, value] of Object.entries(themeConfig)) {
    if (key === 'default') continue;
    if (value === undefined) continue;

    const filePath = typeof value === 'string' ? value : value.file;
    const themeTree = await readTokenFile(filePath);

    // Extract theme metadata
    const themeName = (themeTree['$extensions'] as Record<string, unknown>)?.['com.ryndesign.theme'] as Record<string, unknown> | undefined;
    const name = (themeName?.['name'] as string) ?? key;

    // Merge theme overrides onto base to resolve aliases
    const mergedTree = deepMerge(baseTree, themeTree);
    const withTypes = inheritTypes(mergedTree);
    const resolved = resolveAliases(withTypes);

    // Build only the overridden tokens
    const overrideTokens = buildTokensFn(resolved);

    // Filter to only tokens that exist in the theme overlay
    const themeTokenPaths = new Set<string>();
    collectTokenPaths(themeTree, [], themeTokenPaths);

    const filteredTokens = overrideTokens.filter(t =>
      themeTokenPaths.has(t.path.join('.'))
    );

    themes[key] = {
      name,
      description: themeTree['$description'] as string | undefined,
      tokens: filteredTokens,
    };
  }

  return { default: defaultTheme, themes };
}

function collectTokenPaths(node: RawTokenTree, path: string[], result: Set<string>): void {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;

    if (isPlainObject(value)) {
      const child = value as RawTokenTree;
      const childPath = [...path, key];

      if ('$value' in child) {
        result.add(childPath.join('.'));
      } else {
        collectTokenPaths(child, childPath, result);
      }
    }
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
