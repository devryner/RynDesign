# Figma Integration

Guide for bidirectional sync between RynDesign and the Figma Variables API.

**[한국어](./ko/figma-integration.md)**

## Prerequisites

### 1. Figma Personal Access Token

1. Figma app > Settings > Personal Access Tokens
2. Click "Generate new token"
3. Required scopes: `file_variables:read`, `file_variables:write`
4. Save as environment variable:

```bash
export FIGMA_TOKEN=figd_xxxxx
```

### 2. Figma File Key

Extract from the Figma file URL:

```
https://www.figma.com/file/AbCdEfGhIjKl/Design-System
                              ^^^^^^^^^^^^
                              This part is the fileKey
```

### 3. Configuration

```typescript
// ryndesign.config.ts
export default defineConfig({
  figma: {
    fileKey: process.env.FIGMA_FILE_KEY,
    personalAccessToken: process.env.FIGMA_TOKEN,
    modeMapping: {
      'Light': 'tokens/base.tokens.json',
      'Dark': 'tokens/dark.tokens.json',
    },
  },
});
```

## Commands

### `figma pull` — Pull Tokens from Figma

Converts Figma Variables to W3C Design Token format and saves locally.

```bash
ryndesign figma pull
```

**Options:**

| Option | Description |
|--------|-------------|
| `--config, -c <path>` | Config file path |
| `--output, -o <path>` | Output file path (default: `tokens/figma.tokens.json`) |
| `--merge` | Merge with existing local tokens |
| `--strategy <name>` | Merge strategy (default: `prefer-remote`) |

**Merge Strategies:**

| Strategy | Description |
|----------|-------------|
| `prefer-remote` | Figma values win on conflict (default) |
| `prefer-local` | Local values win on conflict |
| `remote-only-new` | Only add new tokens from Figma, keep existing |

```bash
# Basic pull (overwrite with Figma values)
ryndesign figma pull

# Merge with existing tokens (Figma wins)
ryndesign figma pull --merge

# Merge keeping local values
ryndesign figma pull --merge --strategy prefer-local

# Only add new tokens
ryndesign figma pull --merge --strategy remote-only-new
```

**Mode Mapping:**

When `modeMapping` is configured, Figma Variable modes are saved to different files.

```typescript
figma: {
  modeMapping: {
    'Light': 'tokens/base.tokens.json',    // Light mode → base tokens
    'Dark': 'tokens/dark.tokens.json',     // Dark mode → dark theme overrides
  },
}
```

### `figma push` — Push Tokens to Figma

Uploads local tokens as Figma Variables.

```bash
ryndesign figma push
```

**Behavior:**
- Builds local tokens into `ResolvedTokenSet`
- Creates/updates Figma Variables via the API
- Sets mode-specific values when modes are configured

### `figma diff` — Compare Differences

Shows differences between local tokens and Figma Variables.

```bash
ryndesign figma diff
```

**Example Output:**

```
Added (3):
  + color.accent.new      #8B5CF6
  + spacing.2xs           2px
  + fontSize.5xl          48px

Modified (2):
  ~ color.primary         #3B82F6 → #2563EB
  ~ spacing.lg            24px → 28px

Removed (1):
  - color.deprecated      (exists locally, not in Figma)
```

## Figma Variable → Token Conversion

| Figma Variable Type | Token `$type` |
|---------------------|---------------|
| `COLOR` | `color` |
| `FLOAT` | `number` or `dimension` (context-dependent) |
| `STRING` | (supported, stored as text value) |
| `BOOLEAN` | (supported, stored as boolean value) |

**Naming Conversion:**

Figma Variable name `/` is converted to token path `.`:

```
Figma: color/primary/500     →  Token: color.primary.500
Figma: spacing/medium        →  Token: spacing.medium
```

## Workflow Examples

### Designer → Developer (Pull Workflow)

```bash
# 1. Pull latest variables from Figma
ryndesign figma pull --merge

# 2. Review changes
git diff tokens/

# 3. Regenerate code
ryndesign generate

# 4. Preview
ryndesign preview

# 5. Commit
git add tokens/ generated/
git commit -m "chore: sync tokens from Figma"
```

### Developer → Designer (Push Workflow)

```bash
# 1. Edit tokens locally
# (edit tokens/base.tokens.json)

# 2. Validate
ryndesign validate

# 3. Push to Figma
ryndesign figma push

# 4. Verify
ryndesign figma diff
```

### CI/CD Integration

```yaml
# .github/workflows/figma-sync.yml
name: Figma Sync Check
on:
  pull_request:
    paths: ['tokens/**']

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm ryndesign figma diff
        env:
          FIGMA_TOKEN: ${{ secrets.FIGMA_TOKEN }}
          FIGMA_FILE_KEY: ${{ secrets.FIGMA_FILE_KEY }}
```
