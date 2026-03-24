# Configuration Reference

Full spec for the RynDesign project configuration file.

**[한국어](./ko/configuration.md)**

## Config File Location

Create one of the following files in your project root (in priority order):

1. `ryndesign.config.ts`
2. `ryndesign.config.js`
3. `ryndesign.config.mjs`
4. `ryndesign.config.json`

## Full Interface

```typescript
import { defineConfig } from '@ryndesign/cli';

export default defineConfig({
  tokens: string[];              // Required
  components?: string[];         // Optional
  outDir?: string;               // Optional (default: 'generated')
  themes?: ThemesConfig;         // Optional
  generators?: GeneratorPlugin[];// Optional
  figma?: FigmaConfig;           // Optional
  preview?: PreviewConfig;       // Optional
  hooks?: HooksConfig;           // Optional
});
```

## Field Details

### `tokens` (required)

Array of glob patterns for token JSON files.

```typescript
tokens: ['tokens/**/*.tokens.json']
```

- At least one pattern is required
- Must point to W3C Design Token format JSON files
- Multiple matched files are deep-merged

### `components`

Array of glob patterns for component definition JSON files.

```typescript
components: ['components/**/*.component.json']
```

### `outDir`

Code generation output directory. Default: `'generated'`

```typescript
outDir: 'src/generated'
```

Each generator's output goes under `{outDir}/{generatorName}/`.

### `themes`

Theme configuration. `default` is the default theme name; other keys point to theme override files.

```typescript
themes: {
  default: 'light',                              // Default theme name
  dark: { file: 'tokens/dark.tokens.json' },     // Theme override file
  highContrast: { file: 'tokens/high-contrast.tokens.json' },
}
```

**ThemeConfig:**

```typescript
interface ThemeConfig {
  file: string;  // Path to theme override JSON file
}
```

Theme override files only need to define the tokens that differ. Everything else inherits the default values.

### `generators`

Array of generator plugins to use.

```typescript
import reactGenerator from '@ryndesign/generator-react';
import swiftuiGenerator from '@ryndesign/generator-swiftui';
import cssGenerator from '@ryndesign/generator-css';

// ...
generators: [
  reactGenerator({ typescript: true, darkMode: 'media+class' }),
  swiftuiGenerator({ darkMode: 'dynamic-color' }),
  cssGenerator({ scss: true, prefix: 'ds' }),
]
```

See [generators.md](./generators.md) for all available generators.

### `figma`

Figma Variables API integration settings.

```typescript
figma: {
  fileKey: 'FIGMA_FILE_KEY',                    // Figma file key
  personalAccessToken: process.env.FIGMA_TOKEN, // Recommended: read from env var
  modeMapping: {                                 // Figma mode → local file mapping
    'Light': 'tokens/base.tokens.json',
    'Dark': 'tokens/dark.tokens.json',
  },
}
```

**FigmaConfig:**

```typescript
interface FigmaConfig {
  fileKey?: string;
  personalAccessToken?: string;
  modeMapping?: Record<string, string>;  // Figma mode name → local file path
}
```

- `fileKey`: The `figma.com/file/{fileKey}/...` part of the Figma file URL
- `personalAccessToken`: Generate from Figma > Settings > Personal Access Tokens
- `modeMapping`: Maps Figma Variable Modes to local token files

### `preview`

Preview server settings.

```typescript
preview: {
  port: 4400,    // Port number (default: 4400)
  open: true,    // Auto-open browser on start
}
```

**PreviewConfig:**

```typescript
interface PreviewConfig {
  port?: number;
  open?: boolean;
}
```

### `hooks`

Pipeline event hooks.

```typescript
hooks: {
  'tokens:resolved': (tokenSet) => {
    // Runs after token resolution
    console.log(`${tokenSet.tokens.length} tokens resolved`);
  },
  'generate:complete': (files) => {
    // Runs after code generation
    console.log(`${files.length} files generated`);
  },
}
```

| Hook Name | Parameter | Timing |
|-----------|-----------|--------|
| `tokens:resolved` | `ResolvedTokenSet` | After token resolution |
| `generate:complete` | `GeneratedFile[]` | After code generation |

## Full Example

```typescript
import { defineConfig } from '@ryndesign/cli';
import reactGenerator from '@ryndesign/generator-react';
import swiftuiGenerator from '@ryndesign/generator-swiftui';
import cssGenerator from '@ryndesign/generator-css';
import tailwindGenerator from '@ryndesign/generator-tailwind';

export default defineConfig({
  tokens: ['tokens/**/*.tokens.json'],
  components: ['components/**/*.component.json'],
  outDir: 'generated',

  themes: {
    default: 'light',
    dark: { file: 'tokens/dark.tokens.json' },
  },

  generators: [
    reactGenerator({
      typescript: true,
      darkMode: 'media+class',
      cssStrategy: 'css-variables',
    }),
    swiftuiGenerator({
      darkMode: 'dynamic-color',
    }),
    cssGenerator({
      scss: true,
      prefix: 'ds',
      darkMode: 'media+class',
    }),
    tailwindGenerator({
      configFormat: 'ts',
      prefix: 'ds',
    }),
  ],

  figma: {
    fileKey: process.env.FIGMA_FILE_KEY,
    personalAccessToken: process.env.FIGMA_TOKEN,
    modeMapping: {
      'Light': 'tokens/base.tokens.json',
      'Dark': 'tokens/dark.tokens.json',
    },
  },

  preview: {
    port: 4400,
    open: true,
  },

  hooks: {
    'tokens:resolved': (tokenSet) => {
      console.log(`Resolved ${tokenSet.tokens.length} tokens`);
    },
  },
});
```
