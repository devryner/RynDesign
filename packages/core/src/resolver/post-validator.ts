import type { ResolvedToken, ThemeSet } from '@ryndesign/plugin-api';

export interface PostValidationIssue {
  severity: 'error' | 'warning';
  path: string;
  message: string;
}

const ALIAS_REGEX = /\{[^}]+\}/;

/**
 * Post-resolution validation layer.
 * Checks that all resolved tokens are valid and complete.
 */
export function postValidate(
  tokens: ResolvedToken[],
  themes: ThemeSet
): PostValidationIssue[] {
  const issues: PostValidationIssue[] = [];

  for (const token of tokens) {
    const tokenPath = token.path.join('.');

    // Check $value is not null/undefined
    if (token.$value == null) {
      issues.push({
        severity: 'error',
        path: tokenPath,
        message: 'Resolved token has null or undefined $value',
      });
      continue;
    }

    // Check $value.type matches declared $type
    if (token.$value.type !== token.$type) {
      issues.push({
        severity: 'error',
        path: tokenPath,
        message: `Type mismatch: declared $type "${token.$type}" but resolved value type is "${token.$value.type}"`,
      });
    }

    // Check for unresolved alias strings in originalValue
    if (hasUnresolvedAlias(token.originalValue)) {
      // This is only a warning if $value was resolved successfully
      issues.push({
        severity: 'warning',
        path: tokenPath,
        message: 'Original value contains alias reference pattern',
      });
    }
  }

  // Theme completeness: warn if non-default themes are missing tokens
  const defaultTokenPaths = new Set(tokens.map(t => t.path.join('.')));
  for (const [themeName, themeData] of Object.entries(themes.themes)) {
    const themeTokenPaths = new Set(themeData.tokens.map(t => t.path.join('.')));
    // We don't require all tokens to be overridden, but warn if theme has tokens not in default
    for (const path of themeTokenPaths) {
      if (!defaultTokenPaths.has(path)) {
        issues.push({
          severity: 'warning',
          path,
          message: `Theme "${themeName}" overrides token "${path}" which is not in the default token set`,
        });
      }
    }
  }

  return issues;
}

function hasUnresolvedAlias(value: unknown): boolean {
  if (typeof value === 'string') {
    return ALIAS_REGEX.test(value);
  }
  if (typeof value === 'object' && value !== null) {
    for (const v of Object.values(value as Record<string, unknown>)) {
      if (hasUnresolvedAlias(v)) return true;
    }
  }
  return false;
}
