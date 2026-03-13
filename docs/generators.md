# Generators

Options and output files for all RynDesign generators.

**[한국어](./ko/generators.md)**

## Web Platform

### React

```typescript
import { reactGenerator } from '@ryndesign/generator-react';

reactGenerator({
  outDir?: string,
  typescript?: boolean,          // Generate TSX (default: true)
  cssStrategy?: 'css-variables' | 'css-modules',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `tokens.css` | CSS custom properties (light/dark) |
| `tokens.ts` | TypeScript token constants |
| `ThemeProvider.tsx` | React Context-based theme provider + `useTheme` hook |
| `components/{Name}.tsx` | React component (forwardRef, variant props, slots) |
| `components/{Name}.css` | Component styles (variant/size/state classes) |

### Vue

```typescript
import { vueGenerator } from '@ryndesign/generator-vue';

vueGenerator({
  outDir?: string,
  typescript?: boolean,
  cssStrategy?: 'css-variables' | 'css-modules',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `tokens.css` | CSS custom properties |
| `tokens.ts` | TypeScript token constants |
| `useTheme.ts` | Vue 3 composable (reactive theme state, `toggleTheme`) |
| `components/{Name}.vue` | SFC (TypeScript setup, computed classes, scoped styles) |

### Svelte

```typescript
import { svelteGenerator } from '@ryndesign/generator-svelte';

svelteGenerator({
  outDir?: string,
  typescript?: boolean,
  cssStrategy?: 'css-variables' | 'css-modules',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `tokens.css` | CSS custom properties |
| `tokens.ts` | TypeScript token constants |
| `themeStore.ts` | Svelte writable store + `toggleTheme` |
| `components/{Name}.svelte` | Svelte component (exported props, reactive classes) |

### Rails (ViewComponent)

```typescript
import { railsGenerator } from '@ryndesign/generator-rails';

railsGenerator({
  outDir?: string,
  cssStrategy?: 'scss-variables' | 'css-variables',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `_tokens.scss` | SCSS variables + theme-specific variables |
| `_tokens-custom-properties.scss` | CSS custom properties |
| `app/components/{name}_component.rb` | ViewComponent Ruby class |
| `app/components/{name}_component.html.erb` | ERB template |
| `app/components/{name}_component.scss` | Component SCSS (nested variant selectors) |

### CSS/SCSS

```typescript
import { cssGenerator } from '@ryndesign/generator-css';

cssGenerator({
  outDir?: string,
  scss?: boolean,                // Also generate SCSS files
  cssModules?: boolean,
  darkMode?: 'media' | 'class' | 'media+class',
  prefix?: string,               // CSS variable prefix (e.g., 'ds' → --ds-color-primary)
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `tokens.css` | CSS custom properties (:root, .dark, @media) |
| `_tokens.scss` | SCSS variables + `$theme-dark` map + `@mixin apply-theme` (when scss: true) |
| `components/{name}.css` | Component CSS (variant/size/state classes) |
| `components/{name}.scss` | Component SCSS (nested `&--` selectors, when scss: true) |

**Dark Mode Options:**

| Value | Description |
|-------|-------------|
| `'media'` | `@media (prefers-color-scheme: dark)` |
| `'class'` | `[data-theme="dark"]` selector |
| `'media+class'` | Both |

### Tailwind CSS

```typescript
import { tailwindGenerator } from '@ryndesign/generator-tailwind';

tailwindGenerator({
  outDir?: string,
  configFormat?: 'ts' | 'js' | 'cjs',  // Default: 'ts'
  cssPath?: string,                       // Default: 'tokens.css'
  prefix?: string,                        // CSS variable prefix
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `tailwind.tokens.ts` (.js/.cjs) | Tailwind config (`theme.extend` with CSS variable references) |
| `tokens.css` | `@layer base` CSS (custom properties, dark mode) |
| `components/{name}.classes.ts` | Class map + helper function |

**Class Map Example:**

```typescript
// Generated components/button.classes.ts
export const buttonBase = 'bg-[var(--color-primary)] text-[var(--color-white)] rounded-[var(--border-radius-md)]';
export const buttonVariant = {
  primary: 'bg-[var(--component-button-primary-background)]',
  secondary: 'bg-[var(--component-button-secondary-background)]',
} as const;
export const buttonSize = {
  sm: 'px-[var(--spacing-sm)] py-[var(--spacing-xs)] text-[var(--font-size-sm)]',
  md: 'px-[var(--spacing-md)] py-[var(--spacing-sm)] text-[var(--font-size-md)]',
  lg: 'px-[var(--spacing-lg)] py-[var(--spacing-md)] text-[var(--font-size-lg)]',
} as const;
export function getButtonClasses(variant = 'primary', size = 'md', disabled = false): string { ... }
```

---

## iOS Platform

### SwiftUI

```typescript
import { swiftuiGenerator } from '@ryndesign/generator-swiftui';

swiftuiGenerator({
  outDir?: string,
  minimumDeploymentTarget?: string,
  darkMode?: 'dynamic-color' | 'environment',
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `DesignTokens+Color.swift` | `Color` extension (dynamic color support) |
| `DesignTokens+Spacing.swift` | Spacing enum (`CGFloat` constants) |
| `DesignTokens+Typography.swift` | Font extension (`TextStyle` definitions) |
| `components/DS{Name}.swift` | SwiftUI View (variant enum, computed properties, Preview) |

**Dark Mode Options:**

| Value | Description |
|-------|-------------|
| `'dynamic-color'` | Uses `Color(light:dark:)` API |
| `'environment'` | Uses `@Environment(\.colorScheme)` branching |

### UIKit

```typescript
import { uikitGenerator } from '@ryndesign/generator-uikit';

uikitGenerator({
  outDir?: string,
  minimumDeploymentTarget?: string,
  darkMode?: 'dynamic-provider' | 'trait-collection',
  useAutoLayout?: boolean,        // Default: true
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `DesignTokens+Color.swift` | `UIColor` extension (dynamic provider) |
| `DesignTokens+Spacing.swift` | Spacing enum (`CGFloat` constants) |
| `DesignTokens+Typography.swift` | Typography enum (`UIFont` constants) |
| `components/DS{Name}.swift` | UIView subclass (Auto Layout, property observers) |

---

## Android Platform

### Jetpack Compose

```typescript
import { composeGenerator } from '@ryndesign/generator-compose';

composeGenerator({
  outDir?: string,
  packageName?: string,           // Default: 'com.ryndesign.tokens'
  darkMode?: 'system' | 'manual',
  materialVersion?: 2 | 3,
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `DesignColors.kt` | Color objects (LightColors, DarkColors) |
| `DesignSpacing.kt` | Spacing object (`Dp` constants) |
| `DesignTypography.kt` | Typography object (`TextStyle` constants) |
| `DesignTheme.kt` | CompositionLocal provider + theme Composable |
| `components/DS{Name}.kt` | @Composable function (variant enum, Preview) |

### Android View (XML)

```typescript
import { androidViewGenerator } from '@ryndesign/generator-android-view';

androidViewGenerator({
  outDir?: string,
  packageName?: string,           // Default: 'com.ryndesign.components'
  minSdkVersion?: number,
  useViewBinding?: boolean,
})
```

**Output Files:**

| File | Description |
|------|-------------|
| `values/colors.xml` | Color resources (light) |
| `values-night/colors.xml` | Color resources (dark) |
| `values/dimens.xml` | Dimension resources |
| `values/typography_styles.xml` | Text styles |
| `values/attrs_design.xml` | Custom theme attributes |
| `components/DS{Name}.kt` | Custom View class (variant enum, attrs) |
| `layout/view_{name}.xml` | XML layout |
| `values/attrs_{name}.xml` | Custom styleable attributes |

---

## Writing Custom Generators

Implement the `GeneratorPlugin` interface to create a custom generator.

```typescript
import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';

export function myGenerator(options = {}): GeneratorPlugin {
  return {
    name: 'my-generator',
    displayName: 'My Custom Generator',
    platform: 'web',
    outputExtensions: ['.ts', '.css'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      const { tokenSet, helpers } = ctx;
      // tokenSet.tokens: ResolvedToken[]
      // tokenSet.themes: ThemeSet (dark, etc.)
      return [
        { path: 'tokens.ts', content: '...', language: 'typescript' },
      ];
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      const { definition, variantTokens } = comp;
      // variantTokens[variant][size][prop] = ResolvedToken
      return [
        { path: `components/${definition.name}.ts`, content: '...', language: 'typescript' },
      ];
    },
  };
}
```

Usage in config:

```typescript
export default defineConfig({
  generators: [
    myGenerator({ /* options */ }),
  ],
});
```

You can also use `ryndesign eject <generator>` to copy an existing generator's source locally for customization.
