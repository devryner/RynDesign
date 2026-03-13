import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import type { ComponentDefinition, ResolvedComponent, ResolvedToken } from '@ryndesign/plugin-api';
import type { ResolvedTokenSet } from '@ryndesign/plugin-api';
import { TokenParseError } from './parser/errors.js';

export async function loadComponents(
  patterns: string[],
  basePath: string = process.cwd()
): Promise<ComponentDefinition[]> {
  const files = await fg(patterns, { cwd: basePath, absolute: true });
  files.sort();

  const components: ComponentDefinition[] = [];
  for (const file of files) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      const def = JSON.parse(content) as ComponentDefinition;
      components.push(def);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new TokenParseError(`Invalid JSON in component file: ${file}`, file);
      }
      throw err;
    }
  }

  return components;
}

export function resolveComponent(
  definition: ComponentDefinition,
  tokenSet: ResolvedTokenSet
): ResolvedComponent {
  const resolvedTokens: Record<string, ResolvedToken> = {};
  const resolvedStateTokens: Record<string, Record<string, ResolvedToken>> = {};

  // Resolve token mappings with default variant/size
  const defaultVariant = definition.variants.variant?.default ?? 'primary';
  const defaultSize = definition.variants.size?.default ?? 'md';

  for (const [prop, tokenPath] of Object.entries(definition.tokenMapping)) {
    const resolved = resolveTokenPath(tokenPath, tokenSet, {
      variant: defaultVariant,
      size: defaultSize,
    });
    if (resolved) {
      resolvedTokens[prop] = resolved;
    }
  }

  // Resolve state token overrides
  for (const [state, stateConfig] of Object.entries(definition.states)) {
    resolvedStateTokens[state] = {};
    for (const [prop, tokenPath] of Object.entries(stateConfig.tokenOverrides)) {
      const resolved = resolveTokenPath(tokenPath, tokenSet, {
        variant: defaultVariant,
        size: defaultSize,
      });
      if (resolved) {
        resolvedStateTokens[state][prop] = resolved;
      }
    }
  }

  return {
    definition,
    resolvedTokens,
    resolvedStateTokens,
  };
}

function resolveTokenPath(
  tokenPath: string,
  tokenSet: ResolvedTokenSet,
  defaults: Record<string, string>
): ResolvedToken | undefined {
  // Replace {variant}, {size} etc. with default values
  let resolved = tokenPath;
  for (const [key, value] of Object.entries(defaults)) {
    resolved = resolved.replace(`{${key}}`, value);
  }

  return tokenSet.tokens.find(t => t.path.join('.') === resolved);
}
