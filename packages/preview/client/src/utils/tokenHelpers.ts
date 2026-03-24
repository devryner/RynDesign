// Extract a value from variant tokens with fallback
export function getVT(vt: any, prop: string, fallback: string): string {
  const val = vt?.[prop]?.$value;
  if (!val) return fallback;
  if (val.hex) return val.hex;
  if (val.value !== undefined && val.unit) return `${val.value}${val.unit}`;
  if (typeof val === 'number' || typeof val === 'string') return String(val);
  return fallback;
}

// Shadow token value to CSS box-shadow
export function shadowToCSS(val: any): string {
  if (!val) return 'none';
  if (val.type === 'shadow') {
    return `${val.offsetX} ${val.offsetY} ${val.blur} ${val.spread ?? '0px'} ${val.color}`;
  }
  if (val.offsetX) {
    return `${val.offsetX} ${val.offsetY} ${val.blur} ${val.spread ?? '0px'} ${val.color}`;
  }
  return 'none';
}

// Format a resolved token value for display
export function formatTokenValue(token: any): string {
  const val = token?.$value;
  if (!val) return '';
  switch (val.type) {
    case 'color': return val.hex;
    case 'dimension': return `${val.value}${val.unit}`;
    case 'fontWeight': return String(val.value);
    case 'duration': return `${val.value}${val.unit}`;
    case 'number': return String(val.value);
    default: return JSON.stringify(val);
  }
}

// Find a token by dot-separated path
export function getToken(tokens: any[], path: string): any {
  const parts = path.split('.');
  return tokens.find((t: any) => {
    if (t.path.length !== parts.length) return false;
    return t.path.every((p: string, i: number) => p === parts[i]);
  });
}

// Get a color from tokens by path, with fallback
export function getTokenColor(tokens: any[], path: string, fallback: string): string {
  const t = getToken(tokens, path);
  return t?.$value?.hex ?? fallback;
}

// daisyUI-like color palette based on tokens
export function getThemeColors(tokens: any[]) {
  return {
    primary: getTokenColor(tokens, 'color.primary', '#570df8'),
    secondary: getTokenColor(tokens, 'color.secondary', '#f000b8'),
    accent: getTokenColor(tokens, 'color.success', '#37cdbe'),
    neutral: getTokenColor(tokens, 'color.gray.700', '#2a323c'),
    base100: getTokenColor(tokens, 'color.background.primary', '#ffffff'),
    base200: getTokenColor(tokens, 'color.background.secondary', '#f2f2f2'),
    base300: getTokenColor(tokens, 'color.background.tertiary', '#e5e6e6'),
    baseContent: getTokenColor(tokens, 'color.text.primary', '#1f2937'),
    info: getTokenColor(tokens, 'color.info', '#3abff8'),
    success: getTokenColor(tokens, 'color.success', '#36d399'),
    warning: getTokenColor(tokens, 'color.warning', '#fbbd23'),
    error: getTokenColor(tokens, 'color.error', '#f87272'),
    primaryContent: '#ffffff',
    borderColor: getTokenColor(tokens, 'color.border.default', '#e5e7eb'),
  };
}
