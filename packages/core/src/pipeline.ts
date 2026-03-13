import type { ResolvedTokenSet, ResolvedToken } from '@ryndesign/plugin-api';
import type { ThemeConfig } from './resolver/theme-resolver.js';
import { readAndMergeTokenFiles } from './parser/reader.js';
import { validateTree } from './parser/validator.js';
import { inheritTypes } from './resolver/type-inheritor.js';
import { resolveAliases } from './resolver/alias-resolver.js';
import { resolveThemes } from './resolver/theme-resolver.js';
import { buildTokensFromTree, buildGroupsFromTree } from './ir/builder.js';

export interface BuildConfig {
  tokens: string[];
  basePath?: string;
  themes?: ThemeConfig;
  name?: string;
  description?: string;
}

export async function buildTokenSet(config: BuildConfig): Promise<ResolvedTokenSet> {
  // 1. Read and merge token files
  const rawTree = await readAndMergeTokenFiles(config.tokens, config.basePath);

  // 2. Validate
  const validated = validateTree(rawTree);

  // 3. Inherit $type from parent groups
  const withTypes = inheritTypes(validated);

  // 4. Resolve aliases
  const resolved = resolveAliases(withTypes);

  // 5. Build tokens and groups from resolved tree
  const tokens = buildTokensFromTree(resolved);
  const groups = buildGroupsFromTree(resolved);

  // 6. Resolve themes (dark mode etc.)
  const themes = await resolveThemes(
    withTypes, // Pass the type-inherited but not alias-resolved tree for theme merging
    config.themes,
    buildTokensFromTree
  );

  return {
    metadata: {
      name: config.name,
      description: config.description,
    },
    tokens,
    groups,
    themes,
  };
}
