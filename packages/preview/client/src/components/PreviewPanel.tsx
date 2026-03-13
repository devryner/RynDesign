import React from 'react';

interface Props {
  tokenSet: any;
  components: any[];
  selectedComponent: string | null;
  splitView: boolean;
  currentTheme: string;
}

function formatTokenValue(value: any): string {
  if (!value) return '';
  switch (value.type) {
    case 'color': return value.hex;
    case 'dimension': return `${value.value}${value.unit}`;
    case 'fontWeight': return String(value.value);
    case 'duration': return `${value.value}${value.unit}`;
    case 'number': return String(value.value);
    default: return JSON.stringify(value);
  }
}

function getToken(tokens: any[], path: string): string {
  const t = tokens?.find((t: any) => t.path.join('.') === path);
  return t ? formatTokenValue(t.$value) : '#ccc';
}

function renderComponentPreview(comp: any, tokens: any[]) {
  const def = comp.definition ?? comp;
  const name = def.name;
  const variants = def.variants?.variant?.values ?? ['default'];
  const sizes = def.variants?.size?.values ?? ['default'];
  const variantTokens = comp.variantTokens;

  return (
    <div>
      <h3 style={{ fontSize: 16, marginBottom: 16 }}>{name}</h3>
      <div className="variant-grid">
        {variants.map((variant: string) =>
          sizes.map((size: string) => {
            // Try to get tokens from variantTokens
            const vt = variantTokens?.[variant]?.[size];
            const bg = vt?.background?.$value?.hex
              ?? getToken(tokens, `component.${name.toLowerCase()}.${variant}.background`);
            const textColor = vt?.textColor?.$value?.hex
              ?? (variant === 'primary' || variant === 'secondary' ? '#fff' : bg);
            const fontSize = vt?.fontSize?.$value
              ? `${vt.fontSize.$value.value}${vt.fontSize.$value.unit}`
              : size === 'sm' ? '14px' : size === 'lg' ? '18px' : '16px';
            const paddingX = vt?.paddingX?.$value
              ? `${vt.paddingX.$value.value}${vt.paddingX.$value.unit}`
              : size === 'sm' ? '12px' : size === 'lg' ? '24px' : '16px';
            const paddingY = vt?.paddingY?.$value
              ? `${vt.paddingY.$value.value}${vt.paddingY.$value.unit}`
              : size === 'sm' ? '6px' : size === 'lg' ? '14px' : '10px';

            const isOutline = variant === 'outline';
            const isGhost = variant === 'ghost';

            const style: React.CSSProperties = {
              padding: `${paddingY} ${paddingX}`,
              borderRadius: 8,
              border: isOutline ? `1px solid ${bg}` : 'none',
              background: (isOutline || isGhost) ? 'transparent' : bg,
              color: (isOutline || isGhost) ? bg : textColor,
              cursor: 'pointer',
              fontSize,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            };

            return (
              <div className="variant-cell" key={`${variant}-${size}`}>
                <button style={style}>{name}</button>
                <span>{variant}/{size}</span>
              </div>
            );
          })
        )}
      </div>

      {/* State previews */}
      {def.states && Object.keys(def.states).length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>States</h4>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {Object.keys(def.states).map((state: string) => (
              <div key={state} style={{ textAlign: 'center' }}>
                <button
                  style={{
                    padding: '10px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: getToken(tokens, 'color.primary'),
                    color: '#fff',
                    cursor: state === 'disabled' ? 'not-allowed' : 'pointer',
                    opacity: state === 'disabled' ? 0.6 : 1,
                    fontSize: 14,
                  }}
                >
                  {name}
                </button>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{state}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PreviewPanel({ tokenSet, components, selectedComponent, splitView, currentTheme }: Props) {
  const tokens = tokenSet?.tokens ?? [];

  if (!tokenSet) {
    return <p>Loading...</p>;
  }

  const selectedComp = selectedComponent
    ? components.find(c => (c.definition?.name ?? c.name) === selectedComponent)
    : null;

  if (splitView && selectedComp) {
    return (
      <div className="split-view">
        <div className="split-pane">
          <h4>Light</h4>
          {renderComponentPreview(selectedComp, tokens)}
        </div>
        <div className="split-pane" style={{ background: '#1a1a2e', color: '#e5e5e5' }}>
          <h4>Dark</h4>
          {renderComponentPreview(selectedComp, tokenSet.themes?.themes?.dark?.tokens ?? tokens)}
        </div>
      </div>
    );
  }

  if (selectedComp) {
    return renderComponentPreview(selectedComp, tokens);
  }

  // Default: show all components in a grid
  if (components.length === 0) {
    return (
      <div className="component-grid">
        {renderFallbackPreview(tokens)}
      </div>
    );
  }

  return (
    <div>
      {components.map(comp => {
        const name = comp.definition?.name ?? comp.name;
        return (
          <div key={name} className="component-card" style={{ marginBottom: 16 }}>
            {renderComponentPreview(comp, tokens)}
          </div>
        );
      })}
    </div>
  );
}

function renderFallbackPreview(tokens: any[]) {
  return (
    <div className="component-card">
      <h4>Button</h4>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={{
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: getToken(tokens, 'color.primary'), color: 'white', cursor: 'pointer',
        }}>Primary</button>
        <button style={{
          padding: '8px 16px', borderRadius: 8,
          border: `1px solid ${getToken(tokens, 'color.primary')}`,
          background: 'transparent', color: getToken(tokens, 'color.primary'), cursor: 'pointer',
        }}>Outline</button>
        <button style={{
          padding: '8px 16px', borderRadius: 8, border: 'none',
          background: 'transparent', color: getToken(tokens, 'color.primary'), cursor: 'pointer',
        }}>Ghost</button>
      </div>
    </div>
  );
}
