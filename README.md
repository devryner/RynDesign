# RynDesign

A multi-platform design system generator that produces platform-specific code from a single W3C Design Token source.

Define your tokens in JSON following the W3C Design Token spec, and RynDesign automatically generates code for React, SwiftUI, Android, and more.

**[한국어](./README.ko.md)**

## Features

- **Single Source → Multi-Platform**: Generate React (CSS/TSX), SwiftUI (Swift), Android (Compose/XML), and more from one token file
- **Component Definitions**: Declare component structure (props, variants, slots, states) in JSON and generate platform-specific component code
- **Theme Support**: Manage multiple themes (light/dark) with an override-based approach
- **Live Preview**: Preview components in the browser, edit tokens in real time, and view generated code snippets
- **Figma Integration**: Pull/push tokens from/to Figma Variables
- **CLI**: Full CLI with init, generate, validate, preview, add, and more

---

## Quick Start

### 1. Install

```bash
npm install -g @ryndesign/cli
# or
pnpm add -g @ryndesign/cli
```

### 2. Initialize a Project

```bash
mkdir my-design-system && cd my-design-system
ryndesign init
```

Interactive prompts will guide you through:
- Selecting a template (minimal or full)
- Choosing target platforms (React, SwiftUI, etc.)
- Enabling dark mode support

Generated structure:

```
my-design-system/
├── ryndesign.config.ts
├── tokens/
│   └── base.tokens.json
├── components/
│   └── button.component.json
└── generated/          ← Code generation output
```

### 3. Generate Code

```bash
ryndesign generate
```

### 4. Start Preview Server

```bash
ryndesign preview
```

Opens `http://localhost:4400` in your browser:
- Browse and select components
- Preview all variant x size combinations in a grid
- Switch between light/dark themes
- View and copy React / SwiftUI code snippets
- Edit tokens in real time (color picker, numeric inputs, etc.)

---

## Configuration

Create `ryndesign.config.ts` (or `.js`, `.mjs`, `.json`) in your project root.

```typescript
import { defineConfig } from '@ryndesign/cli';
import { reactGenerator } from '@ryndesign/generator-react';
import { swiftuiGenerator } from '@ryndesign/generator-swiftui';

export default defineConfig({
  // Token file paths (glob patterns, required)
  tokens: ['tokens/**/*.tokens.json'],

  // Component definition file paths (glob patterns)
  components: ['components/**/*.component.json'],

  // Output directory
  outDir: 'generated',

  // Theme configuration
  themes: {
    default: 'light',
    dark: { file: 'tokens/dark.tokens.json' },
  },

  // Generator plugins
  generators: [
    reactGenerator({ typescript: true, darkMode: 'media+class' }),
    swiftuiGenerator({ darkMode: 'dynamic-color' }),
  ],

  // Figma integration
  figma: {
    fileKey: 'YOUR_FIGMA_FILE_KEY',
    personalAccessToken: process.env.FIGMA_TOKEN,
  },

  // Preview server
  preview: {
    port: 4400,
    open: true,
  },

  // Pipeline hooks
  hooks: {
    'tokens:resolved': (tokenSet) => {
      console.log(`${tokenSet.tokens.length} tokens resolved`);
    },
    'generate:complete': (files) => {
      console.log(`${files.length} files generated`);
    },
  },
});
```

---

## Token Files

Follows the W3C Design Token spec. `$type` is inherited from group level, and `$value` supports alias references with `{path.to.token}` syntax.

### Supported Types

| Type | Example Value |
|------|--------------|
| `color` | `"#3B82F6"`, `"rgba(0,0,0,0.5)"` |
| `dimension` | `"16px"`, `"1.5rem"` |
| `fontWeight` | `400`, `700` |
| `duration` | `"250ms"` |
| `shadow` | `{ "offsetX": "0px", "offsetY": "4px", "blur": "6px", "spread": "0px", "color": "#00000026" }` |
| `border` | `{ "color": "#E5E7EB", "width": "1px", "style": "solid" }` |
| `gradient` | `{ "type": "linear", "angle": "135deg", "stops": [...] }` |
| `typography` | `{ "fontFamily": "...", "fontSize": "...", "fontWeight": ..., "lineHeight": "..." }` |
| `number` | `1.5`, `0` |
| `fontFamily` | `"Inter, sans-serif"` |

### Basic Example

```json
{
  "color": {
    "$type": "color",
    "primary": { "$value": "#3B82F6", "$description": "Primary brand color" },
    "background": {
      "primary": { "$value": "{color.white}" }
    }
  },
  "spacing": {
    "$type": "dimension",
    "sm": { "$value": "8px" },
    "md": { "$value": "16px" }
  }
}
```

### Alias References

Use `{path.to.token}` syntax to reference other tokens. Multi-level chains are resolved automatically.

```json
{
  "color.background.primary": { "$value": "{color.white}" },
  "color.white": { "$value": "#FFFFFF" }
}
```

### Theme Overrides

Theme files only define the tokens that differ from the default.

```json
{
  "$description": "Dark theme overrides",
  "$extensions": {
    "com.ryndesign.theme": { "name": "dark", "extends": "default" }
  },
  "color": {
    "$type": "color",
    "background": {
      "primary": { "$value": "{color.gray.900}" }
    },
    "text": {
      "primary": { "$value": "{color.gray.50}" }
    }
  }
}
```

---

## Component Definitions

Components are defined as JSON files with a platform-independent structure.

```json
{
  "name": "Button",
  "category": "actions",
  "props": {
    "label": { "type": "string", "required": true },
    "disabled": { "type": "boolean", "default": false },
    "onPress": { "type": "callback" }
  },
  "variants": {
    "variant": {
      "values": ["primary", "secondary", "outline", "ghost"],
      "default": "primary"
    },
    "size": {
      "values": ["sm", "md", "lg"],
      "default": "md"
    }
  },
  "slots": {
    "leadingIcon": { "optional": true },
    "trailingIcon": { "optional": true }
  },
  "tokenMapping": {
    "background": "component.button.{variant}.background",
    "textColor": "component.button.{variant}.text",
    "paddingX": "component.button.{size}.paddingX",
    "fontSize": "component.button.{size}.fontSize"
  },
  "states": {
    "hover": {
      "tokenOverrides": {
        "background": "component.button.{variant}.hover.background"
      }
    },
    "disabled": {
      "tokenOverrides": {
        "background": "component.button.disabled.background"
      }
    }
  }
}
```

### Field Reference

| Field | Description |
|-------|-------------|
| `name` | Component name (PascalCase) |
| `category` | Classification (actions, forms, layout, display, etc.) |
| `props` | Component properties. `type`: string, boolean, number, callback |
| `variants` | Variant axis definitions. All combinations (cartesian product) are resolved automatically |
| `slots` | Child element slot definitions |
| `tokenMapping` | Token path mapping. Uses `{variant}` and `{size}` placeholders |
| `states` | Per-state token overrides (hover, pressed, disabled, etc.) |

---

## CLI Commands

### `ryndesign init`

Initialize a new project.

```bash
ryndesign init
```

### `ryndesign generate`

Generate platform-specific code from tokens and components.

```bash
ryndesign generate [options]

Options:
  --config, -c <path>     Config file path
  --platform, -p <name>   Generate for a specific platform only (e.g., react, swiftui)
  --watch, -w             Watch for file changes and regenerate
  --dry-run               Show what would be generated without writing files
  --clean                 Clean output directory before generating
```

```bash
# Generate React only
ryndesign generate --platform react

# Watch mode
ryndesign generate --watch

# Dry run
ryndesign generate --dry-run
```

### `ryndesign validate`

Validate token files.

```bash
ryndesign validate [options]

Options:
  --config, -c <path>     Config file path
  --strict                Treat warnings as errors
```

### `ryndesign preview`

Start the live preview server.

```bash
ryndesign preview [options]

Options:
  --config, -c <path>     Config file path
  --port <number>         Port number (default: 4400)
```

### `ryndesign add <component>`

Add a component definition template.

```bash
ryndesign add button
ryndesign add input --with-tokens

Options:
  --with-tokens           Also generate component token file
```

Available components: `button`, `input`, `card`, `checkbox`, `toggle`, `badge`, `avatar`

### `ryndesign figma <subcommand>`

Sync with Figma Variables.

```bash
ryndesign figma pull          # Pull tokens from Figma
ryndesign figma push          # Push tokens to Figma
ryndesign figma diff          # Compare Figma vs local tokens
```

### `ryndesign eject <generator>`

Copy a generator's source code locally for customization.

```bash
ryndesign eject react         # Copies React generator to ./generators/react/
```

---

## Generators

10 platform-specific generators are available.

| Generator | Platform | Package |
|-----------|----------|---------|
| React (TSX + CSS) | Web | `@ryndesign/generator-react` |
| Vue (SFC) | Web | `@ryndesign/generator-vue` |
| Svelte | Web | `@ryndesign/generator-svelte` |
| Rails (ViewComponent) | Web | `@ryndesign/generator-rails` |
| CSS/SCSS | Web | `@ryndesign/generator-css` |
| Tailwind CSS | Web | `@ryndesign/generator-tailwind` |
| SwiftUI | iOS | `@ryndesign/generator-swiftui` |
| UIKit | iOS | `@ryndesign/generator-uikit` |
| Jetpack Compose | Android | `@ryndesign/generator-compose` |
| Android View (XML) | Android | `@ryndesign/generator-android-view` |

### Usage Example

```typescript
import { reactGenerator } from '@ryndesign/generator-react';
import { swiftuiGenerator } from '@ryndesign/generator-swiftui';
import { cssGenerator } from '@ryndesign/generator-css';
import { tailwindGenerator } from '@ryndesign/generator-tailwind';

export default defineConfig({
  generators: [
    reactGenerator({ typescript: true, darkMode: 'media+class' }),
    swiftuiGenerator({ darkMode: 'dynamic-color' }),
    cssGenerator({ scss: true, prefix: 'ds' }),
    tailwindGenerator({ configFormat: 'ts' }),
  ],
});
```

See [docs/generators.md](./docs/generators.md) for detailed options and output files for each generator.

---

## Pipeline

```
Token JSON Files
    ↓
[Read & Merge] → Raw Token Tree
    ↓
[Type Inheritance] → $type propagates from parent to children
    ↓
[Cycle Detection] → Error reporting
    ↓
[Alias Resolution] → {references} → resolved values
    ↓
[IR Build] → ResolvedToken[] (with referencedBy)
    ↓
[Theme Resolution] → ThemeSet (overrides applied)
    ↓
[Validation] → Unresolved aliases, type mismatches, etc.
    ↓
[Component Resolution] → All variant × size token bindings
    ↓
[Code Generation] → Platform-specific file output
```

---

## Packages

| Package | Description |
|---------|-------------|
| `@ryndesign/cli` | CLI tool (init, generate, validate, preview, add, figma, eject) |
| `@ryndesign/core` | Token parsing, alias resolution, component loading, validation |
| `@ryndesign/plugin-api` | Generator plugin interface and type definitions |
| `@ryndesign/generator-react` | React (TSX + CSS) code generation |
| `@ryndesign/generator-vue` | Vue (SFC) code generation |
| `@ryndesign/generator-svelte` | Svelte code generation |
| `@ryndesign/generator-rails` | Rails (ViewComponent + SCSS) code generation |
| `@ryndesign/generator-swiftui` | SwiftUI (Swift) code generation |
| `@ryndesign/generator-uikit` | UIKit (Swift) code generation |
| `@ryndesign/generator-compose` | Jetpack Compose (Kotlin) code generation |
| `@ryndesign/generator-android-view` | Android View (Kotlin + XML) code generation |
| `@ryndesign/generator-css` | CSS/SCSS token code generation |
| `@ryndesign/generator-tailwind` | Tailwind CSS config generation |
| `@ryndesign/figma` | Figma Variables API integration |
| `@ryndesign/preview` | Live preview server (Vite + WebSocket) |

---

## Documentation

| Document | English | 한국어 |
|----------|---------|--------|
| Configuration Reference | [configuration.md](./docs/configuration.md) | [configuration.md](./docs/ko/configuration.md) |
| Token Spec | [token-spec.md](./docs/token-spec.md) | [token-spec.md](./docs/ko/token-spec.md) |
| Component Spec | [component-spec.md](./docs/component-spec.md) | [component-spec.md](./docs/ko/component-spec.md) |
| Generators | [generators.md](./docs/generators.md) | [generators.md](./docs/ko/generators.md) |
| CLI Reference | [cli.md](./docs/cli.md) | [cli.md](./docs/ko/cli.md) |
| Figma Integration | [figma-integration.md](./docs/figma-integration.md) | [figma-integration.md](./docs/ko/figma-integration.md) |

---

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Development mode (watch)
pnpm dev
```

## License

MIT
