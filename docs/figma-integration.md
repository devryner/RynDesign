# Figma 연동

RynDesign과 Figma Variables API의 양방향 동기화 가이드입니다.

## 사전 준비

### 1. Figma Personal Access Token 발급

1. Figma 앱 > Settings > Personal Access Tokens
2. "Generate new token" 클릭
3. 필요한 scope: `file_variables:read`, `file_variables:write`
4. 환경변수에 저장:

```bash
export FIGMA_TOKEN=figd_xxxxx
```

### 2. Figma File Key 확인

Figma 파일 URL에서 추출합니다:

```
https://www.figma.com/file/AbCdEfGhIjKl/Design-System
                              ^^^^^^^^^^^^
                              이 부분이 fileKey
```

### 3. 설정 파일

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

## 명령어

### `figma pull` — Figma에서 토큰 가져오기

Figma Variables를 W3C Design Token 형식으로 변환하여 로컬에 저장합니다.

```bash
ryndesign figma pull
```

**옵션:**

| 옵션 | 설명 |
|------|------|
| `--config, -c <path>` | 설정 파일 경로 |
| `--output, -o <path>` | 출력 파일 경로 (기본: `tokens/figma.tokens.json`) |
| `--merge` | 기존 로컬 토큰과 병합 |
| `--strategy <name>` | 병합 전략 (기본: `prefer-remote`) |

**병합 전략:**

| 전략 | 설명 |
|------|------|
| `prefer-remote` | 충돌 시 Figma 값 우선 (기본) |
| `prefer-local` | 충돌 시 로컬 값 유지 |
| `remote-only-new` | Figma에서 새 토큰만 추가, 기존 토큰 유지 |

```bash
# 기본 pull (Figma 값으로 덮어쓰기)
ryndesign figma pull

# 기존 토큰과 병합 (Figma 우선)
ryndesign figma pull --merge

# 로컬 우선 병합
ryndesign figma pull --merge --strategy prefer-local

# 새 토큰만 추가
ryndesign figma pull --merge --strategy remote-only-new
```

**Mode 매핑:**

`modeMapping`을 설정하면 Figma Variable의 모드별로 다른 파일에 저장됩니다.

```typescript
figma: {
  modeMapping: {
    'Light': 'tokens/base.tokens.json',    // Light 모드 → base 토큰
    'Dark': 'tokens/dark.tokens.json',     // Dark 모드 → 다크 테마 오버라이드
  },
}
```

### `figma push` — 토큰을 Figma로 내보내기

로컬 토큰을 Figma Variables로 업로드합니다.

```bash
ryndesign figma push
```

**동작:**
- 로컬 토큰을 빌드하여 `ResolvedTokenSet` 생성
- Figma Variables API로 변수 생성/업데이트
- 모드가 설정되어 있으면 모드별 값 설정

### `figma diff` — 차이 비교

로컬 토큰과 Figma Variables의 차이를 표시합니다.

```bash
ryndesign figma diff
```

**출력 예시:**

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

## Figma Variable → 토큰 변환 규칙

| Figma Variable Type | 토큰 `$type` |
|---------------------|-------------|
| `COLOR` | `color` |
| `FLOAT` | `number` 또는 `dimension` (컨텍스트에 따라) |
| `STRING` | (지원, 텍스트 값으로 저장) |
| `BOOLEAN` | (지원, 불리언 값으로 저장) |

**네이밍 변환:**

Figma Variable 이름의 `/`는 토큰 경로의 `.`으로 변환됩니다.

```
Figma: color/primary/500     →  토큰: color.primary.500
Figma: spacing/medium        →  토큰: spacing.medium
```

## 워크플로우 예시

### 디자이너 → 개발자 (Pull 워크플로우)

```bash
# 1. Figma에서 최신 변수 가져오기
ryndesign figma pull --merge

# 2. 차이 확인
git diff tokens/

# 3. 코드 재생성
ryndesign generate

# 4. 프리뷰로 확인
ryndesign preview

# 5. 커밋
git add tokens/ generated/
git commit -m "chore: sync tokens from Figma"
```

### 개발자 → 디자이너 (Push 워크플로우)

```bash
# 1. 로컬에서 토큰 수정
# (tokens/base.tokens.json 편집)

# 2. 검증
ryndesign validate

# 3. Figma에 반영
ryndesign figma push

# 4. 차이 확인
ryndesign figma diff
```

### CI/CD 연동

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
