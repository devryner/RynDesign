# @ryndesign/preview

## 0.3.0

### Minor Changes

- feat: Material Design 3 기반 프리뷰 컴포넌트 전면 재설계

  5개 카테고리(Actions, Communication, Containment, Data Input, Navigation), 29개 인터랙티브 컴포넌트로 교체

## 0.2.1

### Patch Changes

- fix: global CLI에서 패키지 해석 및 컴포넌트 로딩 개선
  - config.ts: jiti alias로 @ryndesign/\* 패키지를 글로벌/monorepo 환경에서 정확히 해석
  - component-loader.ts: props/variants/slots/states 없는 컴포넌트에 빈 기본값 설정
  - preview.ts: CLI 위치 기반 preview 패키지 탐색 추가

- Updated dependencies
  - @ryndesign/core@0.1.2

## 0.2.0

### Minor Changes

- Preview enhancement: 28 daisyUI-styled component renderers, 4 example pages (Login, Profile, List, Dashboard), real-time token editing fix, Components/Examples tab switching.

## 0.1.5

### Patch Changes

- Pass generators from config to preview server so Generated Code snippets work for all components.

## 0.1.4

### Patch Changes

- Fix CLI init to bundle templates/components in npm package, add --dark-mode option and non-interactive mode, default to full template. Fix preview WebSocket conflict with Vite HMR and add port-in-use detection.

## 0.1.3

### Patch Changes

- 77b306e: Fix \_\_dirname not defined error in ESM by enabling tsup shims

## 0.1.2

### Patch Changes

- 4eae698: Fix preview server build: externalize vite, fix dependencies for npm install

## 0.1.1

### Patch Changes

- 6f71be7: Initial release preparation
- Updated dependencies [6f71be7]
  - @ryndesign/plugin-api@0.1.1
  - @ryndesign/core@0.1.1
