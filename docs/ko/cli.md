# CLI 레퍼런스

`@ryndesign/cli`의 전체 명령어 레퍼런스입니다.

## 설치

```bash
npm install -g @ryndesign/cli
# 또는
pnpm add -g @ryndesign/cli
```

## 명령어 목록

| 명령어 | 설명 |
|--------|------|
| `init` | 프로젝트 초기화 |
| `generate` | 코드 생성 |
| `validate` | 토큰 검증 |
| `preview` | 프리뷰 서버 |
| `add` | 컴포넌트 추가 |
| `figma pull` | Figma에서 가져오기 |
| `figma push` | Figma로 내보내기 |
| `figma diff` | Figma 차이 비교 |
| `eject` | 제너레이터 코드 복사 |

---

## `ryndesign init`

새 프로젝트를 초기화합니다.

```bash
ryndesign init
```

대화형 프롬프트:
1. 프로젝트 이름 입력
2. 플랫폼 선택 (React, SwiftUI, Vue, Svelte, Rails, Android 등)
3. 기본 템플릿 선택 (minimal / full)

**생성되는 파일:**

```
├── ryndesign.config.ts      # 설정 파일
├── tokens/
│   └── base.tokens.json     # 기본 토큰
├── components/
│   └── button.component.json # 샘플 컴포넌트
└── generated/               # 코드 생성 출력 (gitignore됨)
```

**추가 작업:**
- `.gitignore`에 `generated/` 추가
- `package.json`에 `generate`, `preview` 스크립트 추가

---

## `ryndesign generate`

토큰과 컴포넌트에서 플랫폼별 코드를 생성합니다.

```bash
ryndesign generate [options]
```

| 옵션 | 축약 | 설명 | 기본값 |
|------|------|------|--------|
| `--config` | `-c` | 설정 파일 경로 | 자동 탐색 |
| `--platform` | `-p` | 특정 플랫폼만 생성 | 전체 |
| `--watch` | `-w` | 파일 변경 시 자동 재생성 | false |
| `--dry-run` | | 실제 파일 생성 없이 결과 표시 | false |
| `--clean` | | 생성 전 출력 디렉토리 정리 | false |

```bash
# 전체 생성
ryndesign generate

# React만 생성
ryndesign generate --platform react

# SwiftUI만 생성
ryndesign generate --platform swiftui

# 워치 모드 (토큰/컴포넌트 변경 시 자동 재생성)
ryndesign generate --watch

# 드라이런 (파일 목록만 표시)
ryndesign generate --dry-run

# 커스텀 설정 파일
ryndesign generate --config ./config/ryndesign.config.ts
```

**출력 구조:**

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

토큰 파일의 유효성을 검사합니다.

```bash
ryndesign validate [options]
```

| 옵션 | 축약 | 설명 | 기본값 |
|------|------|------|--------|
| `--config` | `-c` | 설정 파일 경로 | 자동 탐색 |
| `--strict` | | 경고를 에러로 처리 | false |

```bash
# 기본 검증
ryndesign validate

# 엄격 모드 (CI에서 사용)
ryndesign validate --strict
```

**검증 항목:**

| 검증 | 수준 | 설명 |
|------|------|------|
| JSON 파싱 | Error | 문법 오류 |
| 순환 참조 | Error | `A → B → A` 패턴 감지 |
| 미해석 alias | Error | `{...}` 패턴이 남아있는 경우 |
| 타입 불일치 | Error | `$value` 타입과 `$type` 불일치 |
| null 값 | Error | 해석된 토큰의 `$value`가 null |
| 테마 누락 | Warning | 비-default 테마에 오버라이드 없는 토큰 |

**출력 예시:**

```
Validation Results:
  ✓ 156 tokens parsed
  ✓ 12 groups found
  ✓ No circular references
  ⚠ 3 warnings:
    - Theme "dark" missing override for "shadow.lg"
    - Theme "dark" missing override for "border.default"
    - Token "color.deprecated" is marked as deprecated
```

---

## `ryndesign preview`

실시간 프리뷰 서버를 시작합니다.

```bash
ryndesign preview [options]
```

| 옵션 | 축약 | 설명 | 기본값 |
|------|------|------|--------|
| `--config` | `-c` | 설정 파일 경로 | 자동 탐색 |
| `--port` | | 포트 번호 | 4400 |

```bash
ryndesign preview
ryndesign preview --port 3000
```

**기능:**
- 컴포넌트 목록 탐색 및 선택
- 모든 variant x size 조합 그리드 미리보기
- 라이트/다크 테마 전환 및 비교
- React / SwiftUI 코드 스니펫 확인 및 복사
- 토큰 실시간 편집 (color picker, 수치 입력 등)
- WebSocket 기반 실시간 업데이트

---

## `ryndesign add`

컴포넌트 정의 템플릿을 추가합니다.

```bash
ryndesign add <component> [options]
```

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `--with-tokens` | 컴포넌트 토큰 파일도 함께 생성 | false |

```bash
# 컴포넌트 정의만 추가
ryndesign add button

# 컴포넌트 + 토큰 함께 추가
ryndesign add input --with-tokens
```

**사용 가능한 컴포넌트 템플릿:**

| 이름 | 카테고리 | 설명 |
|------|----------|------|
| `button` | actions | 버튼 (variant, size, slots) |
| `input` | forms | 텍스트 입력 (focus, error states) |
| `card` | layout | 카드 컨테이너 (elevated, outlined, filled) |
| `checkbox` | forms | 체크박스 (size variants) |
| `toggle` | forms | 토글 스위치 |
| `badge` | display | 뱃지/태그 |
| `avatar` | display | 아바타 |

---

## `ryndesign figma`

Figma Variables API 연동 명령어입니다. 상세 가이드는 [figma-integration.md](./figma-integration.md)를 참조하세요.

```bash
ryndesign figma pull [options]      # Figma에서 가져오기
ryndesign figma push [options]      # Figma로 내보내기
ryndesign figma diff [options]      # 차이 비교
```

### `figma pull` 옵션

| 옵션 | 축약 | 설명 | 기본값 |
|------|------|------|--------|
| `--config` | `-c` | 설정 파일 경로 | 자동 탐색 |
| `--output` | `-o` | 출력 파일 경로 | `tokens/figma.tokens.json` |
| `--merge` | | 기존 토큰과 병합 | false |
| `--strategy` | | 병합 전략 | `prefer-remote` |

병합 전략: `prefer-remote`, `prefer-local`, `remote-only-new`

---

## `ryndesign eject`

제너레이터의 소스 코드를 로컬에 복사하여 직접 수정할 수 있게 합니다.

```bash
ryndesign eject <generator>
```

```bash
# React 제너레이터 eject
ryndesign eject react
# → ./generators/react/ 디렉토리에 소스 코드 복사

# 설정에서 eject된 제너레이터 사용
import { myReactGenerator } from './generators/react';
```

---

## 글로벌 옵션

모든 명령어에서 사용 가능한 옵션:

| 옵션 | 설명 |
|------|------|
| `--help` | 도움말 표시 |
| `--version` | 버전 표시 |
