import type { ResolvedTokenSet, ResolvedToken } from '@ryndesign/plugin-api';
import type { ThemeConfig } from './resolver/theme-resolver.js';
import { readAndMergeTokenFiles } from './parser/reader.js';
import { validateTree } from './parser/validator.js';
import { inheritTypes } from './resolver/type-inheritor.js';
import { resolveAliases, buildReferenceMap } from './resolver/alias-resolver.js';
import { resolveThemes } from './resolver/theme-resolver.js';
import { buildTokensFromTree, buildGroupsFromTree } from './ir/builder.js';
import { postValidate, type PostValidationIssue } from './resolver/post-validator.js';

export interface BuildConfig {
  tokens: string[];
  basePath?: string;
  themes?: ThemeConfig;
  name?: string;
  description?: string;
}

export interface BuildResult extends ResolvedTokenSet {
  validationIssues?: PostValidationIssue[];
}

export async function buildTokenSet(config: BuildConfig): Promise<ResolvedTokenSet> {
  // 1. Read and merge token files
  const rawTree = await readAndMergeTokenFiles(config.tokens, config.basePath);

  // 2. Validate
  const validated = validateTree(rawTree);

  // 3. Inherit $type from parent groups
  const withTypes = inheritTypes(validated);

  // 4. Build reference map (before alias resolution, from original values)
  const referenceMap = buildReferenceMap(withTypes);

  // 5. Resolve aliases
  const resolved = resolveAliases(withTypes);

  // 6. Build tokens and groups from resolved tree
  const tokens = buildTokensFromTree(resolved);
  const groups = buildGroupsFromTree(resolved);

  // 7. Populate referencedBy from the reference map
  populateReferencedBy(tokens, referenceMap);

  // 8. Resolve themes (dark mode etc.)
  const themes = await resolveThemes(
    withTypes,
    config.themes,
    buildTokensFromTree
  );

  // 9. Post-validation
  const issues = postValidate(tokens, themes);

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

/**
 * Populate referencedBy on tokens using the reference map.
 * referenceMap: Map<referencedPath, Set<referencingPath>>
 */
function populateReferencedBy(
  tokens: ResolvedToken[],
  referenceMap: Map<string, Set<string>>
): void {
  for (const token of tokens) {
    const tokenPath = token.path.join('.');
    const referencers = referenceMap.get(tokenPath);
    if (referencers) {
      token.referencedBy = Array.from(referencers);
    }
  }
}
