# 토큰 스펙

W3C Design Token Format을 기반으로 한 RynDesign의 토큰 파일 명세입니다.

## 파일 형식

JSON 파일이며, 확장자는 `.tokens.json`을 권장합니다.

```
tokens/
├── base.tokens.json       # 기본 토큰
├── dark.tokens.json       # 다크 테마 오버라이드
└── brand.tokens.json      # 브랜드 전용 토큰 (선택)
```

## 기본 구조

각 토큰은 `$value`와 선택적으로 `$type`, `$description`을 가집니다.

```json
{
  "color": {
    "$type": "color",
    "primary": {
      "$value": "#3B82F6",
      "$description": "Primary brand color"
    }
  }
}
```

## 타입 상속

그룹 레벨에 `$type`을 지정하면 하위 모든 토큰에 자동 상속됩니다.

```json
{
  "spacing": {
    "$type": "dimension",
    "sm": { "$value": "8px" },
    "md": { "$value": "16px" },
    "lg": { "$value": "24px" }
  }
}
```

위 예시에서 `spacing.sm`, `spacing.md`, `spacing.lg`는 모두 `dimension` 타입입니다.

## Alias 참조

`{경로.이름}` 문법으로 다른 토큰을 참조합니다. 다단계 체인도 자동 해석됩니다.

```json
{
  "color": {
    "$type": "color",
    "white": { "$value": "#FFFFFF" },
    "background": {
      "primary": { "$value": "{color.white}" }
    }
  }
}
```

**다단계 체인 예시:**

```json
{
  "color.brand": { "$value": "#3B82F6" },
  "color.primary": { "$value": "{color.brand}" },
  "color.button.primary.bg": { "$value": "{color.primary}" }
}
```

`color.button.primary.bg` → `color.primary` → `color.brand` → `#3B82F6`으로 자동 해석됩니다.

**주의:** 순환 참조는 빌드 시 에러로 감지됩니다.

## 지원 타입

### `color`

```json
{ "$value": "#3B82F6" }
{ "$value": "#3B82F680" }
{ "$value": "rgba(59, 130, 246, 0.5)" }
```

해석 후 `ColorValue`:

```typescript
{
  type: 'color',
  hex: '#3B82F6',
  r: 59, g: 130, b: 246, a: 1
}
```

### `dimension`

```json
{ "$value": "16px" }
{ "$value": "1.5rem" }
{ "$value": "0px" }
```

해석 후 `DimensionValue`:

```typescript
{
  type: 'dimension',
  value: 16,
  unit: 'px'
}
```

### `fontFamily`

```json
{ "$value": "Inter, sans-serif" }
```

해석 후 `FontFamilyValue`:

```typescript
{
  type: 'fontFamily',
  value: ['Inter', 'sans-serif']
}
```

### `fontWeight`

```json
{ "$value": 400 }
{ "$value": 700 }
```

해석 후 `FontWeightValue`:

```typescript
{
  type: 'fontWeight',
  value: 400,
  keyword: 'normal'  // 자동 매핑
}
```

### `duration`

```json
{ "$value": "250ms" }
{ "$value": "0.5s" }
```

해석 후 `DurationValue`:

```typescript
{
  type: 'duration',
  value: 250,
  unit: 'ms'
}
```

### `number`

```json
{ "$value": 1.5 }
{ "$value": 0 }
```

해석 후 `NumberValue`:

```typescript
{
  type: 'number',
  value: 1.5
}
```

### `shadow`

```json
{
  "$value": {
    "color": "#0000001A",
    "offsetX": "0px",
    "offsetY": "4px",
    "blur": "6px",
    "spread": "-1px"
  }
}
```

해석 후 `ShadowValue`:

```typescript
{
  type: 'shadow',
  color: { hex: '#0000001A', r: 0, g: 0, b: 0, a: 0.1 },
  offsetX: { value: 0, unit: 'px' },
  offsetY: { value: 4, unit: 'px' },
  blur: { value: 6, unit: 'px' },
  spread: { value: -1, unit: 'px' }
}
```

### `border`

```json
{
  "$value": {
    "color": "{color.border.default}",
    "width": "1px",
    "style": "solid"
  }
}
```

alias 참조도 내부 필드에서 사용할 수 있습니다.

### `typography`

```json
{
  "$value": {
    "fontFamily": "Inter, sans-serif",
    "fontSize": "{fontSize.2xl}",
    "fontWeight": "{fontWeight.bold}",
    "lineHeight": "{lineHeight.tight}"
  }
}
```

복합 타입 내부에서도 alias 참조가 가능합니다.

### `gradient`

```json
{
  "$value": {
    "type": "linear",
    "angle": "135deg",
    "stops": [
      { "color": "#3B82F6", "position": "0%" },
      { "color": "#6366F1", "position": "100%" }
    ]
  }
}
```

### `cubicBezier`

```json
{ "$value": [0.25, 0.1, 0.25, 1.0] }
```

### `transition`

```json
{
  "$value": {
    "duration": "250ms",
    "delay": "0ms",
    "timingFunction": [0.25, 0.1, 0.25, 1.0]
  }
}
```

## 메타데이터 필드

### `$description`

토큰에 대한 설명입니다.

```json
{
  "color.primary": {
    "$value": "#3B82F6",
    "$description": "Primary brand color used for CTAs and links"
  }
}
```

### `$deprecated`

사용 중단 표시입니다. 불리언 또는 대안을 안내하는 문자열을 사용합니다.

```json
{
  "color.accent": {
    "$value": "#6366F1",
    "$deprecated": "Use color.secondary instead"
  }
}
```

### `$extensions`

플랫폼별 확장 데이터를 저장합니다.

```json
{
  "color.primary": {
    "$value": "#3B82F6",
    "$extensions": {
      "com.figma": { "variableId": "VariableID:123:456" },
      "com.ryndesign": { "group": "brand" }
    }
  }
}
```

## 테마 오버라이드 파일

테마 파일은 기본 토큰 중 변경할 부분만 정의합니다.

```json
{
  "$description": "Dark theme overrides",
  "$extensions": {
    "com.ryndesign.theme": {
      "name": "dark",
      "extends": "default"
    }
  },
  "color": {
    "$type": "color",
    "background": {
      "primary": { "$value": "{color.gray.900}" },
      "secondary": { "$value": "{color.gray.800}" }
    },
    "text": {
      "primary": { "$value": "{color.gray.50}" },
      "secondary": { "$value": "{color.gray.300}" }
    }
  }
}
```

**규칙:**
- `$extensions.com.ryndesign.theme.name`으로 테마 이름을 지정합니다
- `extends`로 기본 테마를 지정합니다 (선택)
- 오버라이드하지 않은 토큰은 기본 테마의 값이 유지됩니다
- alias 참조는 기본 토큰 세트 전체에서 해석됩니다

## 컴포넌트 토큰 패턴

컴포넌트에서 사용하는 토큰은 `component.{name}` 네임스페이스를 권장합니다.

```json
{
  "component": {
    "button": {
      "$type": "color",
      "primary": {
        "background": { "$value": "{color.primary}" },
        "text": { "$value": "{color.white}" },
        "hover": {
          "background": { "$value": "#2563EB" }
        },
        "pressed": {
          "background": { "$value": "#1D4ED8" }
        }
      },
      "secondary": {
        "background": { "$value": "{color.gray.100}" },
        "text": { "$value": "{color.gray.900}" }
      },
      "borderRadius": { "$type": "dimension", "$value": "{borderRadius.md}" },
      "sm": {
        "$type": "dimension",
        "paddingX": { "$value": "{spacing.sm}" },
        "paddingY": { "$value": "{spacing.xs}" },
        "fontSize": { "$value": "{fontSize.sm}" }
      },
      "md": {
        "$type": "dimension",
        "paddingX": { "$value": "{spacing.md}" },
        "paddingY": { "$value": "{spacing.sm}" },
        "fontSize": { "$value": "{fontSize.md}" }
      },
      "lg": {
        "$type": "dimension",
        "paddingX": { "$value": "{spacing.lg}" },
        "paddingY": { "$value": "{spacing.md}" },
        "fontSize": { "$value": "{fontSize.lg}" }
      },
      "disabled": {
        "background": { "$value": "{color.gray.200}" }
      }
    }
  }
}
```

## 검증

`ryndesign validate` 명령으로 토큰 파일을 검증할 수 있습니다.

검증 항목:
- JSON 문법 오류
- 순환 참조 감지
- 미해석 alias 잔존 (`{...}` 패턴)
- `$value` 타입과 `$type` 불일치
- 테마 완전성 (비-default 테마에 누락된 오버라이드 경고)

```bash
ryndesign validate              # 기본 검증
ryndesign validate --strict     # 경고를 에러로 처리
```
