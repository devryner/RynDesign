import React, { useState } from 'react';
import { getThemeColors } from '../utils/tokenHelpers';

interface ExamplePagesProps {
  tokenSet: any;
  components: any[];
}

type PageId = 'login' | 'dashboard' | 'settings';

export function ExamplePages({ tokenSet }: ExamplePagesProps) {
  const [activePage, setActivePage] = useState<PageId>('login');
  const tokens = tokenSet?.tokens ?? [];
  const c = getThemeColors(tokens);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px', fontSize: 14, fontWeight: active ? 600 : 400,
    color: active ? c.primary : c.baseContent,
    background: active ? c.base100 : 'transparent',
    border: active ? `1px solid ${c.borderColor}` : '1px solid transparent',
    borderBottom: active ? `2px solid ${c.primary}` : '2px solid transparent',
    borderRadius: '8px 8px 0 0', cursor: 'pointer',
  });

  return (
    <div>
      <div style={{ display: 'flex', gap: 2, borderBottom: `1px solid ${c.borderColor}` }}>
        {(['login', 'dashboard', 'settings'] as const).map(p => (
          <button key={p} onClick={() => setActivePage(p)} style={tabStyle(activePage === p)}>
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ padding: '24px 0' }}>
        {activePage === 'login' && <LoginPage c={c} />}
        {activePage === 'dashboard' && <DashboardPage c={c} />}
        {activePage === 'settings' && <SettingsPage c={c} />}
      </div>
    </div>
  );
}

function LoginPage({ c }: { c: ReturnType<typeof getThemeColors> }) {
  return (
    <div style={{ maxWidth: 360, margin: '0 auto' }}>
      <div style={{ background: c.base100, borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 500, textAlign: 'center', color: c.baseContent, marginBottom: 8 }}>Welcome back</h2>
        <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Sign in to your account</p>
        <div style={{ marginBottom: 16 }}>
          <input placeholder="Email" style={{
            width: '100%', padding: '14px 16px', borderRadius: 8, border: `1px solid ${c.borderColor}`,
            background: c.base200, color: c.baseContent, fontSize: 14, boxSizing: 'border-box', outline: 'none',
          }} />
        </div>
        <div style={{ marginBottom: 24 }}>
          <input type="password" placeholder="Password" style={{
            width: '100%', padding: '14px 16px', borderRadius: 8, border: `1px solid ${c.borderColor}`,
            background: c.base200, color: c.baseContent, fontSize: 14, boxSizing: 'border-box', outline: 'none',
          }} />
        </div>
        <button style={{
          width: '100%', padding: '14px', borderRadius: 9999, background: c.primary,
          color: c.primaryContent, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Sign In</button>
        <p style={{ textAlign: 'center', fontSize: 13, color: c.primary, marginTop: 16, cursor: 'pointer' }}>Forgot password?</p>
      </div>
    </div>
  );
}

function DashboardPage({ c }: { c: ReturnType<typeof getThemeColors> }) {
  const stats = [
    { label: 'Users', value: '2,847', change: '+12%', color: c.success },
    { label: 'Revenue', value: '$48.2K', change: '+8%', color: c.primary },
    { label: 'Orders', value: '385', change: '-3%', color: c.error },
  ];
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: c.base100, borderRadius: 12, padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            border: `1px solid ${c.borderColor}`,
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: c.baseContent }}>{s.value}</div>
            <div style={{ fontSize: 12, color: s.color, marginTop: 4 }}>{s.change}</div>
          </div>
        ))}
      </div>
      <div style={{
        background: c.base100, borderRadius: 12, padding: 20,
        border: `1px solid ${c.borderColor}`, height: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)',
      }}>Chart placeholder</div>
    </div>
  );
}

function SettingsPage({ c }: { c: ReturnType<typeof getThemeColors> }) {
  const [switches, setSwitches] = useState([true, false, true]);
  const items = ['Push Notifications', 'Email Updates', 'Dark Mode'];
  return (
    <div style={{ maxWidth: 400 }}>
      {items.map((item, i) => (
        <div key={i} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 0', borderBottom: `1px solid ${c.borderColor}`,
        }}>
          <span style={{ fontSize: 14, color: c.baseContent }}>{item}</span>
          <div onClick={() => { const n = [...switches]; n[i] = !n[i]; setSwitches(n); }} style={{
            width: 52, height: 32, borderRadius: 9999, padding: 3,
            background: switches[i] ? c.primary : c.base300, cursor: 'pointer', transition: 'all 0.2s ease',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 9999, background: '#fff',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)', transition: 'all 0.2s ease',
              transform: switches[i] ? 'translateX(20px)' : 'translateX(0)',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}
