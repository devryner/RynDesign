---
"@ryndesign/cli": minor
---

feat: auto-create package.json and run npm install during init

- `ryndesign init` now creates `package.json` with selected generators as devDependencies
- Automatically runs `npm install` (auto-detects pnpm/yarn/bun) after project scaffolding
- Config loader resolves `@ryndesign/*` packages from CLI's own node_modules via jiti alias
- No more "Cannot find module" errors when running `ryndesign generate` after init
