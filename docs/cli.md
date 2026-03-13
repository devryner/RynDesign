# CLI Reference

Complete command reference for `@ryndesign/cli`.

**[한국어](./ko/cli.md)**

## Installation

```bash
npm install -g @ryndesign/cli
# or
pnpm add -g @ryndesign/cli
```

## Commands

| Command | Description |
|---------|-------------|
| `init` | Initialize a new project |
| `generate` | Generate code |
| `validate` | Validate tokens |
| `preview` | Start preview server |
| `add` | Add a component |
| `figma pull` | Pull from Figma |
| `figma push` | Push to Figma |
| `figma diff` | Compare with Figma |
| `eject` | Copy generator source |

---

## `ryndesign init`

Initialize a new project.

```bash
ryndesign init
```

Interactive prompts:
1. Project name
2. Platform selection (React, SwiftUI, Vue, Svelte, Rails, Android, etc.)
3. Template selection (minimal / full)

**Generated Files:**

```
├── ryndesign.config.ts      # Configuration file
├── tokens/
│   └── base.tokens.json     # Base tokens
├── components/
│   └── button.component.json # Sample component
└── generated/               # Code generation output (gitignored)
```

**Additional actions:**
- Adds `generated/` to `.gitignore`
- Adds `generate` and `preview` scripts to `package.json`

---

## `ryndesign generate`

Generate platform-specific code from tokens and components.

```bash
ryndesign generate [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Config file path | Auto-detect |
| `--platform` | `-p` | Generate for specific platform only | All |
| `--watch` | `-w` | Watch for changes and regenerate | false |
| `--dry-run` | | Show results without writing files | false |
| `--clean` | | Clean output directory before generating | false |

```bash
# Generate all
ryndesign generate

# React only
ryndesign generate --platform react

# SwiftUI only
ryndesign generate --platform swiftui

# Watch mode (auto-regenerate on token/component changes)
ryndesign generate --watch

# Dry run (show file list only)
ryndesign generate --dry-run

# Custom config file
ryndesign generate --config ./config/ryndesign.config.ts
```

**Output Structure:**

```
generated/
├── react/
│   ├── tokens.css
│   ├── tokens.ts
│   ├── ThemeProvider.tsx
│   └── components/
│       ├── Button.tsx
│       └── Button.css
├── swiftui/
│   ├── DesignTokens+Color.swift
│   ├── DesignTokens+Spacing.swift
│   ├── DesignTokens+Typography.swift
│   └── components/
│       └── DSButton.swift
└── css/
    ├── tokens.css
    └── components/
        └── button.css
```

---

## `ryndesign validate`

Validate token files.

```bash
ryndesign validate [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Config file path | Auto-detect |
| `--strict` | | Treat warnings as errors | false |

```bash
# Standard validation
ryndesign validate

# Strict mode (for CI)
ryndesign validate --strict
```

**Validation Checks:**

| Check | Level | Description |
|-------|-------|-------------|
| JSON parsing | Error | Syntax errors |
| Circular references | Error | `A → B → A` pattern detection |
| Unresolved aliases | Error | Remaining `{...}` patterns |
| Type mismatch | Error | `$value` type doesn't match `$type` |
| Null values | Error | Resolved token `$value` is null |
| Missing theme overrides | Warning | Non-default theme missing overrides |

---

## `ryndesign preview`

Start the live preview server.

```bash
ryndesign preview [options]
```

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Config file path | Auto-detect |
| `--port` | | Port number | 4400 |

```bash
ryndesign preview
ryndesign preview --port 3000
```

**Features:**
- Browse and select components
- Preview all variant x size combinations in a grid
- Switch between light/dark themes
- View and copy React / SwiftUI code snippets
- Edit tokens in real time (color picker, numeric inputs, etc.)
- WebSocket-based live updates

---

## `ryndesign add`

Add a component definition template.

```bash
ryndesign add <component> [options]
```

| Option | Description | Default |
|--------|-------------|---------|
| `--with-tokens` | Also generate component token file | false |

```bash
# Component definition only
ryndesign add button

# Component + tokens
ryndesign add input --with-tokens
```

**Available Component Templates:**

| Name | Category | Description |
|------|----------|-------------|
| `button` | actions | Button (variant, size, slots) |
| `input` | forms | Text input (focus, error states) |
| `card` | layout | Card container (elevated, outlined, filled) |
| `checkbox` | forms | Checkbox (size variants) |
| `toggle` | forms | Toggle switch |
| `badge` | display | Badge/tag |
| `avatar` | display | Avatar |

---

## `ryndesign figma`

Figma Variables API integration commands. See [figma-integration.md](./figma-integration.md) for a detailed guide.

```bash
ryndesign figma pull [options]      # Pull from Figma
ryndesign figma push [options]      # Push to Figma
ryndesign figma diff [options]      # Compare differences
```

### `figma pull` Options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--config` | `-c` | Config file path | Auto-detect |
| `--output` | `-o` | Output file path | `tokens/figma.tokens.json` |
| `--merge` | | Merge with existing local tokens | false |
| `--strategy` | | Merge strategy | `prefer-remote` |

Merge strategies: `prefer-remote`, `prefer-local`, `remote-only-new`

---

## `ryndesign eject`

Copy a generator's source code locally for customization.

```bash
ryndesign eject <generator>
```

```bash
# Eject React generator
ryndesign eject react
# → Source code copied to ./generators/react/

# Use ejected generator in config
import { myReactGenerator } from './generators/react';
```

---

## Global Options

Available for all commands:

| Option | Description |
|--------|-------------|
| `--help` | Show help |
| `--version` | Show version |
