import React, { useState, useRef, useEffect } from 'react';
import { getThemeColors } from '../utils/tokenHelpers';

interface Props {
  tokenSet: any;
  components: any[];
  selectedComponent: string | null;
  splitView: boolean;
  currentTheme: string;
}

type Colors = ReturnType<typeof getThemeColors>;

/* ─── style constants ─── */
const R = 12;
const R_SM = 8;
const R_FULL = 9999;
const TR = 'all 0.2s cubic-bezier(0.4,0,0.2,1)';
const SHADOW_1 = '0 1px 3px 1px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)';
const SHADOW_2 = '0 2px 6px 2px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.12)';
const SHADOW_3 = '0 6px 10px 4px rgba(0,0,0,0.08), 0 2px 3px rgba(0,0,0,0.12)';

function label(text: string) {
  return <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, textAlign: 'center' }}>{text}</div>;
}
function sectionLabel(text: string) {
  return <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{text}</div>;
}
function row(gap = 12): React.CSSProperties {
  return { display: 'flex', gap, flexWrap: 'wrap', alignItems: 'center' };
}
function col(gap = 8): React.CSSProperties {
  return { display: 'flex', flexDirection: 'column', gap };
}
function divider(c: Colors): React.ReactNode {
  return <hr style={{ border: 'none', borderTop: `1px solid ${c.borderColor}`, margin: '20px 0' }} />;
}

/* ═══════════════════════════════════════════════════════
   CATEGORY DEFINITIONS
   ═══════════════════════════════════════════════════════ */

interface Category {
  id: string;
  name: string;
  components: ComponentDef[];
}

interface ComponentDef {
  id: string;
  name: string;
  render: (c: Colors, state: any, setState: (s: any) => void) => React.ReactNode;
}

function buildCategories(): Category[] {
  return [
    {
      id: 'actions', name: 'Actions',
      components: [
        { id: 'common-buttons', name: 'Common Buttons', render: renderCommonButtons },
        { id: 'fab', name: 'FAB', render: renderFAB },
        { id: 'extended-fab', name: 'Extended FAB', render: renderExtendedFAB },
        { id: 'icon-buttons', name: 'Icon Buttons', render: renderIconButtons },
        { id: 'segmented-buttons', name: 'Segmented Buttons', render: renderSegmentedButtons },
      ],
    },
    {
      id: 'communication', name: 'Communication',
      components: [
        { id: 'badges', name: 'Badges', render: renderBadges },
        { id: 'progress', name: 'Progress Indicators', render: renderProgress },
        { id: 'snackbar', name: 'Snackbar', render: renderSnackbar },
      ],
    },
    {
      id: 'containment', name: 'Containment',
      components: [
        { id: 'cards', name: 'Cards', render: renderCards },
        { id: 'dialogs', name: 'Dialogs', render: renderDialogs },
        { id: 'dividers', name: 'Dividers', render: renderDividers },
        { id: 'lists', name: 'Lists', render: renderLists },
        { id: 'sheets', name: 'Sheets', render: renderSheets },
        { id: 'tooltips', name: 'Tooltips', render: renderTooltips },
      ],
    },
    {
      id: 'data-input', name: 'Data Input',
      components: [
        { id: 'checkboxes', name: 'Checkboxes', render: renderCheckboxes },
        { id: 'chips', name: 'Chips', render: renderChips },
        { id: 'date-pickers', name: 'Date Pickers', render: renderDatePickers },
        { id: 'time-pickers', name: 'Time Pickers', render: renderTimePickers },
        { id: 'radio-buttons', name: 'Radio Buttons', render: renderRadioButtons },
        { id: 'sliders', name: 'Sliders', render: renderSliders },
        { id: 'switches', name: 'Switches', render: renderSwitches },
        { id: 'text-fields', name: 'Text Fields', render: renderTextFields },
      ],
    },
    {
      id: 'navigation', name: 'Navigation',
      components: [
        { id: 'bottom-nav', name: 'Bottom Navigation', render: renderBottomNav },
        { id: 'nav-bar', name: 'Navigation Bar', render: renderNavBar },
        { id: 'nav-drawer', name: 'Navigation Drawer', render: renderNavDrawer },
        { id: 'nav-rail', name: 'Navigation Rail', render: renderNavRail },
        { id: 'search', name: 'Search', render: renderSearch },
        { id: 'tabs', name: 'Tabs', render: renderTabs },
        { id: 'top-app-bar', name: 'Top App Bar', render: renderTopAppBar },
      ],
    },
  ];
}

/* ═══════════════════════════════════════════════════════
   1. ACTIONS
   ═══════════════════════════════════════════════════════ */

function renderCommonButtons(c: Colors, state: any, setState: (s: any) => void) {
  const types = [
    { name: 'Elevated', bg: c.base200, fg: c.primary, shadow: SHADOW_1, border: 'none' },
    { name: 'Filled', bg: c.primary, fg: c.primaryContent, shadow: SHADOW_1, border: 'none' },
    { name: 'Tonal', bg: c.base300, fg: c.baseContent, shadow: 'none', border: 'none' },
    { name: 'Outlined', bg: 'transparent', fg: c.primary, shadow: 'none', border: `1px solid ${c.borderColor}` },
    { name: 'Text', bg: 'transparent', fg: c.primary, shadow: 'none', border: 'none' },
  ];
  const clickCount = state?.clickCount ?? 0;
  return (
    <div>
      {sectionLabel('Button Types')}
      <div style={row(16)}>
        {types.map(t => (
          <button key={t.name} onClick={() => setState({ clickCount: clickCount + 1 })} style={{
            padding: '10px 24px', borderRadius: R_FULL, background: t.bg, color: t.fg,
            border: t.border, boxShadow: t.shadow, cursor: 'pointer', fontWeight: 500,
            fontSize: 14, transition: TR, letterSpacing: 0.3,
          }}>{t.name}</button>
        ))}
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 12 }}>
        Clicked: {clickCount} times
      </div>
      {sectionLabel('Disabled')}
      <div style={{ ...row(16), marginTop: 8 }}>
        {types.slice(0, 3).map(t => (
          <button key={t.name} disabled style={{
            padding: '10px 24px', borderRadius: R_FULL, background: t.bg, color: t.fg,
            border: t.border, boxShadow: 'none', cursor: 'not-allowed', fontWeight: 500,
            fontSize: 14, opacity: 0.38,
          }}>{t.name}</button>
        ))}
      </div>
      {sectionLabel('With Icons')}
      <div style={{ ...row(16), marginTop: 8 }}>
        <button style={{
          padding: '10px 24px 10px 16px', borderRadius: R_FULL, background: c.primary,
          color: c.primaryContent, border: 'none', cursor: 'pointer', fontWeight: 500,
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: SHADOW_1,
        }}><span style={{ fontSize: 18 }}>+</span> Create</button>
        <button style={{
          padding: '10px 24px 10px 16px', borderRadius: R_FULL, background: 'transparent',
          color: c.primary, border: `1px solid ${c.borderColor}`, cursor: 'pointer', fontWeight: 500,
          fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
        }}><span style={{ fontSize: 16 }}>&#9998;</span> Edit</button>
      </div>
    </div>
  );
}

function renderFAB(c: Colors, state: any, setState: (s: any) => void) {
  const sizes = [
    { name: 'Small', size: 40, icon: 18 },
    { name: 'Default', size: 56, icon: 24 },
    { name: 'Large', size: 96, icon: 36 },
  ];
  const rotated = state?.rotated ?? false;
  return (
    <div>
      {sectionLabel('FAB Sizes')}
      <div style={row(20)}>
        {sizes.map(s => (
          <div key={s.name} style={{ textAlign: 'center' }}>
            <button onClick={() => setState({ rotated: !rotated })} style={{
              width: s.size, height: s.size, borderRadius: s.name === 'Large' ? 28 : 16,
              background: c.primary, color: c.primaryContent, border: 'none', cursor: 'pointer',
              boxShadow: SHADOW_2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: s.icon, transition: TR, transform: rotated ? 'rotate(45deg)' : 'none',
            }}>+</button>
            {label(s.name)}
          </div>
        ))}
      </div>
      {sectionLabel('Surface Variants')}
      <div style={{ ...row(20), marginTop: 8 }}>
        {[
          { name: 'Surface', bg: c.base200, fg: c.primary },
          { name: 'Primary', bg: c.primary, fg: c.primaryContent },
          { name: 'Secondary', bg: c.secondary, fg: c.primaryContent },
          { name: 'Tertiary', bg: c.accent, fg: c.primaryContent },
        ].map(v => (
          <div key={v.name} style={{ textAlign: 'center' }}>
            <button style={{
              width: 56, height: 56, borderRadius: 16, background: v.bg, color: v.fg,
              border: 'none', cursor: 'pointer', boxShadow: SHADOW_2, fontSize: 24,
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: TR,
            }}>+</button>
            {label(v.name)}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderExtendedFAB(c: Colors) {
  return (
    <div>
      {sectionLabel('Extended FAB')}
      <div style={row(16)}>
        <button style={{
          padding: '16px 20px', borderRadius: 16, background: c.primary, color: c.primaryContent,
          border: 'none', cursor: 'pointer', boxShadow: SHADOW_2, fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 12, transition: TR,
        }}><span style={{ fontSize: 22 }}>&#9998;</span> Compose</button>
        <button style={{
          padding: '16px 20px', borderRadius: 16, background: c.base200, color: c.primary,
          border: 'none', cursor: 'pointer', boxShadow: SHADOW_2, fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 12, transition: TR,
        }}><span style={{ fontSize: 22 }}>+</span> New Item</button>
        <button style={{
          padding: '16px 20px', borderRadius: 16, background: c.accent, color: c.primaryContent,
          border: 'none', cursor: 'pointer', boxShadow: SHADOW_2, fontSize: 14, fontWeight: 500,
          display: 'flex', alignItems: 'center', gap: 12, transition: TR,
        }}><span style={{ fontSize: 22 }}>&#10003;</span> Navigate</button>
      </div>
      {sectionLabel('Without Icon')}
      <div style={{ ...row(16), marginTop: 8 }}>
        <button style={{
          padding: '16px 24px', borderRadius: 16, background: c.primary, color: c.primaryContent,
          border: 'none', cursor: 'pointer', boxShadow: SHADOW_2, fontSize: 14, fontWeight: 500, transition: TR,
        }}>Extended FAB</button>
      </div>
    </div>
  );
}

function renderIconButtons(c: Colors, state: any, setState: (s: any) => void) {
  const toggled = state?.toggled ?? false;
  const btnBase: React.CSSProperties = {
    width: 40, height: 40, borderRadius: R_FULL, display: 'flex',
    alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, transition: TR,
  };
  return (
    <div>
      {sectionLabel('Icon Button Types')}
      <div style={row(16)}>
        <div style={{ textAlign: 'center' }}>
          <button style={{ ...btnBase, background: 'transparent', color: c.baseContent, border: 'none' }}>&#9733;</button>
          {label('Standard')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button style={{ ...btnBase, background: c.primary, color: c.primaryContent, border: 'none', boxShadow: SHADOW_1 }}>&#9733;</button>
          {label('Filled')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button style={{ ...btnBase, background: c.base300, color: c.baseContent, border: 'none' }}>&#9733;</button>
          {label('Tonal')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <button style={{ ...btnBase, background: 'transparent', color: c.baseContent, border: `1px solid ${c.borderColor}` }}>&#9733;</button>
          {label('Outlined')}
        </div>
      </div>
      {sectionLabel('Toggle')}
      <div style={{ ...row(16), marginTop: 8 }}>
        <button onClick={() => setState({ toggled: !toggled })} style={{
          ...btnBase, background: toggled ? c.primary : 'transparent',
          color: toggled ? c.primaryContent : c.baseContent,
          border: toggled ? 'none' : `1px solid ${c.borderColor}`,
        }}>{toggled ? '\u2665' : '\u2661'}</button>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{toggled ? 'Favorited' : 'Click to favorite'}</span>
      </div>
    </div>
  );
}

function renderSegmentedButtons(c: Colors, state: any, setState: (s: any) => void) {
  const selected = state?.selected ?? 0;
  const multiSelected = state?.multi ?? [true, false, false];
  const items = ['Day', 'Week', 'Month', 'Year'];
  const items2 = ['$', '$$', '$$$'];
  return (
    <div>
      {sectionLabel('Single Select')}
      <div style={{ display: 'inline-flex', borderRadius: R_FULL, border: `1px solid ${c.borderColor}`, overflow: 'hidden' }}>
        {items.map((item, i) => (
          <button key={item} onClick={() => setState({ ...state, selected: i })} style={{
            padding: '8px 20px', background: i === selected ? c.primary : 'transparent',
            color: i === selected ? c.primaryContent : c.baseContent,
            border: 'none', borderRight: i < items.length - 1 ? `1px solid ${c.borderColor}` : 'none',
            cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: TR,
          }}>{i === selected && '\u2713 '}{item}</button>
        ))}
      </div>
      {sectionLabel('Multi Select')}
      <div style={{ display: 'inline-flex', borderRadius: R_FULL, border: `1px solid ${c.borderColor}`, overflow: 'hidden', marginTop: 8 }}>
        {items2.map((item, i) => {
          const sel = multiSelected[i];
          return (
            <button key={item} onClick={() => {
              const next = [...multiSelected]; next[i] = !next[i];
              setState({ ...state, multi: next });
            }} style={{
              padding: '8px 20px', background: sel ? c.base300 : 'transparent',
              color: c.baseContent, border: 'none',
              borderRight: i < items2.length - 1 ? `1px solid ${c.borderColor}` : 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: TR,
            }}>{sel && '\u2713 '}{item}</button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   2. COMMUNICATION
   ═══════════════════════════════════════════════════════ */

function renderBadges(c: Colors) {
  const badge = (count: number | string, bg: string, fg: string): React.CSSProperties => ({
    position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18,
    borderRadius: R_FULL, background: bg, color: fg, fontSize: 10, fontWeight: 600,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
  });
  const dot: React.CSSProperties = {
    position: 'absolute', top: 0, right: 0, width: 8, height: 8,
    borderRadius: R_FULL, background: c.error,
  };
  const iconBox: React.CSSProperties = {
    position: 'relative', width: 40, height: 40, borderRadius: R_SM,
    background: c.base200, display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20, color: c.baseContent,
  };
  return (
    <div>
      {sectionLabel('Badge Types')}
      <div style={row(24)}>
        <div style={{ textAlign: 'center' }}>
          <div style={iconBox}>
            &#9993; <div style={dot} />
          </div>
          {label('Dot')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={iconBox}>
            &#9993; <div style={badge(3, c.error, '#fff')}>3</div>
          </div>
          {label('Number')}
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={iconBox}>
            &#128276; <div style={badge(99, c.error, '#fff')}>99+</div>
          </div>
          {label('Overflow')}
        </div>
      </div>
      {sectionLabel('Color Variants')}
      <div style={{ ...row(12), marginTop: 8 }}>
        {[
          { name: 'Error', bg: c.error }, { name: 'Primary', bg: c.primary },
          { name: 'Success', bg: c.success }, { name: 'Warning', bg: c.warning },
        ].map(v => (
          <span key={v.name} style={{
            padding: '3px 12px', borderRadius: R_FULL, background: v.bg, color: '#fff',
            fontSize: 12, fontWeight: 600,
          }}>{v.name}</span>
        ))}
      </div>
    </div>
  );
}

function renderProgress(c: Colors, state: any, setState: (s: any) => void) {
  const progress = state?.progress ?? 65;
  return (
    <div>
      {sectionLabel('Linear Progress')}
      <div style={col(12)}>
        <div>
          <div style={{ height: 4, background: c.base300, borderRadius: R_FULL, overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: c.primary, borderRadius: R_FULL, transition: 'width 0.3s ease' }} />
          </div>
          {label(`Determinate: ${progress}%`)}
        </div>
        <div>
          <div style={{ height: 4, background: c.base300, borderRadius: R_FULL, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              position: 'absolute', width: '30%', height: '100%', background: c.primary,
              borderRadius: R_FULL, animation: 'indeterminate 1.5s infinite ease-in-out',
            }} />
          </div>
          {label('Indeterminate')}
        </div>
      </div>
      {sectionLabel('Circular Progress')}
      <div style={row(24)}>
        {[25, 50, 75, 100].map(v => (
          <div key={v} style={{ textAlign: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="20" fill="none" stroke={c.base300} strokeWidth="4" />
              <circle cx="24" cy="24" r="20" fill="none" stroke={c.primary} strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 20}`} strokeDashoffset={`${2 * Math.PI * 20 * (1 - v / 100)}`}
                strokeLinecap="round" transform="rotate(-90 24 24)" style={{ transition: 'stroke-dashoffset 0.3s ease' }} />
              <text x="24" y="24" textAnchor="middle" dominantBaseline="central" fill={c.baseContent} fontSize="11" fontWeight="500">{v}%</text>
            </svg>
            {label(`${v}%`)}
          </div>
        ))}
      </div>
      {sectionLabel('Interactive')}
      <input type="range" min="0" max="100" value={progress}
        onChange={e => setState({ progress: Number(e.target.value) })}
        style={{ width: 200, accentColor: c.primary }} />
      <style>{`@keyframes indeterminate { 0% { left: -30%; } 100% { left: 100%; } }`}</style>
    </div>
  );
}

function renderSnackbar(c: Colors, state: any, setState: (s: any) => void) {
  const visible = state?.visible ?? false;
  const variant = state?.variant ?? 'default';
  return (
    <div>
      {sectionLabel('Snackbar Variants')}
      <div style={row(12)}>
        {['default', 'action', 'dismiss'].map(v => (
          <button key={v} onClick={() => setState({ visible: true, variant: v })} style={{
            padding: '8px 16px', borderRadius: R_SM, background: c.primary, color: c.primaryContent,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: TR,
          }}>Show {v}</button>
        ))}
      </div>
      {visible && (
        <div style={{
          marginTop: 16, padding: '14px 16px', borderRadius: R_SM, background: c.neutral,
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: SHADOW_3, maxWidth: 400, animation: 'slideUp 0.2s ease',
        }}>
          <span style={{ fontSize: 14 }}>Item has been updated</span>
          <div style={row(8)}>
            {variant === 'action' && (
              <button onClick={() => setState({ visible: false })} style={{
                background: 'none', border: 'none', color: c.primary, cursor: 'pointer', fontWeight: 600, fontSize: 13,
              }}>Undo</button>
            )}
            {variant === 'dismiss' && (
              <button onClick={() => setState({ visible: false })} style={{
                background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 16,
              }}>&#10005;</button>
            )}
          </div>
        </div>
      )}
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. CONTAINMENT
   ═══════════════════════════════════════════════════════ */

function renderCards(c: Colors) {
  const cardBase: React.CSSProperties = {
    borderRadius: R, padding: 0, overflow: 'hidden', width: 240, transition: TR,
  };
  return (
    <div>
      {sectionLabel('Card Types')}
      <div style={row(16)}>
        <div style={{ ...cardBase, background: c.base100, boxShadow: SHADOW_1 }}>
          <div style={{ height: 120, background: `linear-gradient(135deg, ${c.primary}, ${c.secondary})` }} />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: c.baseContent }}>Elevated Card</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>With shadow elevation</div>
            <div style={{ ...row(8), marginTop: 12 }}>
              <button style={{ padding: '6px 12px', borderRadius: R_FULL, background: c.primary, color: c.primaryContent, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Action</button>
              <button style={{ padding: '6px 12px', borderRadius: R_FULL, background: 'transparent', color: c.primary, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>Learn More</button>
            </div>
          </div>
        </div>
        <div style={{ ...cardBase, background: c.base200, boxShadow: 'none' }}>
          <div style={{ height: 120, background: `linear-gradient(135deg, ${c.accent}, ${c.success})` }} />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: c.baseContent }}>Filled Card</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Container color variant</div>
          </div>
        </div>
        <div style={{ ...cardBase, background: c.base100, boxShadow: 'none', border: `1px solid ${c.borderColor}` }}>
          <div style={{ height: 120, background: `linear-gradient(135deg, ${c.warning}, ${c.error})` }} />
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: c.baseContent }}>Outlined Card</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Border variant</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderDialogs(c: Colors, state: any, setState: (s: any) => void) {
  const open = state?.open ?? false;
  const type = state?.type ?? 'basic';
  return (
    <div>
      {sectionLabel('Dialog Types')}
      <div style={row(12)}>
        {['basic', 'confirm', 'fullscreen'].map(t => (
          <button key={t} onClick={() => setState({ open: true, type: t })} style={{
            padding: '8px 16px', borderRadius: R_SM, background: c.primary, color: c.primaryContent,
            border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: TR,
          }}>Open {t}</button>
        ))}
      </div>
      {open && (
        <div style={{
          marginTop: 16, position: 'relative', width: type === 'fullscreen' ? '100%' : 340,
          borderRadius: type === 'fullscreen' ? 0 : 28, background: c.base100,
          boxShadow: SHADOW_3, padding: 24, border: `1px solid ${c.borderColor}`,
        }}>
          <div style={{ fontSize: 20, fontWeight: 500, color: c.baseContent, marginBottom: 16 }}>
            {type === 'basic' ? 'Basic Dialog' : type === 'confirm' ? 'Confirm Action?' : 'Full-screen Dialog'}
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
            This is a dialog description. It provides additional context for the user to make a decision.
          </p>
          {type === 'confirm' && (
            <div style={{ padding: '12px 0', borderTop: `1px solid ${c.borderColor}`, marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: c.baseContent, cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: c.primary }} /> Don't ask again
              </label>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button onClick={() => setState({ open: false })} style={{
              padding: '8px 16px', borderRadius: R_FULL, background: 'transparent', color: c.primary,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>Cancel</button>
            <button onClick={() => setState({ open: false })} style={{
              padding: '8px 16px', borderRadius: R_FULL, background: c.primary, color: c.primaryContent,
              border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
            }}>Confirm</button>
          </div>
        </div>
      )}
    </div>
  );
}

function renderDividers(c: Colors) {
  return (
    <div>
      {sectionLabel('Divider Types')}
      <div style={col(16)}>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Full Width</div>
          <hr style={{ border: 'none', borderTop: `1px solid ${c.borderColor}` }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Inset</div>
          <hr style={{ border: 'none', borderTop: `1px solid ${c.borderColor}`, marginLeft: 72 }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Middle Inset</div>
          <hr style={{ border: 'none', borderTop: `1px solid ${c.borderColor}`, marginLeft: 16, marginRight: 16 }} />
        </div>
        <div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>Vertical</div>
          <div style={row(16)}>
            <span>Item A</span>
            <div style={{ width: 1, height: 24, background: c.borderColor }} />
            <span>Item B</span>
            <div style={{ width: 1, height: 24, background: c.borderColor }} />
            <span>Item C</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderLists(c: Colors, state: any, setState: (s: any) => void) {
  const selected = state?.selected ?? 0;
  const items = [
    { icon: '\u2302', title: 'Home', subtitle: 'Main page' },
    { icon: '\u2606', title: 'Favorites', subtitle: '12 items saved' },
    { icon: '\u2709', title: 'Messages', subtitle: '3 unread messages' },
    { icon: '\u2699', title: 'Settings', subtitle: 'App configuration' },
  ];
  return (
    <div>
      {sectionLabel('Single-line & Two-line')}
      <div style={{ borderRadius: R, border: `1px solid ${c.borderColor}`, overflow: 'hidden', maxWidth: 360 }}>
        {items.map((item, i) => (
          <div key={i} onClick={() => setState({ selected: i })} style={{
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 16,
            background: i === selected ? c.base200 : c.base100, cursor: 'pointer', transition: TR,
            borderBottom: i < items.length - 1 ? `1px solid ${c.borderColor}` : 'none',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: R_FULL, background: c.base300,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: c.baseContent }}>{item.title}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.subtitle}</div>
            </div>
            {i === 2 && <span style={{
              padding: '2px 8px', borderRadius: R_FULL, background: c.error, color: '#fff', fontSize: 10, fontWeight: 600,
            }}>3</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function renderSheets(c: Colors, state: any, setState: (s: any) => void) {
  const bottomOpen = state?.bottom ?? false;
  const sideOpen = state?.side ?? false;
  return (
    <div>
      {sectionLabel('Sheet Types')}
      <div style={row(12)}>
        <button onClick={() => setState({ ...state, bottom: !bottomOpen })} style={{
          padding: '8px 16px', borderRadius: R_SM, background: c.primary, color: c.primaryContent,
          border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
        }}>Bottom Sheet</button>
        <button onClick={() => setState({ ...state, side: !sideOpen })} style={{
          padding: '8px 16px', borderRadius: R_SM, background: c.primary, color: c.primaryContent,
          border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
        }}>Side Sheet</button>
      </div>
      <div style={{
        marginTop: 16, position: 'relative', width: 320, height: 200, background: c.base200,
        borderRadius: R, overflow: 'hidden', border: `1px solid ${c.borderColor}`,
      }}>
        <div style={{ padding: 16, fontSize: 13, color: 'var(--text-secondary)' }}>Content Area</div>
        {bottomOpen && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, background: c.base100,
            borderTop: `1px solid ${c.borderColor}`, borderRadius: '16px 16px 0 0',
            padding: '8px 16px 16px', boxShadow: SHADOW_3, animation: 'slideUp 0.2s ease',
          }}>
            <div style={{ width: 32, height: 4, borderRadius: R_FULL, background: c.borderColor, margin: '0 auto 12px' }} />
            <div style={{ fontSize: 14, fontWeight: 500, color: c.baseContent, marginBottom: 8 }}>Bottom Sheet</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sheet content goes here with various options and actions.</div>
          </div>
        )}
        {sideOpen && (
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0, width: 200, background: c.base100,
            borderLeft: `1px solid ${c.borderColor}`, padding: 16, boxShadow: SHADOW_3,
            animation: 'slideLeft 0.2s ease',
          }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: c.baseContent, marginBottom: 8 }}>Side Sheet</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Additional details and actions.</div>
          </div>
        )}
      </div>
      <style>{`@keyframes slideLeft { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
    </div>
  );
}

function renderTooltips(c: Colors, state: any, setState: (s: any) => void) {
  const show = state?.show ?? '';
  return (
    <div>
      {sectionLabel('Tooltip Types')}
      <div style={row(32)}>
        {[
          { id: 'plain', text: 'Save' },
          { id: 'rich', text: 'Rich tooltip with longer description text.' },
        ].map(t => (
          <div key={t.id} style={{ position: 'relative', textAlign: 'center' }}>
            <button
              onMouseEnter={() => setState({ show: t.id })}
              onMouseLeave={() => setState({ show: '' })}
              style={{
                width: 40, height: 40, borderRadius: R_SM, background: c.base200, color: c.baseContent,
                border: 'none', cursor: 'pointer', fontSize: 18,
              }}>&#128190;</button>
            {show === t.id && (
              <div style={{
                position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
                marginBottom: 8, padding: t.id === 'rich' ? '12px 16px' : '6px 12px',
                borderRadius: R_SM, background: c.neutral, color: '#fff', fontSize: 12,
                whiteSpace: t.id === 'rich' ? 'normal' : 'nowrap', width: t.id === 'rich' ? 200 : 'auto',
                boxShadow: SHADOW_2, animation: 'fadeIn 0.15s ease', lineHeight: 1.4,
              }}>{t.text}</div>
            )}
            {label(t.id === 'plain' ? 'Plain' : 'Rich')}
          </div>
        ))}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(4px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   4. DATA INPUT
   ═══════════════════════════════════════════════════════ */

function renderCheckboxes(c: Colors, state: any, setState: (s: any) => void) {
  const checks = state?.checks ?? [true, false, true, false];
  return (
    <div>
      {sectionLabel('Checkbox States')}
      <div style={col(8)}>
        {['Option A (checked)', 'Option B', 'Option C (checked)', 'Option D'].map((opt, i) => (
          <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 14, color: c.baseContent, padding: '4px 0' }}>
            <div onClick={() => { const next = [...checks]; next[i] = !next[i]; setState({ checks: next }); }} style={{
              width: 20, height: 20, borderRadius: 4, border: checks[i] ? 'none' : `2px solid ${c.borderColor}`,
              background: checks[i] ? c.primary : 'transparent', display: 'flex',
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: TR,
            }}>{checks[i] && <span style={{ color: c.primaryContent, fontSize: 14, fontWeight: 700 }}>&#10003;</span>}</div>
            {opt}
          </label>
        ))}
      </div>
      {sectionLabel('Indeterminate')}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 4, background: c.primary,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><span style={{ color: c.primaryContent, fontSize: 16, fontWeight: 700 }}>&minus;</span></div>
        <span style={{ fontSize: 14, color: c.baseContent }}>Select All</span>
      </div>
    </div>
  );
}

function renderChips(c: Colors, state: any, setState: (s: any) => void) {
  const selected = state?.selected ?? [true, false, true, false];
  const inputChips = state?.inputs ?? ['React', 'TypeScript'];
  return (
    <div>
      {sectionLabel('Filter Chips')}
      <div style={row(8)}>
        {['Design', 'Code', 'Test', 'Deploy'].map((ch, i) => (
          <button key={ch} onClick={() => { const next = [...selected]; next[i] = !next[i]; setState({ ...state, selected: next }); }} style={{
            padding: '6px 16px', borderRadius: R_FULL, fontSize: 13, fontWeight: 500,
            background: selected[i] ? c.base300 : 'transparent', color: c.baseContent,
            border: `1px solid ${selected[i] ? 'transparent' : c.borderColor}`,
            cursor: 'pointer', transition: TR,
          }}>{selected[i] && '\u2713 '}{ch}</button>
        ))}
      </div>
      {sectionLabel('Input Chips')}
      <div style={{ ...row(8), marginTop: 8 }}>
        {inputChips.map((ch: string, i: number) => (
          <span key={i} style={{
            padding: '4px 12px 4px 16px', borderRadius: R_FULL, fontSize: 13,
            background: c.base200, color: c.baseContent, display: 'flex', alignItems: 'center', gap: 6,
            border: `1px solid ${c.borderColor}`,
          }}>
            {ch}
            <button onClick={() => setState({ ...state, inputs: inputChips.filter((_: any, j: number) => j !== i) })} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)', padding: 0,
            }}>&#10005;</button>
          </span>
        ))}
      </div>
      {sectionLabel('Suggestion & Assist')}
      <div style={{ ...row(8), marginTop: 8 }}>
        {['Suggestion 1', 'Suggestion 2'].map(s => (
          <button key={s} style={{
            padding: '6px 16px', borderRadius: R_FULL, fontSize: 13, background: c.base200,
            color: c.baseContent, border: `1px solid ${c.borderColor}`, cursor: 'pointer',
          }}>{s}</button>
        ))}
      </div>
    </div>
  );
}

function renderDatePickers(c: Colors, state: any, setState: (s: any) => void) {
  const selected = state?.date ?? 15;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const today = 25;
  return (
    <div>
      {sectionLabel('Date Picker')}
      <div style={{
        borderRadius: R, border: `1px solid ${c.borderColor}`, background: c.base100,
        padding: 16, maxWidth: 300,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: c.baseContent }}>&lsaquo;</button>
          <span style={{ fontSize: 14, fontWeight: 500, color: c.baseContent }}>March 2026</span>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: c.baseContent }}>&rsaquo;</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, textAlign: 'center' }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', padding: 6, fontWeight: 500 }}>{d}</div>
          ))}
          {days.map(d => (
            <button key={d} onClick={() => setState({ date: d })} style={{
              width: 36, height: 36, borderRadius: R_FULL, border: d === today ? `1px solid ${c.primary}` : 'none',
              background: d === selected ? c.primary : 'transparent',
              color: d === selected ? c.primaryContent : d === today ? c.primary : c.baseContent,
              cursor: 'pointer', fontSize: 13, fontWeight: d === today || d === selected ? 600 : 400,
              transition: TR,
            }}>{d}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderTimePickers(c: Colors, state: any, setState: (s: any) => void) {
  const hour = state?.hour ?? 10;
  const minute = state?.minute ?? 30;
  const ampm = state?.ampm ?? 'AM';
  return (
    <div>
      {sectionLabel('Time Picker')}
      <div style={{
        borderRadius: R, border: `1px solid ${c.borderColor}`, background: c.base100,
        padding: 20, maxWidth: 280, textAlign: 'center',
      }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>Select time</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          <input type="number" min="1" max="12" value={hour} onChange={e => setState({ ...state, hour: Number(e.target.value) })}
            style={{ width: 64, height: 56, textAlign: 'center', fontSize: 32, fontWeight: 400, border: `1px solid ${c.borderColor}`, borderRadius: R_SM, background: c.base200, color: c.baseContent }} />
          <span style={{ fontSize: 32, fontWeight: 400, color: c.baseContent }}>:</span>
          <input type="number" min="0" max="59" value={minute} onChange={e => setState({ ...state, minute: Number(e.target.value) })}
            style={{ width: 64, height: 56, textAlign: 'center', fontSize: 32, fontWeight: 400, border: `1px solid ${c.borderColor}`, borderRadius: R_SM, background: c.base200, color: c.baseContent }} />
          <div style={col(4)}>
            {['AM', 'PM'].map(p => (
              <button key={p} onClick={() => setState({ ...state, ampm: p })} style={{
                padding: '4px 10px', borderRadius: R_SM, fontSize: 12, fontWeight: 500,
                background: ampm === p ? c.primary : 'transparent', color: ampm === p ? c.primaryContent : c.baseContent,
                border: `1px solid ${ampm === p ? c.primary : c.borderColor}`, cursor: 'pointer',
              }}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderRadioButtons(c: Colors, state: any, setState: (s: any) => void) {
  const selected = state?.selected ?? 'option1';
  const options = [
    { id: 'option1', label: 'Option 1', desc: 'First option description' },
    { id: 'option2', label: 'Option 2', desc: 'Second option description' },
    { id: 'option3', label: 'Option 3', desc: 'Third option description' },
    { id: 'option4', label: 'Option 4 (Disabled)', desc: 'This option is disabled', disabled: true },
  ];
  return (
    <div>
      {sectionLabel('Radio Button Group')}
      <div style={col(4)}>
        {options.map(opt => (
          <label key={opt.id} onClick={() => !opt.disabled && setState({ selected: opt.id })} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12, cursor: opt.disabled ? 'not-allowed' : 'pointer',
            padding: '8px 0', opacity: opt.disabled ? 0.5 : 1,
          }}>
            <div style={{
              width: 20, height: 20, borderRadius: R_FULL, border: `2px solid ${selected === opt.id ? c.primary : c.borderColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, transition: TR,
            }}>
              {selected === opt.id && <div style={{ width: 10, height: 10, borderRadius: R_FULL, background: c.primary }} />}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: c.baseContent }}>{opt.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{opt.desc}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}

function renderSliders(c: Colors, state: any, setState: (s: any) => void) {
  const val = state?.val ?? 40;
  const range = state?.range ?? [20, 80];
  return (
    <div>
      {sectionLabel('Continuous Slider')}
      <div style={{ maxWidth: 300 }}>
        <input type="range" min="0" max="100" value={val}
          onChange={e => setState({ ...state, val: Number(e.target.value) })}
          style={{ width: '100%', accentColor: c.primary }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)' }}>
          <span>0</span><span>{val}</span><span>100</span>
        </div>
      </div>
      {sectionLabel('Discrete Slider')}
      <div style={{ maxWidth: 300, marginTop: 8 }}>
        <input type="range" min="0" max="100" step="10" value={val}
          onChange={e => setState({ ...state, val: Number(e.target.value) })}
          style={{ width: '100%', accentColor: c.primary }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-secondary)' }}>
          {Array.from({ length: 11 }, (_, i) => <span key={i}>|</span>)}
        </div>
      </div>
    </div>
  );
}

function renderSwitches(c: Colors, state: any, setState: (s: any) => void) {
  const switches = state?.switches ?? [true, false, true];
  const labels = ['Wi-Fi', 'Bluetooth', 'Notifications'];
  return (
    <div>
      {sectionLabel('Switch States')}
      <div style={col(12)}>
        {labels.map((lbl, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 250 }}>
            <span style={{ fontSize: 14, color: c.baseContent }}>{lbl}</span>
            <div onClick={() => { const next = [...switches]; next[i] = !next[i]; setState({ switches: next }); }} style={{
              width: 52, height: 32, borderRadius: R_FULL, padding: 3,
              background: switches[i] ? c.primary : c.base300,
              cursor: 'pointer', transition: TR, position: 'relative',
            }}>
              <div style={{
                width: 26, height: 26, borderRadius: R_FULL, background: '#fff',
                boxShadow: SHADOW_1, transition: TR,
                transform: switches[i] ? 'translateX(20px)' : 'translateX(0)',
              }} />
            </div>
          </div>
        ))}
      </div>
      {sectionLabel('Disabled')}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 250, marginTop: 8, opacity: 0.38 }}>
        <span style={{ fontSize: 14, color: c.baseContent }}>Disabled</span>
        <div style={{
          width: 52, height: 32, borderRadius: R_FULL, padding: 3, background: c.base300,
          cursor: 'not-allowed', position: 'relative',
        }}>
          <div style={{ width: 26, height: 26, borderRadius: R_FULL, background: '#fff', boxShadow: SHADOW_1 }} />
        </div>
      </div>
    </div>
  );
}

function renderTextFields(c: Colors, state: any, setState: (s: any) => void) {
  const filled = state?.filled ?? '';
  const outlined = state?.outlined ?? '';
  const error = state?.error ?? '';
  return (
    <div>
      {sectionLabel('Filled Text Field')}
      <div style={{ maxWidth: 300 }}>
        <div style={{ position: 'relative' }}>
          <input value={filled} onChange={e => setState({ ...state, filled: e.target.value })} placeholder=" "
            style={{
              width: '100%', padding: '24px 16px 8px', fontSize: 14, color: c.baseContent,
              background: c.base200, border: 'none', borderBottom: `2px solid ${c.primary}`,
              borderRadius: '4px 4px 0 0', outline: 'none', boxSizing: 'border-box',
            }} />
          <span style={{
            position: 'absolute', left: 16, top: filled ? 6 : 16, fontSize: filled ? 11 : 14,
            color: c.primary, transition: TR, pointerEvents: 'none',
          }}>Label</span>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, paddingLeft: 16 }}>Supporting text</div>
      </div>
      {sectionLabel('Outlined Text Field')}
      <div style={{ maxWidth: 300, marginTop: 8 }}>
        <div style={{ position: 'relative' }}>
          <input value={outlined} onChange={e => setState({ ...state, outlined: e.target.value })} placeholder=" "
            style={{
              width: '100%', padding: '16px', fontSize: 14, color: c.baseContent,
              background: 'transparent', border: `1px solid ${c.borderColor}`,
              borderRadius: R_SM, outline: 'none', boxSizing: 'border-box',
            }} />
          <span style={{
            position: 'absolute', left: 12, top: outlined ? -8 : 16, fontSize: outlined ? 11 : 14,
            color: outlined ? c.primary : 'var(--text-secondary)', transition: TR, pointerEvents: 'none',
            background: outlined ? c.base100 : 'transparent', padding: '0 4px',
          }}>Email</span>
        </div>
      </div>
      {sectionLabel('Error State')}
      <div style={{ maxWidth: 300, marginTop: 8 }}>
        <input value={error} onChange={e => setState({ ...state, error: e.target.value })} placeholder="Enter value"
          style={{
            width: '100%', padding: '16px', fontSize: 14, color: c.baseContent,
            background: 'transparent', border: `2px solid ${c.error}`,
            borderRadius: R_SM, outline: 'none', boxSizing: 'border-box',
          }} />
        <div style={{ fontSize: 12, color: c.error, marginTop: 4, paddingLeft: 16 }}>Error: This field is required</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   5. NAVIGATION
   ═══════════════════════════════════════════════════════ */

function renderBottomNav(c: Colors, state: any, setState: (s: any) => void) {
  const active = state?.active ?? 0;
  const items = [
    { icon: '\u2302', label: 'Home' },
    { icon: '\u2606', label: 'Favorites' },
    { icon: '\u1F50D', label: 'Search' },
    { icon: '\u263A', label: 'Profile' },
  ];
  return (
    <div>
      {sectionLabel('Bottom Navigation')}
      <div style={{
        display: 'flex', background: c.base200, borderRadius: R, overflow: 'hidden',
        maxWidth: 400, boxShadow: SHADOW_1,
      }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => setState({ active: i })} style={{
            flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4, background: 'transparent', border: 'none',
            cursor: 'pointer', transition: TR, position: 'relative',
          }}>
            {i === active && <div style={{
              position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
              width: 64, height: 32, borderRadius: R_FULL, background: c.base300,
            }} />}
            <span style={{ fontSize: 20, position: 'relative', color: i === active ? c.primary : c.baseContent }}>{item.icon}</span>
            <span style={{ fontSize: 11, fontWeight: i === active ? 600 : 400, color: i === active ? c.primary : 'var(--text-secondary)', position: 'relative' }}>{item.label}</span>
          </button>
        ))}
      </div>
      {sectionLabel('With Badge')}
      <div style={{
        display: 'flex', background: c.base200, borderRadius: R, overflow: 'hidden',
        maxWidth: 400, boxShadow: SHADOW_1, marginTop: 12,
      }}>
        {items.map((item, i) => (
          <button key={i} style={{
            flex: 1, padding: '12px 0', display: 'flex', flexDirection: 'column',
            alignItems: 'center', gap: 4, background: 'transparent', border: 'none',
            cursor: 'pointer', position: 'relative',
          }}>
            <span style={{ fontSize: 20, position: 'relative', color: i === 0 ? c.primary : c.baseContent }}>
              {item.icon}
              {i === 2 && <span style={{
                position: 'absolute', top: -4, right: -8, width: 8, height: 8,
                borderRadius: R_FULL, background: c.error,
              }} />}
            </span>
            <span style={{ fontSize: 11, color: i === 0 ? c.primary : 'var(--text-secondary)' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function renderNavBar(c: Colors, state: any, setState: (s: any) => void) {
  const active = state?.active ?? 0;
  const items = ['Home', 'Explore', 'Library', 'Profile'];
  return (
    <div>
      {sectionLabel('Navigation Bar')}
      <div style={{
        display: 'flex', background: c.base200, borderRadius: R, maxWidth: 400,
        padding: '8px 0', boxShadow: SHADOW_1,
      }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => setState({ active: i })} style={{
            flex: 1, padding: '8px 0', background: 'transparent', border: 'none',
            cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          }}>
            <div style={{
              width: 64, height: 32, borderRadius: R_FULL,
              background: i === active ? c.base300 : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: TR,
            }}>
              <span style={{ fontSize: 18, color: i === active ? c.primary : c.baseContent }}>
                {['\u2302', '\u2600', '\u2630', '\u263A'][i]}
              </span>
            </div>
            <span style={{ fontSize: 12, fontWeight: i === active ? 600 : 400, color: i === active ? c.primary : 'var(--text-secondary)' }}>{item}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function renderNavDrawer(c: Colors, state: any, setState: (s: any) => void) {
  const active = state?.active ?? 0;
  const items = [
    { icon: '\u2709', label: 'Inbox', badge: 24 },
    { icon: '\u2605', label: 'Starred', badge: 0 },
    { icon: '\u23F0', label: 'Snoozed', badge: 0 },
    { icon: '\u27A4', label: 'Sent', badge: 0 },
    { icon: '\u2717', label: 'Trash', badge: 0 },
  ];
  return (
    <div>
      {sectionLabel('Navigation Drawer')}
      <div style={{
        width: 280, borderRadius: R, background: c.base100,
        border: `1px solid ${c.borderColor}`, padding: '12px 0',
      }}>
        <div style={{ padding: '8px 24px 20px', fontSize: 14, fontWeight: 500, color: c.baseContent }}>Mail</div>
        {items.map((item, i) => (
          <button key={i} onClick={() => setState({ active: i })} style={{
            width: '100%', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 12,
            background: i === active ? c.base200 : 'transparent',
            border: 'none', cursor: 'pointer', transition: TR, textAlign: 'left',
            borderRadius: i === active ? '0 28px 28px 0' : 0, marginRight: 12,
          }}>
            <span style={{ fontSize: 18, color: i === active ? c.primary : c.baseContent }}>{item.icon}</span>
            <span style={{ flex: 1, fontSize: 14, fontWeight: i === active ? 600 : 400, color: i === active ? c.primary : c.baseContent }}>{item.label}</span>
            {item.badge > 0 && <span style={{ fontSize: 12, fontWeight: 600, color: c.baseContent }}>{item.badge}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function renderNavRail(c: Colors, state: any, setState: (s: any) => void) {
  const active = state?.active ?? 0;
  const items = [
    { icon: '\u2302', label: 'Home' },
    { icon: '\u2606', label: 'Saved' },
    { icon: '\u2709', label: 'Messages' },
    { icon: '\u2699', label: 'Settings' },
  ];
  return (
    <div>
      {sectionLabel('Navigation Rail')}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        width: 80, background: c.base200, borderRadius: R, padding: '12px 0',
        boxShadow: SHADOW_1,
      }}>
        <button style={{
          width: 56, height: 56, borderRadius: 16, background: c.primary, color: c.primaryContent,
          border: 'none', cursor: 'pointer', fontSize: 24, boxShadow: SHADOW_2, marginBottom: 8,
        }}>+</button>
        {items.map((item, i) => (
          <button key={i} onClick={() => setState({ active: i })} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
            padding: '4px 0', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%',
          }}>
            <div style={{
              width: 56, height: 32, borderRadius: R_FULL,
              background: i === active ? c.base300 : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: TR,
            }}>
              <span style={{ fontSize: 18, color: i === active ? c.primary : c.baseContent }}>{item.icon}</span>
            </div>
            <span style={{ fontSize: 11, fontWeight: i === active ? 600 : 400, color: i === active ? c.primary : 'var(--text-secondary)' }}>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function renderSearch(c: Colors, state: any, setState: (s: any) => void) {
  const query = state?.query ?? '';
  const expanded = state?.expanded ?? false;
  const suggestions = ['Material Design', 'Material You', 'Material Components', 'Material Theme Builder'];
  const filtered = query ? suggestions.filter(s => s.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div>
      {sectionLabel('Search Bar')}
      <div style={{
        maxWidth: 400, borderRadius: R_FULL, background: c.base200,
        display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
        border: expanded ? `1px solid ${c.primary}` : `1px solid transparent`, transition: TR,
      }}>
        <span style={{ fontSize: 18, color: 'var(--text-secondary)' }}>&#128269;</span>
        <input value={query} onChange={e => setState({ ...state, query: e.target.value })}
          onFocus={() => setState({ ...state, expanded: true })}
          onBlur={() => setTimeout(() => setState({ ...state, expanded: false }), 150)}
          placeholder="Search..."
          style={{
            flex: 1, padding: '14px 0', fontSize: 14, background: 'transparent',
            border: 'none', outline: 'none', color: c.baseContent,
          }} />
        {query && <button onClick={() => setState({ ...state, query: '' })} style={{
          background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-secondary)',
        }}>&#10005;</button>}
      </div>
      {expanded && filtered.length > 0 && (
        <div style={{
          maxWidth: 400, marginTop: 4, borderRadius: R, background: c.base100,
          border: `1px solid ${c.borderColor}`, boxShadow: SHADOW_2, overflow: 'hidden',
        }}>
          {filtered.map((s, i) => (
            <div key={i} onClick={() => setState({ ...state, query: s })} style={{
              padding: '10px 16px', cursor: 'pointer', fontSize: 14, color: c.baseContent,
              borderBottom: i < filtered.length - 1 ? `1px solid ${c.borderColor}` : 'none',
            }}>{s}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function renderTabs(c: Colors, state: any, setState: (s: any) => void) {
  const active = state?.active ?? 0;
  const active2 = state?.active2 ?? 0;
  const items = ['Tab 1', 'Tab 2', 'Tab 3'];
  return (
    <div>
      {sectionLabel('Primary Tabs')}
      <div style={{ borderBottom: `1px solid ${c.borderColor}`, display: 'flex', maxWidth: 400 }}>
        {items.map((item, i) => (
          <button key={i} onClick={() => setState({ ...state, active: i })} style={{
            flex: 1, padding: '12px 16px', background: 'transparent', border: 'none',
            borderBottom: i === active ? `3px solid ${c.primary}` : '3px solid transparent',
            color: i === active ? c.primary : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 14, fontWeight: 500, transition: TR,
          }}>{item}</button>
        ))}
      </div>
      <div style={{ padding: 16, fontSize: 14, color: 'var(--text-secondary)' }}>
        Content for {items[active]}
      </div>
      {sectionLabel('Secondary Tabs')}
      <div style={{ borderBottom: `1px solid ${c.borderColor}`, display: 'flex', maxWidth: 400, marginTop: 8 }}>
        {['All', 'Active', 'Completed'].map((item, i) => (
          <button key={i} onClick={() => setState({ ...state, active2: i })} style={{
            flex: 1, padding: '10px 16px', background: 'transparent', border: 'none',
            borderBottom: i === active2 ? `2px solid ${c.baseContent}` : '2px solid transparent',
            color: i === active2 ? c.baseContent : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: TR,
          }}>{item}</button>
        ))}
      </div>
    </div>
  );
}

function renderTopAppBar(c: Colors) {
  return (
    <div>
      {sectionLabel('Top App Bar Types')}
      <div style={col(16)}>
        <div style={{
          display: 'flex', alignItems: 'center', padding: '12px 16px', background: c.base200,
          borderRadius: R, maxWidth: 400, gap: 16,
        }}>
          <span style={{ fontSize: 18, cursor: 'pointer', color: c.baseContent }}>&larr;</span>
          <span style={{ flex: 1, fontSize: 18, fontWeight: 400, color: c.baseContent }}>Title</span>
          <span style={{ fontSize: 18, color: c.baseContent }}>&#8942;</span>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Medium</div>
          <div style={{
            padding: '12px 16px', background: c.base200, borderRadius: R, maxWidth: 400,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <span style={{ fontSize: 18, cursor: 'pointer', color: c.baseContent }}>&larr;</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 18, color: c.baseContent }}>&#128269;</span>
              <span style={{ fontSize: 18, color: c.baseContent }}>&#8942;</span>
            </div>
            <div style={{ fontSize: 24, fontWeight: 400, color: c.baseContent, paddingLeft: 4 }}>Medium Title</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>Large</div>
          <div style={{
            padding: '12px 16px', background: c.base200, borderRadius: R, maxWidth: 400,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <span style={{ fontSize: 18, cursor: 'pointer', color: c.baseContent }}>&larr;</span>
              <span style={{ flex: 1 }} />
              <span style={{ fontSize: 18, color: c.baseContent }}>&#128269;</span>
              <span style={{ fontSize: 18, color: c.baseContent }}>&#8942;</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 400, color: c.baseContent, paddingLeft: 4 }}>Large Title</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

function ComponentPreview({ comp, c }: { comp: ComponentDef; c: Colors }) {
  const [state, setState] = useState<any>({});
  return (
    <div style={{ padding: 20, background: 'var(--bg-secondary)', borderRadius: R, border: '1px solid var(--border-color)', marginBottom: 16 }}>
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>{comp.name}</h3>
      {comp.render(c, state, setState)}
    </div>
  );
}

export function PreviewPanel({ tokenSet, components, selectedComponent, splitView, currentTheme }: Props) {
  const tokens = tokenSet?.tokens ?? [];
  const categories = buildCategories();

  if (!tokenSet) return <p>Loading...</p>;

  const c = getThemeColors(tokens);

  // Find selected component
  if (selectedComponent) {
    for (const cat of categories) {
      const comp = cat.components.find(co => co.id === selectedComponent);
      if (comp) {
        if (splitView) {
          const darkTokens = tokenSet.themes?.themes?.dark?.tokens ?? tokens;
          const cDark = getThemeColors(darkTokens);
          return (
            <div className="split-view">
              <div className="split-pane"><h4>Light</h4><ComponentPreview comp={comp} c={c} /></div>
              <div className="split-pane" style={{ background: '#1a1a2e', color: '#e5e5e5' }}>
                <h4>Dark</h4><ComponentPreview comp={comp} c={cDark} /></div>
            </div>
          );
        }
        return <ComponentPreview comp={comp} c={c} />;
      }
    }
  }

  // Default: show all categories
  return (
    <div>
      {categories.map(cat => (
        <div key={cat.id} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)', borderBottom: `2px solid ${c.primary}`, paddingBottom: 8, display: 'inline-block' }}>{cat.name}</h2>
          {cat.components.map(comp => (
            <ComponentPreview key={comp.id} comp={comp} c={c} />
          ))}
        </div>
      ))}
    </div>
  );
}
