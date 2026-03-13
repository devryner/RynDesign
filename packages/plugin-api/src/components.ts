export interface ComponentProp {
  type: 'string' | 'boolean' | 'number' | 'callback' | 'node';
  required?: boolean;
  default?: unknown;
  description?: string;
}

export interface ComponentVariant {
  values: string[];
  default: string;
}

export interface ComponentSlot {
  optional?: boolean;
  description?: string;
}

export interface ComponentStateOverrides {
  tokenOverrides: Record<string, string>;
}

export interface ComponentDefinition {
  $schema?: string;
  name: string;
  category: string;
  props: Record<string, ComponentProp>;
  variants: Record<string, ComponentVariant>;
  slots: Record<string, ComponentSlot>;
  tokenMapping: Record<string, string>;
  states: Record<string, ComponentStateOverrides>;
}

export interface ResolvedComponent {
  definition: ComponentDefinition;
  resolvedTokens: Record<string, import('./tokens').ResolvedToken>;
  resolvedStateTokens: Record<string, Record<string, import('./tokens').ResolvedToken>>;
}
