# @ryndesign/core

## 0.1.2

### Patch Changes

- fix: global CLI에서 패키지 해석 및 컴포넌트 로딩 개선
  - config.ts: jiti alias로 @ryndesign/\* 패키지를 글로벌/monorepo 환경에서 정확히 해석
  - component-loader.ts: props/variants/slots/states 없는 컴포넌트에 빈 기본값 설정
  - preview.ts: CLI 위치 기반 preview 패키지 탐색 추가

## 0.1.1

### Patch Changes

- 6f71be7: Initial release preparation
- Updated dependencies [6f71be7]
  - @ryndesign/plugin-api@0.1.1
