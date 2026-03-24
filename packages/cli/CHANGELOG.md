# @ryndesign/cli

## 0.2.5

### Patch Changes

- Fix CLI init to bundle templates/components in npm package, add --dark-mode option and non-interactive mode, default to full template. Fix preview WebSocket conflict with Vite HMR and add port-in-use detection.

## 0.2.1

### Patch Changes

- 04e032e: fix: add missing gray scale values to minimal template for dark theme compatibility

## 0.2.0

### Minor Changes

- 13cc1ce: feat: auto-create package.json and run npm install during init
  - `ryndesign init` now creates `package.json` with selected generators as devDependencies
  - Automatically runs `npm install` (auto-detects pnpm/yarn/bun) after project scaffolding
  - Config loader resolves `@ryndesign/*` packages from CLI's own node_modules via jiti alias
  - No more "Cannot find module" errors when running `ryndesign generate` after init

## 0.1.3

### Patch Changes

- 9b91911: Fix preview command error handling to show actual errors instead of always showing "not found"

## 0.1.2

### Patch Changes

- 04e3740: Add short flags and missing CLI options: --platform/-p, --config/-c, --watch/-w, --output/-o

## 0.1.1

### Patch Changes

- 6f71be7: Initial release preparation
- Updated dependencies [6f71be7]
  - @ryndesign/plugin-api@0.1.1
  - @ryndesign/core@0.1.1
