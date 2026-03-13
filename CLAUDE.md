# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Is

RynDesign is a **multi-platform design system generator**: a single W3C Design Token source produces platform-specific code (React, SwiftUI, Vue, Svelte, Rails, UIKit, Compose, Android View, CSS/SCSS, Tailwind). It's a pnpm monorepo with 15 packages orchestrated by Turborepo.

## Commands

```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages (turbo, respects dependency order)
pnpm test                 # Run all tests (turbo, builds first)
pnpm lint                 # Lint all packages

# Run a single package's tests
npx vitest run packages/core/src/__tests__/pipeline.test.ts

# Run all tests in one package
npx vitest run packages/generator-react/

# Build a single package (must build deps first)
pnpm --filter @ryndesign/core build

# Watch mode for a single package
pnpm --filter @ryndesign/core dev
```

Tests require a prior build (`turbo.json` has `"test": { "dependsOn": ["build"] }`). The root `vitest.config.ts` includes `packages/*/src/**/*.test.ts`. Tests use template/component fixtures from `/templates/` and `/components/` at the repo root.

## Architecture

### Package Dependency Graph

```
plugin-api  (types only: no runtime deps)
    ↓
   core     (token pipeline, component resolution)
    ↓
generators (react, swiftui, vue, svelte, rails, uikit, compose, android-view, css, tailwind)
    ↓
cli + preview + figma  (user-facing tools)
```

`plugin-api` is the shared type system. Every other package depends on it. `core` depends only on `plugin-api`. Generators depend on `core` + `plugin-api`. This layering is strict.

### Token Pipeline (core)

The core pipeline in `packages/core/src/pipeline.ts` (`buildTokenSet()`) runs these steps in order:

1. **Read & merge** — `readAndMergeTokenFiles()` glob-matches JSON token files, deep-merges them
2. **Validate** — `validateTree()` checks structural correctness
3. **Inherit types** — `inheritTypes()` propagates `$type` from parent groups to children
4. **Build reference map** — `buildReferenceMap()` captures alias relationships before resolution
5. **Resolve aliases** — `resolveAliases()` topologically sorts and resolves `{path.to.token}` references
6. **Build IR** — `buildTokensFromTree()` converts raw tree to `ResolvedToken[]` with parsed typed values
7. **Populate referencedBy** — reverse reference map fills `referencedBy` on each token
8. **Resolve themes** — `resolveThemes()` merges theme override files on the pre-aliased tree
9. **Post-validate** — `postValidate()` checks for null values, type mismatches, unresolved aliases

The final output is `ResolvedTokenSet`: `{ metadata, tokens: ResolvedToken[], groups: TokenGroup[], themes: ThemeSet }`.

### Component System

Component definitions are JSON files (`/components/*.component.json`) with `tokenMapping` that uses `{variant}` and `{size}` placeholders. `resolveComponent()` in `packages/core/src/component-loader.ts` resolves these against the token set, producing:
- `resolvedTokens` — default variant/size combination
- `resolvedStateTokens` — per-state (hover, disabled) overrides
- `variantTokens` — full cartesian product: `variantTokens[variant][size][prop] = ResolvedToken`

### Generator Plugin Interface

All generators implement `GeneratorPlugin` from `plugin-api/src/generator.ts`:
- `generateTokens(ctx)` — produces token files (CSS vars, Swift extensions, etc.)
- `generateComponent(comp, ctx)` — produces component files from a `ResolvedComponent`
- `getPreviewAdapter?()` — optional, for preview rendering

`GeneratorContext` includes `tokenSet`, `config`, `helpers`, and `components` (resolved components array).

### Preview Server

`packages/preview/` runs an HTTP server with Vite middleware for the React SPA client (`client/src/`). Communication is bidirectional via WebSocket:
- Server watches token/component files and broadcasts `rebuild-complete`
- Client sends `token-update` and `theme-change` messages
- REST endpoints: `/api/tokens`, `/api/components`, `/api/snippets?platform=react&component=Button`

### CLI

`packages/cli/` uses `citty` for command routing and `@clack/prompts` for interactive UIs. Config loading (`src/config.ts`) supports `.ts`, `.js`, `.mjs`, `.json` via `jiti`.

## Key Type Definitions

- `ResolvedToken` — `{ path: string[], name, $type: TokenType, $value: ResolvedValue, referencedBy: string[], ... }`
- `ResolvedValue` — discriminated union: `ColorValue | DimensionValue | FontWeightValue | ...` (each has `type` field)
- `ResolvedComponent` — `{ definition, resolvedTokens, resolvedStateTokens, variantTokens }`
- `RynDesignConfig` — `{ tokens: string[], components?, generators?, themes?, outDir?, ... }`

All shared types live in `packages/plugin-api/src/`. Core re-exports them for convenience.

## Conventions

- TypeScript strict mode, ES2022 target, ESM-first (also builds CJS via tsup)
- Use `type` imports (`@typescript-eslint/consistent-type-imports` is enforced)
- Each package has its own `tsup.config.ts` for bundling and `tsconfig.json` extending `../../tsconfig.base.json`
- Token template fixtures in `/templates/`, component fixtures in `/components/` — tests reference these via `path.resolve(__dirname, '../../../../templates')`
- All `.js` extension imports in source (e.g., `./pipeline.js`) — required by ESM resolution even though source is `.ts`

## Documentation

Detailed docs are in `/docs/`:
- `configuration.md` — Full config file spec (`ryndesign.config.ts`)
- `token-spec.md` — W3C Design Token format, supported types, aliases, themes
- `component-spec.md` — Component definition JSON spec (props, variants, tokenMapping, states)
- `generators.md` — All 10 generators with options, output files, and custom generator authoring
- `cli.md` — Complete CLI command reference
- `figma-integration.md` — Figma pull/push/diff, merge strategies, workflows

## Figma Integration

`packages/figma/` provides bidirectional sync with Figma Variables API:
- **pull**: Fetches Figma Variables → converts to W3C tokens → supports `--merge` with 3 strategies (`prefer-remote`, `prefer-local`, `remote-only-new`)
- **push**: Uploads local tokens → creates/updates Figma Variables with mode support
- **diff**: Compares local tokens vs Figma Variables, reports added/modified/removed
