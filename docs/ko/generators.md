# 제너레이터

RynDesign이 제공하는 모든 제너레이터의 옵션과 생성 파일 목록입니다.

## 웹 플랫폼

### React

```typescript
import reactGenerator from '@ryndesign/generator-react';

reactGenerator({
  outDir?: string,
  typescript?: boolean,          // TSX 생성 (기본: true)
  cssStrategy?: 'css-variables' | 'css-modules',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `tokens.css` | CSS 커스텀 프로퍼티 (라이트/다크) |
| `tokens.ts` | TypeScript 토큰 상수 객체 |
| `ThemeProvider.tsx` | React Context 기반 테마 프로바이더 + `useTheme` 훅 |
| `components/{Name}.tsx` | React 컴포넌트 (forwardRef, variant props, slots) |
| `components/{Name}.css` | 컴포넌트 스타일 (variant/size/state 클래스) |

### Vue

```typescript
import vueGenerator from '@ryndesign/generator-vue';

vueGenerator({
  outDir?: string,
  typescript?: boolean,
  cssStrategy?: 'css-variables' | 'css-modules',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `tokens.css` | CSS 커스텀 프로퍼티 |
| `tokens.ts` | TypeScript 토큰 상수 |
| `useTheme.ts` | Vue 3 컴포저블 (reactive 테마 상태, `toggleTheme`) |
| `components/{Name}.vue` | SFC (TypeScript setup, computed classes, scoped styles) |

### Svelte

```typescript
import svelteGenerator from '@ryndesign/generator-svelte';

svelteGenerator({
  outDir?: string,
  typescript?: boolean,
  cssStrategy?: 'css-variables' | 'css-modules',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `tokens.css` | CSS 커스텀 프로퍼티 |
| `tokens.ts` | TypeScript 토큰 상수 |
| `themeStore.ts` | Svelte writable 스토어 + `toggleTheme` |
| `components/{Name}.svelte` | Svelte 컴포넌트 (exported props, reactive classes) |

### Rails (ViewComponent)

```typescript
import railsGenerator from '@ryndesign/generator-rails';

railsGenerator({
  outDir?: string,
  cssStrategy?: 'scss-variables' | 'css-variables',
  darkMode?: 'media' | 'class' | 'media+class',
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `_tokens.scss` | SCSS 변수 + 테마별 변수 |
| `_tokens-custom-properties.scss` | CSS 커스텀 프로퍼티 |
| `app/components/{name}_component.rb` | ViewComponent Ruby 클래스 |
| `app/components/{name}_component.html.erb` | ERB 템플릿 |
| `app/components/{name}_component.scss` | 컴포넌트 SCSS (nested variant 셀렉터) |

### CSS/SCSS

```typescript
import cssGenerator from '@ryndesign/generator-css';

cssGenerator({
  outDir?: string,
  scss?: boolean,                // SCSS 파일 추가 생성
  cssModules?: boolean,
  darkMode?: 'media' | 'class' | 'media+class',
  prefix?: string,               // CSS 변수 접두사 (예: 'ds' → --ds-color-primary)
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `tokens.css` | CSS 커스텀 프로퍼티 (:root, .dark, @media) |
| `_tokens.scss` | SCSS 변수 + `$theme-dark` 맵 + `@mixin apply-theme` (scss: true) |
| `components/{name}.css` | 컴포넌트 CSS (variant/size/state 클래스) |
| `components/{name}.scss` | 컴포넌트 SCSS (nested `&--` 셀렉터, scss: true) |

**다크모드 옵션:**

| 값 | 설명 |
|----|------|
| `'media'` | `@media (prefers-color-scheme: dark)` |
| `'class'` | `[data-theme="dark"]` 셀렉터 |
| `'media+class'` | 둘 다 생성 |

### Tailwind CSS

```typescript
import tailwindGenerator from '@ryndesign/generator-tailwind';

tailwindGenerator({
  outDir?: string,
  configFormat?: 'ts' | 'js' | 'cjs',  // 기본: 'ts'
  cssPath?: string,                       // 기본: 'tokens.css'
  prefix?: string,                        // CSS 변수 접두사
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `tailwind.tokens.ts` (.js/.cjs) | Tailwind 설정 (`theme.extend`에 CSS 변수 참조) |
| `tokens.css` | `@layer base` CSS (커스텀 프로퍼티, 다크모드) |
| `components/{name}.classes.ts` | 클래스 맵 + 헬퍼 함수 |

**클래스 맵 예시:**

```typescript
// 생성된 components/button.classes.ts
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

## iOS 플랫폼

### SwiftUI

```typescript
import swiftuiGenerator from '@ryndesign/generator-swiftui';

swiftuiGenerator({
  outDir?: string,
  minimumDeploymentTarget?: string,
  darkMode?: 'dynamic-color' | 'environment',
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `DesignTokens+Color.swift` | `Color` extension (다이나믹 컬러 지원) |
| `DesignTokens+Spacing.swift` | Spacing enum (`CGFloat` 상수) |
| `DesignTokens+Typography.swift` | Font extension (`TextStyle` 정의) |
| `components/DS{Name}.swift` | SwiftUI View (variant enum, computed properties, Preview) |

**다크모드 옵션:**

| 값 | 설명 |
|----|------|
| `'dynamic-color'` | `Color(light:dark:)` API 사용 |
| `'environment'` | `@Environment(\.colorScheme)` 기반 분기 |

### UIKit

```typescript
import uikitGenerator from '@ryndesign/generator-uikit';

uikitGenerator({
  outDir?: string,
  minimumDeploymentTarget?: string,
  darkMode?: 'dynamic-provider' | 'trait-collection',
  useAutoLayout?: boolean,        // 기본: true
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `DesignTokens+Color.swift` | `UIColor` extension (dynamic provider) |
| `DesignTokens+Spacing.swift` | Spacing enum (`CGFloat` 상수) |
| `DesignTokens+Typography.swift` | Typography enum (`UIFont` 상수) |
| `components/DS{Name}.swift` | UIView 서브클래스 (Auto Layout, property observer) |

---

## Android 플랫폼

### Jetpack Compose

```typescript
import composeGenerator from '@ryndesign/generator-compose';

composeGenerator({
  outDir?: string,
  packageName?: string,           // 기본: 'com.ryndesign.tokens'
  darkMode?: 'system' | 'manual',
  materialVersion?: 2 | 3,
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `DesignColors.kt` | Color 객체 (LightColors, DarkColors) |
| `DesignSpacing.kt` | Spacing 객체 (`Dp` 상수) |
| `DesignTypography.kt` | Typography 객체 (`TextStyle` 상수) |
| `DesignTheme.kt` | CompositionLocal 프로바이더 + 테마 Composable |
| `components/DS{Name}.kt` | @Composable 함수 (variant enum, Preview) |

### Android View (XML)

```typescript
import androidViewGenerator from '@ryndesign/generator-android-view';

androidViewGenerator({
  outDir?: string,
  packageName?: string,           // 기본: 'com.ryndesign.components'
  minSdkVersion?: number,
  useViewBinding?: boolean,
})
```

**생성 파일:**

| 파일 | 설명 |
|------|------|
| `values/colors.xml` | 컬러 리소스 (라이트) |
| `values-night/colors.xml` | 컬러 리소스 (다크) |
| `values/dimens.xml` | 디멘션 리소스 |
| `values/typography_styles.xml` | 텍스트 스타일 |
| `values/attrs_design.xml` | 커스텀 테마 속성 |
| `components/DS{Name}.kt` | 커스텀 View 클래스 (variant enum, attrs) |
| `layout/view_{name}.xml` | XML 레이아웃 |
| `values/attrs_{name}.xml` | 커스텀 styleable 속성 |

---

## 커스텀 제너레이터 작성

`GeneratorPlugin` 인터페이스를 구현하여 커스텀 제너레이터를 만들 수 있습니다.

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
      // tokenSet.themes: ThemeSet (다크 등)
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

설정에서 사용:

```typescript
export default defineConfig({
  generators: [
    myGenerator({ /* options */ }),
  ],
});
```

`ryndesign eject <generator>` 명령으로 기존 제너레이터의 소스를 로컬에 복사하여 커스터마이징할 수도 있습니다.
