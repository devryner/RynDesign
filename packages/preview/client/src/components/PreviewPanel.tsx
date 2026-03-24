import React from 'react';
import { getVT, shadowToCSS, getThemeColors, getTokenColor } from '../utils/tokenHelpers';

interface Props {
  tokenSet: any;
  components: any[];
  selectedComponent: string | null;
  splitView: boolean;
  currentTheme: string;
}

type Colors = ReturnType<typeof getThemeColors>;

/* ─── shared style constants ─── */
const R = '0.5rem';
const PILL = '9999px';
const SHADOW_SM = '0 1px 3px rgba(0,0,0,0.1)';
const SHADOW_MD = '0 4px 6px rgba(0,0,0,0.1)';
const SHADOW_LG = '0 10px 15px rgba(0,0,0,0.1)';
const TRANSITION = 'all 0.2s ease';

function label(text: string): React.ReactNode {
  return <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, textAlign: 'center' }}>{text}</div>;
}

function sectionTitle(text: string): React.ReactNode {
  return <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>{text}</h3>;
}

function row(gap = 12, wrap = true): React.CSSProperties {
  return { display: 'flex', gap, flexWrap: wrap ? 'wrap' : 'nowrap', alignItems: 'center' };
}

function col(gap = 8): React.CSSProperties {
  return { display: 'flex', flexDirection: 'column', gap };
}

/* ─── helpers ─── */
function getVTColor(comp: any, variant: string, size: string, prop: string, fallback: string): string {
  return comp.variantTokens?.[variant]?.[size]?.[prop]?.$value?.hex ?? fallback;
}

function getVTDim(comp: any, variant: string, size: string, prop: string, fallback: string): string {
  const v = comp.variantTokens?.[variant]?.[size]?.[prop]?.$value;
  if (!v) return fallback;
  if (v.value !== undefined && v.unit) return `${v.value}${v.unit}`;
  return fallback;
}

/* ════════════════════════════════════════════════════════════════
   COMPONENT RENDERERS (28)
   ════════════════════════════════════════════════════════════════ */

/* ── Actions ── */

function renderButton(comp: any, tokens: any[], c: Colors) {
  const def = comp.definition ?? comp;
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: c.primary, color: c.primaryContent, border: 'none' },
    secondary: { background: c.secondary, color: c.primaryContent, border: 'none' },
    outline: { background: 'transparent', color: c.primary, border: `2px solid ${c.primary}` },
    ghost: { background: 'transparent', color: c.primary, border: '2px solid transparent' },
  };
  const sizes: Record<string, React.CSSProperties> = {
    sm: { padding: '6px 14px', fontSize: 13 },
    md: { padding: '10px 20px', fontSize: 15 },
    lg: { padding: '14px 28px', fontSize: 17 },
  };
  const states = ['hover', 'pressed', 'disabled'] as const;

  return (
    <div>
      {sectionTitle('Button')}
      <div className="variant-grid">
        {Object.entries(variants).map(([v, vs]) =>
          Object.entries(sizes).map(([s, ss]) => {
            const bg = getVTColor(comp, v, s, 'background', (vs.background as string));
            const fg = getVTColor(comp, v, s, 'textColor', (vs.color as string));
            const fs = getVTDim(comp, v, s, 'fontSize', String(ss.fontSize) + 'px');
            const px = getVTDim(comp, v, s, 'paddingX', (ss.padding as string).split(' ')[1]);
            const py = getVTDim(comp, v, s, 'paddingY', (ss.padding as string).split(' ')[0]);
            const isOutline = v === 'outline';
            const isGhost = v === 'ghost';
            return (
              <div className="variant-cell" key={`${v}-${s}`}>
                <button style={{
                  padding: `${py} ${px}`, fontSize: fs, borderRadius: PILL, cursor: 'pointer',
                  background: (isOutline || isGhost) ? 'transparent' : bg,
                  color: (isOutline || isGhost) ? bg : fg,
                  border: isOutline ? `2px solid ${bg}` : '2px solid transparent',
                  fontWeight: 600, transition: TRANSITION, boxShadow: (isOutline || isGhost) ? 'none' : SHADOW_SM,
                }}>{def.name}</button>
                {label(`${v} / ${s}`)}
              </div>
            );
          })
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>States</h4>
        <div style={row()}>
          {states.map(st => (
            <div key={st} style={{ textAlign: 'center' }}>
              <button style={{
                padding: '10px 20px', borderRadius: PILL, border: 'none', fontWeight: 600,
                background: c.primary, color: c.primaryContent, cursor: st === 'disabled' ? 'not-allowed' : 'pointer',
                opacity: st === 'disabled' ? 0.5 : 1,
                filter: st === 'pressed' ? 'brightness(0.85)' : st === 'hover' ? 'brightness(1.1)' : 'none',
                boxShadow: SHADOW_SM, transition: TRANSITION,
              }}>{def.name}</button>
              {label(st)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderDropdown(_comp: any, _tokens: any[], c: Colors) {
  const items = ['Action 1', 'Action 2', 'Action 3'];
  return (
    <div>
      {sectionTitle('Dropdown')}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <button style={{
          padding: '10px 20px', borderRadius: R, border: `1px solid ${c.borderColor}`,
          background: c.base100, color: c.baseContent, cursor: 'pointer', fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          Options <span style={{ fontSize: 10 }}>&#9660;</span>
        </button>
        <div style={{
          marginTop: 4, borderRadius: R, background: c.base100, border: `1px solid ${c.borderColor}`,
          boxShadow: SHADOW_MD, overflow: 'hidden', minWidth: 180,
        }}>
          {items.map((item, i) => (
            <div key={i} style={{
              padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: c.baseContent,
              background: i === 0 ? c.base200 : 'transparent', borderBottom: i < items.length - 1 ? `1px solid ${c.borderColor}` : 'none',
            }}>{item}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderModal(_comp: any, _tokens: any[], c: Colors) {
  return (
    <div>
      {sectionTitle('Modal')}
      <div style={{
        position: 'relative', width: 320, height: 220, borderRadius: R,
        background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: c.base100, borderRadius: R, padding: 24, width: 260,
          boxShadow: SHADOW_LG,
        }}>
          <h4 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: c.baseContent }}>Modal Title</h4>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: c.neutral, opacity: 0.7 }}>
            This is a confirmation dialog. Are you sure you want to proceed?
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button style={{
              padding: '6px 14px', borderRadius: R, border: `1px solid ${c.borderColor}`,
              background: 'transparent', color: c.baseContent, cursor: 'pointer', fontSize: 13,
            }}>Cancel</button>
            <button style={{
              padding: '6px 14px', borderRadius: R, border: 'none',
              background: c.primary, color: c.primaryContent, cursor: 'pointer', fontSize: 13, fontWeight: 600,
            }}>Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderSwap(_comp: any, _tokens: any[], c: Colors) {
  return (
    <div>
      {sectionTitle('Swap')}
      <div style={row(24)}>
        {['ON', 'OFF'].map(state => (
          <div key={state} style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: R, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: state === 'ON' ? c.primary : c.base200, color: state === 'ON' ? c.primaryContent : c.baseContent,
              fontSize: 22, fontWeight: 700, boxShadow: SHADOW_SM, transition: TRANSITION,
              transform: state === 'ON' ? 'rotate(0deg)' : 'rotate(180deg)',
            }}>
              {state === 'ON' ? '\u2605' : '\u2606'}
            </div>
            {label(state === 'ON' ? 'Rotate ON' : 'Flip OFF')}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderThemeController(_comp: any, _tokens: any[], c: Colors) {
  return (
    <div>
      {sectionTitle('ThemeController')}
      <div style={row(16)}>
        <div style={{
          width: 56, height: 28, borderRadius: PILL, background: c.primary, position: 'relative',
          cursor: 'pointer', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: c.base100,
            position: 'absolute', top: 3, left: 31, boxShadow: SHADOW_SM, transition: TRANSITION,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
          }}>{'\u263E'}</div>
        </div>
        <span style={{ fontSize: 13, color: c.baseContent }}>Dark mode</span>
        <div style={{ marginLeft: 24 }} />
        <div style={{
          width: 56, height: 28, borderRadius: PILL, background: c.base300, position: 'relative',
          cursor: 'pointer', boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: c.base100,
            position: 'absolute', top: 3, left: 3, boxShadow: SHADOW_SM, transition: TRANSITION,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
          }}>{'\u2600'}</div>
        </div>
        <span style={{ fontSize: 13, color: c.baseContent }}>Light mode</span>
      </div>
    </div>
  );
}

/* ── Data Display ── */

function renderAccordion(_comp: any, _tokens: any[], c: Colors) {
  const sections = [
    { title: 'Section 1', content: 'This is the expanded content of section 1. It can contain any information.', open: true },
    { title: 'Section 2', content: '', open: false },
    { title: 'Section 3', content: '', open: false },
  ];
  return (
    <div>
      {sectionTitle('Accordion')}
      <div style={{ width: 360, border: `1px solid ${c.borderColor}`, borderRadius: R, overflow: 'hidden' }}>
        {sections.map((s, i) => (
          <div key={i} style={{ borderBottom: i < sections.length - 1 ? `1px solid ${c.borderColor}` : 'none' }}>
            <div style={{
              padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              cursor: 'pointer', background: s.open ? c.base200 : c.base100, fontWeight: 500,
              fontSize: 14, color: c.baseContent,
            }}>
              {s.title}
              <span style={{ fontSize: 12, transform: s.open ? 'rotate(90deg)' : 'rotate(0)', transition: TRANSITION }}>{'\u25B6'}</span>
            </div>
            {s.open && (
              <div style={{ padding: '12px 16px', fontSize: 13, color: c.baseContent, background: c.base100, lineHeight: 1.5 }}>
                {s.content}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderAvatar(_comp: any, _tokens: any[], c: Colors) {
  const sizes: Record<string, number> = { xs: 28, sm: 36, md: 48, lg: 64, xl: 80 };
  return (
    <div>
      {sectionTitle('Avatar')}
      <div style={row(16)}>
        {Object.entries(sizes).map(([s, px]) => (
          <div key={s} style={{ textAlign: 'center' }}>
            <div style={{
              width: px, height: px, borderRadius: '50%', background: c.primary,
              color: c.primaryContent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: px * 0.35, fontWeight: 700, boxShadow: SHADOW_SM,
            }}>JD</div>
            {label(s)}
          </div>
        ))}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: R, background: c.secondary,
            color: c.primaryContent, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 700, boxShadow: SHADOW_SM,
          }}>JD</div>
          {label('square')}
        </div>
      </div>
    </div>
  );
}

function renderBadge(_comp: any, _tokens: any[], c: Colors) {
  const colorMap: Record<string, string> = {
    default: c.neutral, primary: c.primary, success: c.success, warning: c.warning, error: c.error,
  };
  const variantStyles = (color: string, variant: string): React.CSSProperties => {
    if (variant === 'solid') return { background: color, color: '#fff' };
    if (variant === 'subtle') return { background: color + '20', color };
    return { background: 'transparent', color, border: `1.5px solid ${color}` };
  };
  return (
    <div>
      {sectionTitle('Badge')}
      <div style={row(8)}>
        {['solid', 'subtle', 'outline'].map(variant =>
          Object.entries(colorMap).map(([name, color]) => (
            <span key={`${variant}-${name}`} style={{
              padding: '3px 10px', borderRadius: PILL, fontSize: 12, fontWeight: 600,
              display: 'inline-block', border: 'none', ...variantStyles(color, variant),
            }}>{name}</span>
          ))
        )}
      </div>
    </div>
  );
}

function renderCard(_comp: any, _tokens: any[], c: Colors) {
  const variants: Record<string, React.CSSProperties> = {
    elevated: { boxShadow: SHADOW_MD, border: 'none', background: c.base100 },
    outlined: { boxShadow: 'none', border: `1px solid ${c.borderColor}`, background: c.base100 },
    filled: { boxShadow: 'none', border: 'none', background: c.base200 },
  };
  return (
    <div>
      {sectionTitle('Card')}
      <div style={row(16)}>
        {Object.entries(variants).map(([v, vs]) => (
          <div key={v} style={{ width: 220, borderRadius: R, overflow: 'hidden', ...vs }}>
            <div style={{ height: 80, background: c.base300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.neutral, fontSize: 12 }}>
              Image Placeholder
            </div>
            <div style={{ padding: 16 }}>
              <h4 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: c.baseContent }}>Card Title</h4>
              <p style={{ margin: '0 0 12px', fontSize: 13, color: c.baseContent, opacity: 0.7, lineHeight: 1.4 }}>
                Brief card description text.
              </p>
              <button style={{
                padding: '6px 14px', borderRadius: R, border: 'none', background: c.primary,
                color: c.primaryContent, cursor: 'pointer', fontSize: 12, fontWeight: 600,
              }}>Action</button>
            </div>
            {label(v)}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderCarousel(_comp: any, _tokens: any[], c: Colors) {
  return (
    <div>
      {sectionTitle('Carousel')}
      <div style={{ width: 360, borderRadius: R, overflow: 'hidden', background: c.base200, boxShadow: SHADOW_SM }}>
        <div style={{
          height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: c.base300, color: c.neutral, fontSize: 14,
        }}>Slide 1 of 3</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 12 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i === 0 ? c.primary : c.base300,
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function renderChatBubble(_comp: any, _tokens: any[], c: Colors) {
  const msgs = [
    { side: 'start' as const, text: 'Hey! How are you?', time: '12:45' },
    { side: 'end' as const, text: 'I\'m good, thanks!', time: '12:46' },
  ];
  return (
    <div>
      {sectionTitle('ChatBubble')}
      <div style={{ ...col(12), width: 360 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: m.side === 'end' ? 'row-reverse' : 'row',
            alignItems: 'flex-end', gap: 8,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', background: m.side === 'start' ? c.primary : c.secondary,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0,
            }}>{m.side === 'start' ? 'A' : 'B'}</div>
            <div>
              <div style={{
                padding: '10px 14px', borderRadius: 16,
                borderBottomLeftRadius: m.side === 'start' ? 4 : 16,
                borderBottomRightRadius: m.side === 'end' ? 4 : 16,
                background: m.side === 'start' ? c.base200 : c.primary,
                color: m.side === 'start' ? c.baseContent : c.primaryContent,
                fontSize: 14, maxWidth: 240,
              }}>{m.text}</div>
              <div style={{ fontSize: 10, color: c.baseContent, opacity: 0.5, marginTop: 2, textAlign: m.side === 'end' ? 'right' : 'left' }}>{m.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderCountdown(_comp: any, _tokens: any[], c: Colors) {
  return (
    <div>
      {sectionTitle('Countdown')}
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {['23', '59', '59'].map((n, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ fontSize: 32, fontWeight: 700, color: c.baseContent }}>:</span>}
            <div style={{
              background: c.base200, borderRadius: R, padding: '12px 16px',
              fontSize: 36, fontWeight: 700, fontFamily: 'monospace', color: c.baseContent,
              minWidth: 60, textAlign: 'center', boxShadow: SHADOW_SM,
            }}>{n}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function renderKbd(_comp: any, _tokens: any[], c: Colors) {
  const keys = ['Ctrl', 'Shift', 'A', '\u2318', 'Esc'];
  return (
    <div>
      {sectionTitle('Kbd')}
      <div style={row(8)}>
        {keys.map(k => (
          <kbd key={k} style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '6px 12px', minWidth: 36, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            background: c.base200, color: c.baseContent, borderRadius: 6,
            border: `1px solid ${c.borderColor}`, borderBottom: `3px solid ${c.borderColor}`,
            boxShadow: '0 1px 0 rgba(0,0,0,0.08)',
          }}>{k}</kbd>
        ))}
      </div>
    </div>
  );
}

function renderStat(_comp: any, _tokens: any[], c: Colors) {
  const stats = [
    { title: 'Total Users', value: '31.2K', desc: '\u2191 12% from last month', descColor: c.success },
    { title: 'Revenue', value: '$4,200', desc: '\u2193 3% from last month', descColor: c.error },
    { title: 'Satisfaction', value: '98%', desc: 'Based on 5K reviews', descColor: c.baseContent },
  ];
  return (
    <div>
      {sectionTitle('Stat')}
      <div style={{ display: 'flex', gap: 0, border: `1px solid ${c.borderColor}`, borderRadius: R, overflow: 'hidden' }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            padding: '16px 24px', borderRight: i < stats.length - 1 ? `1px solid ${c.borderColor}` : 'none',
            background: c.base100,
          }}>
            <div style={{ fontSize: 12, color: c.baseContent, opacity: 0.6, marginBottom: 4 }}>{s.title}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.baseContent, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.descColor, opacity: 0.8 }}>{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderTable(_comp: any, _tokens: any[], c: Colors) {
  const headers = ['Name', 'Role', 'Status'];
  const rows = [
    ['Alice', 'Engineer', 'Active'],
    ['Bob', 'Designer', 'Away'],
    ['Carol', 'Manager', 'Active'],
  ];
  return (
    <div>
      {sectionTitle('Table')}
      <div style={{ borderRadius: R, overflow: 'hidden', border: `1px solid ${c.borderColor}`, width: 400 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: c.base200 }}>
              {headers.map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 14px', fontWeight: 600, color: c.baseContent, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 1 ? c.base200 + '80' : c.base100 }}>
                {r.map((cell, j) => (
                  <td key={j} style={{ padding: '10px 14px', color: c.baseContent, borderTop: `1px solid ${c.borderColor}` }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Navigation ── */

function renderBreadcrumbs(_comp: any, _tokens: any[], c: Colors) {
  const items = ['Home', 'Documents', 'Add'];
  return (
    <div>
      {sectionTitle('Breadcrumbs')}
      <nav style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 }}>
        {items.map((item, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span style={{ color: c.baseContent, opacity: 0.4 }}>{'\u203A'}</span>}
            <a style={{
              color: i < items.length - 1 ? c.primary : c.baseContent,
              textDecoration: 'none', fontWeight: i === items.length - 1 ? 600 : 400,
              cursor: i < items.length - 1 ? 'pointer' : 'default',
            }}>{item}</a>
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
}

function renderMenu(_comp: any, _tokens: any[], c: Colors) {
  const items = [
    { icon: '\u2302', label: 'Dashboard', active: false },
    { icon: '\u2709', label: 'Messages', active: true },
    { icon: '\u2699', label: 'Settings', active: false },
    { icon: '\u2139', label: 'About', active: false },
  ];
  return (
    <div>
      {sectionTitle('Menu')}
      <div style={{ width: 220, borderRadius: R, background: c.base100, border: `1px solid ${c.borderColor}`, overflow: 'hidden', boxShadow: SHADOW_SM }}>
        {items.map((item, i) => (
          <div key={i} style={{
            padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            background: item.active ? c.primary : 'transparent',
            color: item.active ? c.primaryContent : c.baseContent,
            fontSize: 14, fontWeight: item.active ? 600 : 400,
          }}>
            <span style={{ fontSize: 16 }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderNavbar(_comp: any, _tokens: any[], c: Colors) {
  return (
    <div>
      {sectionTitle('Navbar')}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 20px', background: c.base100, borderRadius: R,
        border: `1px solid ${c.borderColor}`, boxShadow: SHADOW_SM, width: 500,
      }}>
        <div style={{ fontWeight: 700, fontSize: 18, color: c.baseContent }}>Logo</div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Home', 'About', 'Contact'].map((link, i) => (
            <a key={i} style={{ color: i === 0 ? c.primary : c.baseContent, textDecoration: 'none', fontSize: 14, fontWeight: i === 0 ? 600 : 400, cursor: 'pointer' }}>{link}</a>
          ))}
        </div>
        <button style={{
          padding: '6px 14px', borderRadius: R, border: 'none', background: c.primary,
          color: c.primaryContent, cursor: 'pointer', fontSize: 13, fontWeight: 600,
        }}>Sign In</button>
      </div>
    </div>
  );
}

function renderPagination(_comp: any, _tokens: any[], c: Colors) {
  const pages = [1, 2, 3, 4, 5];
  const active = 3;
  return (
    <div>
      {sectionTitle('Pagination')}
      <div style={{ display: 'flex', gap: 4 }}>
        {['\u2039', ...pages.map(String), '\u203A'].map((p, i) => (
          <button key={i} style={{
            width: 36, height: 36, borderRadius: R, border: `1px solid ${c.borderColor}`,
            background: String(active) === p ? c.primary : c.base100,
            color: String(active) === p ? c.primaryContent : c.baseContent,
            cursor: 'pointer', fontSize: 14, fontWeight: String(active) === p ? 700 : 400,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}

function renderSteps(_comp: any, _tokens: any[], c: Colors) {
  const steps = ['Register', 'Details', 'Review', 'Done'];
  const completed = 2;
  return (
    <div>
      {sectionTitle('Steps')}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i < completed ? c.primary : i === completed ? c.base300 : c.base200,
                color: i < completed ? c.primaryContent : c.baseContent,
                fontSize: 13, fontWeight: 700, boxShadow: i < completed ? SHADOW_SM : 'none',
              }}>{i < completed ? '\u2713' : i + 1}</div>
              <span style={{ fontSize: 11, color: c.baseContent, fontWeight: i < completed ? 600 : 400 }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 40, background: i < completed - 1 ? c.primary : c.borderColor,
                margin: '0 4px', marginBottom: 20,
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function renderTab(_comp: any, _tokens: any[], c: Colors) {
  const tabs = ['Tab 1', 'Tab 2', 'Tab 3'];
  const variants: Record<string, (active: boolean) => React.CSSProperties> = {
    bordered: (a) => ({
      padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: a ? 600 : 400,
      color: a ? c.primary : c.baseContent, background: 'transparent', border: 'none',
      borderBottom: a ? `2px solid ${c.primary}` : '2px solid transparent',
    }),
    lifted: (a) => ({
      padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: a ? 600 : 400,
      color: a ? c.baseContent : c.baseContent, background: a ? c.base100 : c.base200,
      border: a ? `1px solid ${c.borderColor}` : 'none', borderBottom: a ? 'none' : `1px solid ${c.borderColor}`,
      borderRadius: a ? `${R} ${R} 0 0` : '0', position: 'relative' as const, bottom: a ? -1 : 0,
    }),
    boxed: (a) => ({
      padding: '10px 20px', cursor: 'pointer', fontSize: 14, fontWeight: a ? 600 : 400,
      color: a ? c.primaryContent : c.baseContent, background: a ? c.primary : 'transparent',
      border: 'none', borderRadius: R,
    }),
  };
  return (
    <div>
      {sectionTitle('Tab')}
      <div style={col(16)}>
        {Object.entries(variants).map(([v, styleFn]) => (
          <div key={v}>
            <div style={{
              display: 'flex', gap: v === 'boxed' ? 4 : 0,
              borderBottom: v !== 'boxed' ? `1px solid ${c.borderColor}` : 'none',
              background: v === 'boxed' ? c.base200 : 'transparent',
              borderRadius: v === 'boxed' ? R : 0, padding: v === 'boxed' ? 4 : 0,
            }}>
              {tabs.map((t, i) => (
                <div key={i} style={styleFn(i === 0)}>{t}</div>
              ))}
            </div>
            {label(v)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Feedback ── */

function renderAlert(_comp: any, _tokens: any[], c: Colors) {
  const types: Record<string, { color: string; icon: string }> = {
    info: { color: c.info, icon: '\u2139' },
    success: { color: c.success, icon: '\u2713' },
    warning: { color: c.warning, icon: '\u26A0' },
    error: { color: c.error, icon: '\u2717' },
  };
  return (
    <div>
      {sectionTitle('Alert')}
      <div style={col(8)}>
        {Object.entries(types).map(([name, t]) => (
          <div key={name} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
            borderRadius: R, background: t.color + '18', border: `1px solid ${t.color}40`,
            color: t.color, fontSize: 14, width: 400,
          }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{t.icon}</span>
            <span>This is a {name} alert message.</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderLoading(_comp: any, _tokens: any[], c: Colors) {
  const spinnerStyle: React.CSSProperties = {
    width: 32, height: 32, border: `3px solid ${c.borderColor}`, borderTopColor: c.primary,
    borderRadius: '50%', animation: 'spin 0.8s linear infinite',
  };
  return (
    <div>
      {sectionTitle('Loading')}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }`}</style>
      <div style={row(32)}>
        <div style={{ textAlign: 'center' }}>
          <div style={spinnerStyle} />
          {label('spinner')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 32 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 10, height: 10, borderRadius: '50%', background: c.primary,
                animation: `pulse 1.4s ease-in-out ${i * 0.16}s infinite`,
              }} />
            ))}
          </div>
          {label('dots')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%', border: `3px solid ${c.borderColor}`,
            borderRightColor: c.primary, borderBottomColor: c.primary,
            animation: 'spin 1s linear infinite',
          }} />
          {label('half')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32, border: `3px solid ${c.primary}`, borderRadius: R,
            animation: 'spin 1.2s ease-in-out infinite',
          }} />
          {label('square')}
        </div>
      </div>
    </div>
  );
}

function renderProgress(_comp: any, _tokens: any[], c: Colors) {
  const percentages = [25, 50, 75];
  return (
    <div>
      {sectionTitle('Progress')}
      <div style={{ ...col(12), width: 360 }}>
        {percentages.map(p => (
          <div key={p}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 12, color: c.baseContent }}>{p}%</span>
            </div>
            <div style={{
              height: 10, borderRadius: PILL, background: c.base200, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${p}%`, borderRadius: PILL,
                background: p >= 75 ? c.success : p >= 50 ? c.primary : c.warning,
                transition: 'width 0.3s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderTooltip(_comp: any, _tokens: any[], c: Colors) {
  return (
    <div>
      {sectionTitle('Tooltip')}
      <div style={row(48)}>
        {['top', 'bottom'].map(pos => (
          <div key={pos} style={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
            {pos === 'top' && (
              <div style={{ marginBottom: 8, position: 'relative' }}>
                <div style={{
                  padding: '6px 12px', borderRadius: 6, background: c.neutral, color: '#fff',
                  fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                }}>Tooltip text</div>
                <div style={{
                  position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                  borderTop: `5px solid ${c.neutral}`,
                }} />
              </div>
            )}
            <button style={{
              padding: '8px 16px', borderRadius: R, border: `1px solid ${c.borderColor}`,
              background: c.base100, color: c.baseContent, cursor: 'pointer', fontSize: 13,
            }}>Hover me ({pos})</button>
            {pos === 'bottom' && (
              <div style={{ marginTop: 8, position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -4, left: '50%', transform: 'translateX(-50%)',
                  width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent',
                  borderBottom: `5px solid ${c.neutral}`,
                }} />
                <div style={{
                  padding: '6px 12px', borderRadius: 6, background: c.neutral, color: '#fff',
                  fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap',
                }}>Tooltip text</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Forms ── */

function renderCheckbox(_comp: any, _tokens: any[], c: Colors) {
  const sizes: Record<string, number> = { sm: 16, md: 20, lg: 26 };
  return (
    <div>
      {sectionTitle('Checkbox')}
      <div style={row(20)}>
        {Object.entries(sizes).map(([s, px]) => (
          <div key={s} style={row(12)}>
            {[true, false].map(checked => (
              <div key={String(checked)} style={{ textAlign: 'center' }}>
                <div style={{
                  width: px, height: px, borderRadius: 4, cursor: 'pointer',
                  border: checked ? 'none' : `2px solid ${c.borderColor}`,
                  background: checked ? c.primary : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: c.primaryContent, fontSize: px * 0.6, fontWeight: 700,
                  transition: TRANSITION,
                }}>{checked ? '\u2713' : ''}</div>
                {label(`${s} ${checked ? 'on' : 'off'}`)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderInput(comp: any, tokens: any[], c: Colors) {
  const variants: Record<string, React.CSSProperties> = {
    bordered: { border: `1.5px solid ${c.borderColor}`, background: c.base100 },
    filled: { border: '1.5px solid transparent', background: c.base200 },
    ghost: { border: '1.5px solid transparent', background: 'transparent', borderBottom: `1.5px solid ${c.borderColor}` },
  };
  return (
    <div>
      {sectionTitle('Input')}
      <div style={row(16)}>
        {Object.entries(variants).map(([v, vs], i) => (
          <div key={v} style={{ textAlign: 'center' }}>
            <input
              readOnly
              value={i === 0 ? '' : 'Sample text'}
              placeholder="Placeholder..."
              style={{
                padding: '10px 14px', borderRadius: R, fontSize: 14, outline: 'none',
                color: c.baseContent, width: 180, transition: TRANSITION,
                boxShadow: i === 0 ? `0 0 0 2px ${c.primary}40` : 'none', ...vs,
              }}
            />
            {label(v + (i === 0 ? ' (focus)' : ''))}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderToggle(_comp: any, _tokens: any[], c: Colors) {
  const sizes: Record<string, { w: number; h: number; thumb: number }> = {
    sm: { w: 36, h: 20, thumb: 14 },
    md: { w: 48, h: 26, thumb: 20 },
    lg: { w: 60, h: 32, thumb: 26 },
  };
  return (
    <div>
      {sectionTitle('Toggle')}
      <div style={row(20)}>
        {Object.entries(sizes).map(([s, dim]) => (
          <div key={s} style={row(12)}>
            {[true, false].map(on => (
              <div key={String(on)} style={{ textAlign: 'center' }}>
                <div style={{
                  width: dim.w, height: dim.h, borderRadius: PILL, cursor: 'pointer',
                  background: on ? c.primary : c.base300, position: 'relative',
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.15)', transition: TRANSITION,
                }}>
                  <div style={{
                    width: dim.thumb, height: dim.thumb, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: (dim.h - dim.thumb) / 2,
                    left: on ? dim.w - dim.thumb - (dim.h - dim.thumb) / 2 : (dim.h - dim.thumb) / 2,
                    boxShadow: SHADOW_SM, transition: TRANSITION,
                  }} />
                </div>
                {label(`${s} ${on ? 'on' : 'off'}`)}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   GENERIC FALLBACK
   ════════════════════════════════════════════════════════════════ */

function renderGenericFallback(comp: any, tokens: any[], c: Colors) {
  const def = comp.definition ?? comp;
  const name = def.name;
  const variants = def.variants?.variant?.values ?? ['default'];
  const sizes = def.variants?.size?.values ?? ['default'];
  const variantTokens = comp.variantTokens;

  return (
    <div>
      {sectionTitle(name)}
      <div className="variant-grid">
        {variants.map((variant: string) =>
          sizes.map((size: string) => {
            const vt = variantTokens?.[variant]?.[size];
            const bg = getVT(vt, 'background', c.primary);
            const fg = getVT(vt, 'textColor', c.primaryContent);
            const fs = getVT(vt, 'fontSize', size === 'sm' ? '13px' : size === 'lg' ? '17px' : '15px');
            const px = getVT(vt, 'paddingX', size === 'sm' ? '12px' : size === 'lg' ? '24px' : '16px');
            const py = getVT(vt, 'paddingY', size === 'sm' ? '6px' : size === 'lg' ? '14px' : '10px');
            const isTransparent = variant === 'outline' || variant === 'ghost';
            return (
              <div className="variant-cell" key={`${variant}-${size}`}>
                <div style={{
                  padding: `${py} ${px}`, borderRadius: R, fontSize: fs, fontWeight: 500,
                  background: isTransparent ? 'transparent' : bg,
                  color: isTransparent ? bg : fg,
                  border: variant === 'outline' ? `2px solid ${bg}` : '2px solid transparent',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isTransparent ? 'none' : SHADOW_SM,
                }}>{name}</div>
                {label(`${variant} / ${size}`)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   DISPATCHER
   ════════════════════════════════════════════════════════════════ */

function renderComponentPreview(comp: any, tokens: any[]) {
  const def = comp.definition ?? comp;
  const name = def.name;
  const colors = getThemeColors(tokens);

  switch (name) {
    // Actions
    case 'Button': return renderButton(comp, tokens, colors);
    case 'Dropdown': return renderDropdown(comp, tokens, colors);
    case 'Modal': return renderModal(comp, tokens, colors);
    case 'Swap': return renderSwap(comp, tokens, colors);
    case 'ThemeController': return renderThemeController(comp, tokens, colors);
    // Data Display
    case 'Accordion': return renderAccordion(comp, tokens, colors);
    case 'Avatar': return renderAvatar(comp, tokens, colors);
    case 'Badge': return renderBadge(comp, tokens, colors);
    case 'Card': return renderCard(comp, tokens, colors);
    case 'Carousel': return renderCarousel(comp, tokens, colors);
    case 'ChatBubble': return renderChatBubble(comp, tokens, colors);
    case 'Countdown': return renderCountdown(comp, tokens, colors);
    case 'Kbd': return renderKbd(comp, tokens, colors);
    case 'Stat': return renderStat(comp, tokens, colors);
    case 'Table': return renderTable(comp, tokens, colors);
    // Navigation
    case 'Breadcrumbs': return renderBreadcrumbs(comp, tokens, colors);
    case 'Menu': return renderMenu(comp, tokens, colors);
    case 'Navbar': return renderNavbar(comp, tokens, colors);
    case 'Pagination': return renderPagination(comp, tokens, colors);
    case 'Steps': return renderSteps(comp, tokens, colors);
    case 'Tab': return renderTab(comp, tokens, colors);
    // Feedback
    case 'Alert': return renderAlert(comp, tokens, colors);
    case 'Loading': return renderLoading(comp, tokens, colors);
    case 'Progress': return renderProgress(comp, tokens, colors);
    case 'Tooltip': return renderTooltip(comp, tokens, colors);
    // Forms
    case 'Checkbox': return renderCheckbox(comp, tokens, colors);
    case 'Input': return renderInput(comp, tokens, colors);
    case 'Toggle': return renderToggle(comp, tokens, colors);
    // Fallback
    default: return renderGenericFallback(comp, tokens, colors);
  }
}

/* ════════════════════════════════════════════════════════════════
   FALLBACK PREVIEW (no components loaded)
   ════════════════════════════════════════════════════════════════ */

function renderFallbackPreview(tokens: any[]) {
  const c = getThemeColors(tokens);
  return (
    <div className="component-card">
      <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Button</h4>
      <div style={row(8)}>
        <button style={{
          padding: '10px 20px', borderRadius: PILL, border: 'none',
          background: c.primary, color: c.primaryContent, cursor: 'pointer', fontWeight: 600, boxShadow: SHADOW_SM,
        }}>Primary</button>
        <button style={{
          padding: '10px 20px', borderRadius: PILL,
          border: `2px solid ${c.primary}`, background: 'transparent', color: c.primary, cursor: 'pointer', fontWeight: 600,
        }}>Outline</button>
        <button style={{
          padding: '10px 20px', borderRadius: PILL, border: '2px solid transparent',
          background: 'transparent', color: c.primary, cursor: 'pointer', fontWeight: 600,
        }}>Ghost</button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN EXPORT
   ════════════════════════════════════════════════════════════════ */

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
