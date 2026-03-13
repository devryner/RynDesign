# 컴포넌트 정의 스펙

RynDesign의 플랫폼 독립적 컴포넌트 정의 형식입니다.

## 파일 형식

JSON 파일이며, 확장자는 `.component.json`을 권장합니다.

```
components/
├── button.component.json
├── input.component.json
├── card.component.json
├── checkbox.component.json
├── toggle.component.json
├── badge.component.json
└── avatar.component.json
```

## 전체 인터페이스

```typescript
interface ComponentDefinition {
  $schema?: string;
  name: string;
  category: string;
  props: Record<string, ComponentProp>;
  variants: Record<string, ComponentVariant>;
  slots: Record<string, ComponentSlot>;
  tokenMapping: Record<string, string>;
  states: Record<string, ComponentStateOverrides>;
}
```

## 필드 상세

### `name` (필수)

컴포넌트 이름입니다. PascalCase를 사용합니다.

```json
{ "name": "Button" }
```

제너레이터별 변환:
- React: `Button.tsx`
- SwiftUI: `DSButton.swift`
- CSS: `.button` (kebab-case)
- Compose: `DSButton.kt`

### `category` (필수)

컴포넌트의 분류입니다.

| 값 | 설명 | 예시 |
|----|------|------|
| `actions` | 액션/인터랙션 | Button, IconButton |
| `forms` | 폼 입력 요소 | Input, Checkbox, Toggle |
| `layout` | 레이아웃/컨테이너 | Card, Modal, Divider |
| `display` | 정보 표시 | Badge, Avatar, Tag |
| `navigation` | 내비게이션 | Tab, Breadcrumb |
| `feedback` | 피드백/알림 | Toast, Alert |

### `props` (필수)

컴포넌트 속성을 정의합니다.

```json
{
  "props": {
    "label": {
      "type": "string",
      "required": true,
      "description": "Button label text"
    },
    "disabled": {
      "type": "boolean",
      "default": false
    },
    "count": {
      "type": "number",
      "default": 0
    },
    "onPress": {
      "type": "callback"
    },
    "children": {
      "type": "node"
    }
  }
}
```

**ComponentProp:**

```typescript
interface ComponentProp {
  type: 'string' | 'boolean' | 'number' | 'callback' | 'node';
  required?: boolean;
  default?: unknown;
  description?: string;
}
```

| type | 설명 | React | SwiftUI | Android |
|------|------|-------|---------|---------|
| `string` | 문자열 | `string` | `String` | `String` |
| `boolean` | 불리언 | `boolean` | `Bool` | `Boolean` |
| `number` | 숫자 | `number` | `Int`/`Double` | `Int` |
| `callback` | 콜백 함수 | `() => void` | `() -> Void` | `() -> Unit` |
| `node` | 자식 요소 | `ReactNode` | `some View` | `@Composable` |

### `variants` (필수)

배리언트 축을 정의합니다. 모든 축의 값 조합(cartesian product)이 자동 해석됩니다.

```json
{
  "variants": {
    "variant": {
      "values": ["primary", "secondary", "outline", "ghost"],
      "default": "primary"
    },
    "size": {
      "values": ["sm", "md", "lg"],
      "default": "md"
    }
  }
}
```

위 예시의 경우 4 variant x 3 size = 12가지 조합이 모두 해석됩니다.

**ComponentVariant:**

```typescript
interface ComponentVariant {
  values: string[];   // 허용 값 목록
  default: string;    // 기본값
}
```

**제너레이터별 변환:**
- React: `variant?: 'primary' | 'secondary' | ...` prop
- SwiftUI: `enum ButtonVariant { case primary, secondary, ... }`
- CSS: `.button--primary`, `.button--secondary`, ...
- Tailwind: `buttonVariant = { primary: '...', secondary: '...' }`
- Compose: `enum class DSButtonVariant { PRIMARY, SECONDARY, ... }`

### `slots` (필수)

자식 요소 삽입 지점을 정의합니다.

```json
{
  "slots": {
    "leadingIcon": {
      "optional": true,
      "description": "Icon displayed before the label"
    },
    "trailingIcon": {
      "optional": true,
      "description": "Icon displayed after the label"
    }
  }
}
```

**ComponentSlot:**

```typescript
interface ComponentSlot {
  optional?: boolean;
  description?: string;
}
```

### `tokenMapping` (필수)

컴포넌트 스타일 속성과 토큰 경로의 매핑입니다. `{variant}`, `{size}` 플레이스홀더를 사용합니다.

```json
{
  "tokenMapping": {
    "background": "component.button.{variant}.background",
    "textColor": "component.button.{variant}.text",
    "borderRadius": "component.button.borderRadius",
    "paddingX": "component.button.{size}.paddingX",
    "paddingY": "component.button.{size}.paddingY",
    "fontSize": "component.button.{size}.fontSize"
  }
}
```

**플레이스홀더:**
- `{variant}`: `variants.variant.values`의 각 값으로 치환
- `{size}`: `variants.size.values`의 각 값으로 치환

**사용 가능한 속성 키:**

| 키 | 설명 | CSS | Tailwind |
|----|------|-----|----------|
| `background` | 배경색 | `background-color` | `bg-` |
| `textColor` | 텍스트 색상 | `color` | `text-` |
| `borderRadius` | 모서리 둥글기 | `border-radius` | `rounded-` |
| `borderColor` | 테두리 색상 | `border-color` | `border-` |
| `borderWidth` | 테두리 두께 | `border-width` | `border-` |
| `paddingX` | 좌우 패딩 | `padding-left/right` | `px-` |
| `paddingY` | 상하 패딩 | `padding-top/bottom` | `py-` |
| `fontSize` | 폰트 크기 | `font-size` | `text-` |

### `states` (필수)

상태별 토큰 오버라이드를 정의합니다.

```json
{
  "states": {
    "hover": {
      "tokenOverrides": {
        "background": "component.button.{variant}.hover.background"
      }
    },
    "pressed": {
      "tokenOverrides": {
        "background": "component.button.{variant}.pressed.background"
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

**ComponentStateOverrides:**

```typescript
interface ComponentStateOverrides {
  tokenOverrides: Record<string, string>;  // 속성 키 → 토큰 경로
}
```

**일반적인 상태:**

| 상태 | 설명 | CSS 적용 |
|------|------|----------|
| `hover` | 마우스 호버 | `:hover` |
| `pressed` / `active` | 클릭/탭 중 | `:active` |
| `focused` | 포커스 상태 | `:focus` |
| `disabled` | 비활성 | `.--disabled`, `[disabled]` |
| `error` | 에러 상태 | `.--error` |

## 해석 과정

컴포넌트 정의는 다음과 같이 해석됩니다:

1. `tokenMapping`의 플레이스홀더를 모든 variant x size 조합으로 치환
2. 각 토큰 경로를 `ResolvedTokenSet`에서 조회
3. 결과를 `ResolvedComponent.variantTokens`에 저장

```
tokenMapping.background = "component.button.{variant}.background"
  ↓
variant=primary, size=md → "component.button.primary.background" → ResolvedToken
variant=primary, size=sm → "component.button.primary.background" → ResolvedToken
variant=secondary, size=md → "component.button.secondary.background" → ResolvedToken
...
```

**ResolvedComponent:**

```typescript
interface ResolvedComponent {
  definition: ComponentDefinition;
  resolvedTokens: Record<string, ResolvedToken>;          // default variant/size
  resolvedStateTokens: Record<string, Record<string, ResolvedToken>>;  // state → prop → token
  variantTokens: Record<string, Record<string, Record<string, ResolvedToken>>>;
  // variantTokens[variant][size][prop] = ResolvedToken
}
```

## 전체 예시

```json
{
  "$schema": "https://ryndesign.dev/schemas/component.json",
  "name": "Input",
  "category": "forms",
  "props": {
    "value": { "type": "string", "default": "" },
    "placeholder": { "type": "string" },
    "disabled": { "type": "boolean", "default": false },
    "error": { "type": "boolean", "default": false },
    "onChange": { "type": "callback" }
  },
  "variants": {
    "variant": {
      "values": ["default", "filled", "outlined"],
      "default": "default"
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
    "background": "component.input.{variant}.background",
    "textColor": "component.input.{variant}.text",
    "borderColor": "component.input.{variant}.border",
    "borderRadius": "component.input.borderRadius",
    "paddingX": "component.input.{size}.paddingX",
    "paddingY": "component.input.{size}.paddingY",
    "fontSize": "component.input.{size}.fontSize"
  },
  "states": {
    "focus": {
      "tokenOverrides": {
        "borderColor": "component.input.{variant}.focus.border"
      }
    },
    "error": {
      "tokenOverrides": {
        "borderColor": "component.input.error.border"
      }
    },
    "disabled": {
      "tokenOverrides": {
        "background": "component.input.disabled.background"
      }
    }
  }
}
```
