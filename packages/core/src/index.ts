// Pipeline
export { buildTokenSet, type BuildConfig } from './pipeline.js';

// Parser
export { readTokenFile, readAndMergeTokenFiles, deepMerge, type RawTokenTree } from './parser/reader.js';
export { validateTree } from './parser/validator.js';
export { TokenParseError, TokenValidationError, CircularReferenceError, type ValidationIssue } from './parser/errors.js';

// Resolver
export { resolveAliases } from './resolver/alias-resolver.js';
export { inheritTypes } from './resolver/type-inheritor.js';
export { resolveThemes, type ThemeConfig } from './resolver/theme-resolver.js';
export { buildDependencyGraph, topologicalSort, extractReferences } from './resolver/cycle-detector.js';

// IR
export { buildTokensFromTree, buildGroupsFromTree } from './ir/builder.js';
export type * from './ir/types.js';

// Re-export plugin-api types for convenience
export type {
  ResolvedTokenSet,
  ResolvedToken,
  ResolvedValue,
  TokenType,
  TokenGroup,
  ThemeSet,
  ThemeOverrides,
  TokenSetMetadata,
  GeneratorPlugin,
  GeneratorContext,
  GeneratedFile,
  GeneratorConfig,
  GeneratorHelpers,
  PreviewAdapter,
  ComponentDefinition,
  ResolvedComponent,
  RynDesignConfig,
} from '@ryndesign/plugin-api';
