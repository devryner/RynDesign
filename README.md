# RynDesign

하나의 디자인 토큰 소스에서 멀티 플랫폼 코드를 생성하는 디자인 시스템 생성기.

W3C Design Token 스펙(JSON)으로 토큰을 정의하면, React, SwiftUI 등 각 플랫폼에 맞는 코드를 자동 생성합니다.

## 주요 기능

- **단일 소스 → 멀티 플랫폼**: 하나의 토큰 파일에서 React (CSS/TSX), SwiftUI (Swift), Android (Compose/XML) 등 코드 생성
- **컴포넌트 정의**: JSON으로 컴포넌트 구조(props, variants, slots, states)를 선언하면 플랫폼별 컴포넌트 코드 생성
- **테마 지원**: 라이트/다크 등 다중 테마를 오버라이드 방식으로 관리
- **실시간 프리뷰**: 브라우저에서 컴포넌트를 미리 보고, 토큰을 실시간 편집하며, 생성된 코드를 확인
- **Figma 연동**: Figma 변수를 토큰으로 가져오거나 내보내기
- **CLI**: init, generate, validate, preview, add 등 완전한 CLI 제공

---

## 빠른 시작

### 1. 설치

```bash
npm install -g @ryndesign/cli
# 또는
pnpm add -g @ryndesign/cli
```

### 2. 프로젝트 초기화

```bash
mkdir my-design-system && cd my-design-system
ryndesign init
```

대화형 프롬프트가 나타나며:
- 프로젝트 이름 입력
- 플랫폼 선택 (React, SwiftUI 등)
- 기본 토큰/컴포넌트 템플릿 생성

생성되는 구조:

```
my-design-system/
├── ryndesign.config.ts
├── tokens/
│   └── base.tokens.json
├── components/
│   └── button.component.json
└── generated/          ← 코드 생성 출력 디렉토리
```

### 3. 코드 생성

```bash
ryndesign generate
```

### 4. 프리뷰 서버 실행

```bash
ryndesign preview
```

브라우저에서 `http://localhost:4400`이 열리며:
- 컴포넌트 목록 탐색 및 선택
- 모든 variant × size 조합 그리드 미리보기
- 라이트/다크 테마 전환 및 비교
- React / SwiftUI 코드 스니펫 확인 및 복사
- 토큰 실시간 편집 (color picker, 수치 입력 등)

---

## 설정 파일

프로젝트 루트에 `ryndesign.config.ts` (또는 `.js`, `.mjs`, `.json`)를 생성합니다.

```typescript
import { defineConfig } from '@ryndesign/cli';
import { reactGenerator } from '@ryndesign/generator-react';
import { swiftuiGenerator } from '@ryndesign/generator-swiftui';

export default defineConfig({
  // 토큰 파일 경로 (glob 패턴, 필수)
  tokens: ['tokens/**/*.tokens.json'],

  // 컴포넌트 정의 파일 경로 (glob 패턴)
  components: ['components/**/*.component.json'],

  // 생성 출력 디렉토리
  outDir: 'generated',

  // 테마 설정
  themes: {
    default: 'light',
    dark: { file: 'tokens/dark.tokens.json' },
  },

  // 제너레이터 목록
  generators: [
    reactGenerator({ typescript: true, darkMode: 'media+class' }),
    swiftuiGenerator({ darkMode: 'dynamic-color' }),
  ],

  // Figma 연동 설정
  figma: {
    fileKey: 'YOUR_FIGMA_FILE_KEY',
    personalAccessToken: process.env.FIGMA_TOKEN,
  },

  // 프리뷰 서버 설정
  preview: {
    port: 4400,
    open: true,
  },

  // 파이프라인 훅
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

## 토큰 파일

W3C Design Token 스펙을 따릅니다. `$type`은 그룹 레벨에서 상속되며, `$value`에 `{참조.경로}` 문법으로 alias를 사용할 수 있습니다.

### 지원 타입

| 타입 | 예시 값 |
|------|---------|
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

### 기본 예시

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

### Alias 참조

`{경로.이름}` 문법으로 다른 토큰을 참조합니다. 다단계 체인도 자동 해석됩니다.

```json
{
  "color.background.primary": { "$value": "{color.white}" },
  "color.white": { "$value": "#FFFFFF" }
}
```

### 테마 오버라이드

테마 파일은 기본 토큰 중 변경할 부분만 정의합니다.

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

## 컴포넌트 정의

컴포넌트는 JSON 파일로 정의하며, 플랫폼 독립적인 구조를 선언합니다.

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

### 필드 설명

| 필드 | 설명 |
|------|------|
| `name` | 컴포넌트 이름 (PascalCase) |
| `category` | 분류 (actions, inputs, layout, display 등) |
| `props` | 컴포넌트 속성. `type`: string, boolean, number, callback |
| `variants` | 배리언트 축 정의. 모든 조합(cartesian product)이 자동 해석됨 |
| `slots` | 자식 요소 슬롯 정의 |
| `tokenMapping` | 토큰 경로 매핑. `{variant}`, `{size}` 플레이스홀더 사용 |
| `states` | 상태별 토큰 오버라이드 (hover, pressed, disabled 등) |

---

## CLI 명령어

### `ryndesign init`

프로젝트를 초기화합니다.

```bash
ryndesign init
```

- 대화형 프롬프트로 프로젝트 이름, 플랫폼 선택
- `ryndesign.config.ts`, 기본 토큰/컴포넌트 템플릿 생성
- `.gitignore`에 `generated/` 추가
- `package.json`에 `generate`, `preview` 스크립트 추가

### `ryndesign generate`

토큰과 컴포넌트에서 플랫폼별 코드를 생성합니다.

```bash
ryndesign generate [options]

옵션:
  --config, -c <path>     설정 파일 경로
  --platform, -p <name>   특정 플랫폼만 생성 (예: react, swiftui)
  --watch, -w             파일 변경 감지 후 자동 재생성
  --dry-run               실제 파일 생성 없이 결과만 표시
  --clean                 생성 전 출력 디렉토리 정리
```

```bash
# React만 생성
ryndesign generate --platform react

# 워치 모드
ryndesign generate --watch

# 드라이런
ryndesign generate --dry-run
```

### `ryndesign validate`

토큰 파일의 유효성을 검사합니다.

```bash
ryndesign validate [options]

옵션:
  --config, -c <path>     설정 파일 경로
  --strict                경고를 에러로 처리
```

검증 항목:
- JSON 파싱 오류
- 순환 참조 감지
- 미해석 alias 잔존
- `$value` 타입과 `$type` 불일치
- 테마 오버라이드 누락 경고

### `ryndesign preview`

실시간 프리뷰 서버를 시작합니다.

```bash
ryndesign preview [options]

옵션:
  --config, -c <path>     설정 파일 경로
  --port <number>         포트 번호 (기본: 4400)
```

### `ryndesign add <component>`

컴포넌트 정의 템플릿을 추가합니다.

```bash
ryndesign add button
ryndesign add input --with-tokens

옵션:
  --with-tokens           컴포넌트 토큰 파일도 함께 생성
```

사용 가능한 컴포넌트: `button`, `input`, `card`, `checkbox`, `toggle`, `badge`, `avatar`

### `ryndesign figma <subcommand>`

Figma 변수와 동기화합니다.

```bash
ryndesign figma pull          # Figma에서 토큰 가져오기
ryndesign figma push          # 토큰을 Figma로 내보내기
ryndesign figma diff          # Figma ↔ 로컬 차이 비교
```

### `ryndesign eject <generator>`

제너레이터의 내부 코드를 로컬로 복사하여 직접 수정할 수 있도록 합니다.

```bash
ryndesign eject react         # React 제너레이터 코드를 ./generators/react/로 복사
```

---

## 제너레이터

10개의 플랫폼별 제너레이터를 제공합니다.

| 제너레이터 | 플랫폼 | 패키지 |
|-----------|--------|--------|
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

### 사용 예시

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

각 제너레이터의 상세 옵션과 생성 파일 목록은 [docs/generators.md](./docs/generators.md)를 참조하세요.

---

## 파이프라인 흐름

```
토큰 JSON 파일
    ↓
[읽기] → Raw Token Tree
    ↓
[타입 상속] → $type이 부모에서 자식으로 전파
    ↓
[순환 참조 감지] → 에러 보고
    ↓
[Alias 해석] → {참조} → 실제 값으로 변환
    ↓
[IR 빌드] → ResolvedToken[] (referencedBy 포함)
    ↓
[테마 해석] → ThemeSet (오버라이드 적용)
    ↓
[검증] → 미해석 alias, 타입 불일치 등 체크
    ↓
[컴포넌트 해석] → 모든 variant × size 조합 토큰 바인딩
    ↓
[코드 생성] → 플랫폼별 파일 출력
```

---

## 패키지 구조

| 패키지 | 설명 |
|--------|------|
| `@ryndesign/cli` | CLI 도구 (init, generate, validate, preview, add, figma, eject) |
| `@ryndesign/core` | 토큰 파싱, alias 해석, 컴포넌트 로딩, 검증 |
| `@ryndesign/plugin-api` | 제너레이터 플러그인 인터페이스, 타입 정의 |
| `@ryndesign/generator-react` | React (TSX + CSS) 코드 생성 |
| `@ryndesign/generator-vue` | Vue (SFC) 코드 생성 |
| `@ryndesign/generator-svelte` | Svelte 코드 생성 |
| `@ryndesign/generator-rails` | Rails (ViewComponent + SCSS) 코드 생성 |
| `@ryndesign/generator-swiftui` | SwiftUI (Swift) 코드 생성 |
| `@ryndesign/generator-uikit` | UIKit (Swift) 코드 생성 |
| `@ryndesign/generator-compose` | Jetpack Compose (Kotlin) 코드 생성 |
| `@ryndesign/generator-android-view` | Android View (Kotlin + XML) 코드 생성 |
| `@ryndesign/generator-css` | CSS/SCSS 토큰 코드 생성 |
| `@ryndesign/generator-tailwind` | Tailwind CSS 설정 생성 |
| `@ryndesign/figma` | Figma Variables API 연동 |
| `@ryndesign/preview` | 실시간 프리뷰 서버 (Vite + WebSocket) |

---

## 문서

| 문서 | 설명 |
|------|------|
| [설정 레퍼런스](./docs/configuration.md) | `ryndesign.config.ts` 전체 필드 스펙 |
| [토큰 스펙](./docs/token-spec.md) | W3C Design Token 형식, 지원 타입, alias, 테마 |
| [컴포넌트 정의 스펙](./docs/component-spec.md) | 컴포넌트 JSON 형식, variants, tokenMapping, states |
| [제너레이터](./docs/generators.md) | 10개 제너레이터 옵션, 생성 파일, 커스텀 제너레이터 작성법 |
| [CLI 레퍼런스](./docs/cli.md) | 전체 CLI 명령어 및 옵션 |
| [Figma 연동](./docs/figma-integration.md) | pull/push/diff, 병합 전략, 워크플로우 |

---

## 개발

```bash
# 의존성 설치
pnpm install

# 전체 빌드
pnpm build

# 전체 테스트
pnpm test

# 개발 모드 (watch)
pnpm dev
```

## 라이선스

MIT
