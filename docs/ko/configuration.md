# 설정 레퍼런스

RynDesign 프로젝트 설정 파일의 전체 스펙입니다.

## 설정 파일 위치

프로젝트 루트에 다음 이름 중 하나로 생성합니다 (우선순위 순):

1. `ryndesign.config.ts`
2. `ryndesign.config.js`
3. `ryndesign.config.mjs`
4. `ryndesign.config.json`

## 전체 인터페이스

```typescript
import { defineConfig } from '@ryndesign/cli';

export default defineConfig({
  tokens: string[];              // 필수
  components?: string[];         // 선택
  outDir?: string;               // 선택 (기본: 'generated')
  themes?: ThemesConfig;         // 선택
  generators?: GeneratorPlugin[];// 선택
  figma?: FigmaConfig;           // 선택
  preview?: PreviewConfig;       // 선택
  hooks?: HooksConfig;           // 선택
});
```

## 필드 상세

### `tokens` (필수)

토큰 JSON 파일의 glob 패턴 배열입니다.

```typescript
tokens: ['tokens/**/*.tokens.json']
```

- 최소 1개 이상의 패턴이 필요합니다
- W3C Design Token 형식의 JSON 파일을 가리켜야 합니다
- 여러 파일이 매칭되면 deep merge됩니다

### `components`

컴포넌트 정의 JSON 파일의 glob 패턴 배열입니다.

```typescript
components: ['components/**/*.component.json']
```

### `outDir`

코드 생성 출력 디렉토리입니다. 기본값: `'generated'`

```typescript
outDir: 'src/generated'
```

각 제너레이터의 출력은 `{outDir}/{generatorName}/` 하위에 생성됩니다.

### `themes`

테마 설정입니다. `default`는 기본 테마 이름, 나머지 키는 테마별 오버라이드 파일을 가리킵니다.

```typescript
themes: {
  default: 'light',                              // 기본 테마 이름
  dark: { file: 'tokens/dark.tokens.json' },     // 테마 오버라이드 파일
  highContrast: { file: 'tokens/high-contrast.tokens.json' },
}
```

**ThemeConfig:**

```typescript
interface ThemeConfig {
  file: string;  // 테마 오버라이드 JSON 파일 경로
}
```

테마 오버라이드 파일은 기본 토큰 중 변경할 부분만 정의하면 됩니다. 나머지는 기본값이 유지됩니다.

### `generators`

사용할 제너레이터 플러그인 배열입니다.

```typescript
import { reactGenerator } from '@ryndesign/generator-react';
import { swiftuiGenerator } from '@ryndesign/generator-swiftui';
import { cssGenerator } from '@ryndesign/generator-css';

// ...
generators: [
  reactGenerator({ typescript: true, darkMode: 'media+class' }),
  swiftuiGenerator({ darkMode: 'dynamic-color' }),
  cssGenerator({ scss: true, prefix: 'ds' }),
]
```

사용 가능한 제너레이터 목록은 [generators.md](./generators.md)를 참조하세요.

### `figma`

Figma Variables API 연동 설정입니다.

```typescript
figma: {
  fileKey: 'FIGMA_FILE_KEY',                    // Figma 파일 키
  personalAccessToken: process.env.FIGMA_TOKEN, // 환경변수에서 읽기 권장
  modeMapping: {                                 // Figma 모드 → 로컬 파일 매핑
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

- `fileKey`: Figma 파일 URL의 `figma.com/file/{fileKey}/...` 부분
- `personalAccessToken`: Figma > Settings > Personal Access Tokens에서 생성
- `modeMapping`: Figma Variable Mode와 로컬 토큰 파일의 매핑

### `preview`

프리뷰 서버 설정입니다.

```typescript
preview: {
  port: 4400,    // 포트 번호 (기본: 4400)
  open: true,    // 시작 시 브라우저 자동 열기
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

파이프라인 이벤트 훅입니다.

```typescript
hooks: {
  'tokens:resolved': (tokenSet) => {
    // 토큰 해석 완료 후 실행
    console.log(`${tokenSet.tokens.length} tokens resolved`);
  },
  'generate:complete': (files) => {
    // 코드 생성 완료 후 실행
    console.log(`${files.length} files generated`);
  },
}
```

| 훅 이름 | 파라미터 | 시점 |
|---------|----------|------|
| `tokens:resolved` | `ResolvedTokenSet` | 토큰 해석 완료 후 |
| `generate:complete` | `GeneratedFile[]` | 코드 생성 완료 후 |

## 전체 예시

```typescript
import { defineConfig } from '@ryndesign/cli';
import { reactGenerator } from '@ryndesign/generator-react';
import { swiftuiGenerator } from '@ryndesign/generator-swiftui';
import { cssGenerator } from '@ryndesign/generator-css';
import { tailwindGenerator } from '@ryndesign/generator-tailwind';

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
