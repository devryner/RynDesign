import React, { useState } from 'react';
import { getThemeColors } from '../utils/tokenHelpers';

type Colors = ReturnType<typeof getThemeColors>;

interface PageProps {
  tokenSet: any;
}

/* ═══════════════════════════════════════════════════════
   LIST VIEW PAGE
   Title Bar + List Items + Tab Bar
   ═══════════════════════════════════════════════════════ */

const listData = [
  { title: 'Design System Architecture', subtitle: 'Engineering', author: 'Sarah Kim', date: '2026-04-10', desc: 'New token pipeline with multi-platform support for React, SwiftUI, and Compose.' },
  { title: 'Q2 Brand Refresh', subtitle: 'Design', author: 'Alex Chen', date: '2026-04-09', desc: 'Updated color palette and typography scale based on accessibility audit findings.' },
  { title: 'Mobile App Redesign', subtitle: 'Product', author: 'Jordan Park', date: '2026-04-08', desc: 'Navigation overhaul with bottom tab bar and gesture-based interactions.' },
  { title: 'Component Library v3', subtitle: 'Engineering', author: 'Mina Lee', date: '2026-04-07', desc: 'Migration to Material Design 3 tokens with dynamic color theming.' },
  { title: 'User Research Report', subtitle: 'UX Research', author: 'Chris Yoon', date: '2026-04-06', desc: 'Key insights from 24 usability sessions on the onboarding flow.' },
  { title: 'Accessibility Compliance', subtitle: 'QA', author: 'Taylor Jung', date: '2026-04-05', desc: 'WCAG 2.1 AA compliance checklist and automated testing setup.' },
  { title: 'Performance Optimization', subtitle: 'Engineering', author: 'Davi Ryu', date: '2026-04-04', desc: 'Bundle size reduction and lazy loading for design token assets.' },
  { title: 'Design Token Spec Update', subtitle: 'Design', author: 'Hana Cho', date: '2026-04-03', desc: 'W3C Design Token Community Group draft alignment and alias resolution.' },
];

export function ListViewPage({ tokenSet }: PageProps) {
  const tokens = tokenSet?.tokens ?? [];
  const c = getThemeColors(tokens);
  const [activeTab, setActiveTab] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const tabItems = [
    { icon: '\u2302', label: 'Home' },
    { icon: '\u2606', label: 'Explore' },
    { icon: '\u2665', label: 'Saved' },
    { icon: '\u263A', label: 'Profile' },
  ];

  const filtered = searchQuery
    ? listData.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : listData;

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', background: c.base100, borderRadius: 20, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)', minHeight: 600, border: `1px solid ${c.borderColor}` }}>
      {/* Title Bar */}
      <div style={{ padding: '16px 20px', background: c.primary, color: c.primaryContent, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        {searchOpen ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', color: c.primaryContent, cursor: 'pointer', fontSize: 18 }}>{'\u2190'}</button>
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{ flex: 1, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, padding: '8px 12px', color: c.primaryContent, fontSize: 14, outline: 'none' }}
            />
          </div>
        ) : (
          <>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>RynDesign</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>Design Token Preview</div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setSearchOpen(true)} style={{ background: 'none', border: 'none', color: c.primaryContent, cursor: 'pointer', fontSize: 18 }}>{'\u2315'}</button>
              <button style={{ background: 'none', border: 'none', color: c.primaryContent, cursor: 'pointer', fontSize: 18 }}>{'\u22EE'}</button>
            </div>
          </>
        )}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.map((item, i) => (
          <div
            key={i}
            onClick={() => setSelectedItem(selectedItem === i ? null : i)}
            style={{
              padding: '16px 20px',
              borderBottom: `1px solid ${c.borderColor}`,
              cursor: 'pointer',
              background: selectedItem === i ? c.base200 : 'transparent',
              transition: 'background 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: c.baseContent, lineHeight: 1.3 }}>{item.title}</div>
              <div style={{ fontSize: 11, color: c.primary, fontWeight: 500, whiteSpace: 'nowrap', marginLeft: 12 }}>{item.date}</div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: c.base300, color: c.baseContent, fontWeight: 500 }}>{item.subtitle}</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{item.author}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: selectedItem === i ? 10 : 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.desc}</div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{'\u2049'}</div>
            No results found
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', borderTop: `1px solid ${c.borderColor}`, background: c.base100, flexShrink: 0 }}>
        {tabItems.map((tab, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            style={{
              flex: 1, padding: '10px 0', border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              color: activeTab === i ? c.primary : 'var(--text-secondary)',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: activeTab === i ? 600 : 400 }}>{tab.label}</span>
            {activeTab === i && (
              <div style={{ width: 20, height: 3, borderRadius: 2, background: c.primary, marginTop: 2 }} />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   AUTH PAGE
   Login / Sign Up with Social Providers
   ═══════════════════════════════════════════════════════ */

function SocialButton({ icon, label, bg, fg, border, onClick }: { icon: React.ReactNode; label: string; bg: string; fg: string; border?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '12px 16px', borderRadius: 12, border: border || 'none',
      background: bg, color: fg, fontSize: 14, fontWeight: 500, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      transition: 'all 0.15s ease',
    }}>
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}

export function AuthPage({ tokenSet }: PageProps) {
  const tokens = tokenSet?.tokens ?? [];
  const c = getThemeColors(tokens);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const isLogin = mode === 'login';

  return (
    <div style={{ maxWidth: 420, margin: '0 auto' }}>
      <div style={{
        background: c.base100, borderRadius: 24,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        border: `1px solid ${c.borderColor}`,
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${c.primary}, ${c.secondary || c.primary})`,
          padding: '40px 32px 32px', textAlign: 'center', color: c.primaryContent,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', fontSize: 28,
          }}>
            {isLogin ? '\u26BF' : '\u270D'}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            {isLogin ? 'Welcome back' : 'Create account'}
          </h2>
          <p style={{ fontSize: 14, opacity: 0.85 }}>
            {isLogin ? 'Sign in to continue' : 'Join us today'}
          </p>
        </div>

        <div style={{ padding: '28px 32px 32px' }}>
          {/* Mode Toggle */}
          <div style={{
            display: 'flex', background: c.base200, borderRadius: 12, padding: 4, marginBottom: 24,
          }}>
            {(['login', 'signup'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px 0', borderRadius: 8, border: 'none',
                background: mode === m ? c.base100 : 'transparent',
                color: mode === m ? c.baseContent : 'var(--text-secondary)',
                fontWeight: mode === m ? 600 : 400, fontSize: 13, cursor: 'pointer',
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}>
                {m === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          {/* Social Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <SocialButton
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
              label={isLogin ? 'Sign in with Google' : 'Sign up with Google'}
              bg={c.base100} fg={c.baseContent} border={`1px solid ${c.borderColor}`}
            />
            <SocialButton
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>}
              label={isLogin ? 'Sign in with Apple' : 'Sign up with Apple'}
              bg="#000" fg="#fff"
            />
            <SocialButton
              icon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>}
              label={isLogin ? 'Sign in with GitHub' : 'Sign up with GitHub'}
              bg={c.base200} fg={c.baseContent} border={`1px solid ${c.borderColor}`}
            />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 1, background: c.borderColor }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>or continue with email</span>
            <div style={{ flex: 1, height: 1, background: c.borderColor }} />
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!isLogin && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Full Name</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${c.borderColor}`, background: c.base200,
                    color: c.baseContent, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                    transition: 'border-color 0.15s ease',
                  }}
                />
              </div>
            )}
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: 10,
                  border: `1px solid ${c.borderColor}`, background: c.base200,
                  color: c.baseContent, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                  style={{
                    width: '100%', padding: '12px 40px 12px 14px', borderRadius: 10,
                    border: `1px solid ${c.borderColor}`, background: c.base200,
                    color: c.baseContent, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', fontSize: 14,
                  }}
                >
                  {showPassword ? '\u25C9' : '\u25CE'}
                </button>
              </div>
            </div>
            {!isLogin && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Confirm Password</label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder={'\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022'}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${c.borderColor}`, background: c.base200,
                    color: c.baseContent, fontSize: 14, outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            {!isLogin && (
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', marginTop: 4 }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: c.primary, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  I agree to the <span style={{ color: c.primary, cursor: 'pointer' }}>Terms of Service</span> and <span style={{ color: c.primary, cursor: 'pointer' }}>Privacy Policy</span>
                </span>
              </label>
            )}

            <button style={{
              width: '100%', padding: '14px', borderRadius: 12, border: 'none',
              background: c.primary, color: c.primaryContent, fontSize: 15, fontWeight: 600,
              cursor: 'pointer', marginTop: 4, transition: 'all 0.15s ease',
            }}>
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>

            {isLogin && (
              <p style={{ textAlign: 'center', fontSize: 13, color: c.primary, cursor: 'pointer', marginTop: 4 }}>
                Forgot password?
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   SETTINGS PAGE
   Profile, Notifications, Appearance, Account, Danger Zone
   ═══════════════════════════════════════════════════════ */

function ToggleSwitch({ on, onChange, c }: { on: boolean; onChange: () => void; c: Colors }) {
  return (
    <div onClick={onChange} style={{
      width: 48, height: 28, borderRadius: 99, padding: 3, cursor: 'pointer',
      background: on ? c.primary : c.base300, transition: 'all 0.2s ease', flexShrink: 0,
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: 99, background: '#fff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
        transform: on ? 'translateX(20px)' : 'translateX(0)',
        transition: 'all 0.2s ease',
      }} />
    </div>
  );
}

function SettingsSection({ title, children, c }: { title: string; children: React.ReactNode; c: Colors }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, padding: '0 4px' }}>{title}</h3>
      <div style={{ background: c.base100, borderRadius: 16, border: `1px solid ${c.borderColor}`, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, desc, right, last, c }: { icon: string; label: string; desc?: string; right: React.ReactNode; last?: boolean; c: Colors }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${c.borderColor}`,
    }}>
      <span style={{
        width: 36, height: 36, borderRadius: 10, background: c.base200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: c.baseContent }}>{label}</div>
        {desc && <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{desc}</div>}
      </div>
      {right}
    </div>
  );
}

export function SettingsPage({ tokenSet }: PageProps) {
  const tokens = tokenSet?.tokens ?? [];
  const c = getThemeColors(tokens);
  const [notifications, setNotifications] = useState({ push: true, email: false, sms: true, marketing: false });
  const [appearance, setAppearance] = useState<'light' | 'dark' | 'auto'>('auto');
  const [fontSize, setFontSize] = useState(14);
  const [language, setLanguage] = useState('en');
  const [logoutDialog, setLogoutDialog] = useState(false);

  const chevron = <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{'\u276F'}</span>;

  return (
    <div style={{ maxWidth: 520, margin: '0 auto' }}>
      {/* Profile Section */}
      <div style={{
        background: c.base100, borderRadius: 20, border: `1px solid ${c.borderColor}`,
        padding: 24, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `linear-gradient(135deg, ${c.primary}, ${c.secondary || c.accent})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, color: c.primaryContent, fontWeight: 700, flexShrink: 0,
        }}>JD</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: c.baseContent }}>John Doe</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>john.doe@example.com</div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, background: c.base200, color: c.primary, fontWeight: 600 }}>Pro Plan</span>
          </div>
        </div>
        <button style={{
          padding: '8px 16px', borderRadius: 10, border: `1px solid ${c.borderColor}`,
          background: 'transparent', color: c.primary, fontSize: 13, fontWeight: 500, cursor: 'pointer',
        }}>Edit</button>
      </div>

      {/* Notifications */}
      <SettingsSection title="Notifications" c={c}>
        <SettingsRow icon={'\uD83D\uDD14'} label="Push Notifications" desc="Receive push alerts" c={c}
          right={<ToggleSwitch on={notifications.push} onChange={() => setNotifications(n => ({ ...n, push: !n.push }))} c={c} />} />
        <SettingsRow icon={'\u2709'} label="Email Notifications" desc="Daily digest" c={c}
          right={<ToggleSwitch on={notifications.email} onChange={() => setNotifications(n => ({ ...n, email: !n.email }))} c={c} />} />
        <SettingsRow icon={'\uD83D\uDCF1'} label="SMS Alerts" desc="Important updates only" c={c}
          right={<ToggleSwitch on={notifications.sms} onChange={() => setNotifications(n => ({ ...n, sms: !n.sms }))} c={c} />} />
        <SettingsRow icon={'\uD83D\uDCE2'} label="Marketing" desc="News and offers" c={c} last
          right={<ToggleSwitch on={notifications.marketing} onChange={() => setNotifications(n => ({ ...n, marketing: !n.marketing }))} c={c} />} />
      </SettingsSection>

      {/* Appearance */}
      <SettingsSection title="Appearance" c={c}>
        <div style={{ padding: '16px' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: c.baseContent, marginBottom: 12 }}>Theme</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['light', 'dark', 'auto'] as const).map(t => (
              <button key={t} onClick={() => setAppearance(t)} style={{
                flex: 1, padding: '10px', borderRadius: 10,
                border: appearance === t ? `2px solid ${c.primary}` : `1px solid ${c.borderColor}`,
                background: appearance === t ? c.base200 : 'transparent',
                color: appearance === t ? c.primary : 'var(--text-secondary)',
                fontWeight: appearance === t ? 600 : 400, fontSize: 13, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}>
                <div style={{ fontSize: 20, marginBottom: 4 }}>
                  {t === 'light' ? '\u2600' : t === 'dark' ? '\u263D' : '\u25D1'}
                </div>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${c.borderColor}`, padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: c.baseContent }}>Font Size</span>
            <span style={{ fontSize: 12, color: c.primary, fontWeight: 600 }}>{fontSize}px</span>
          </div>
          <input type="range" min="10" max="20" value={fontSize}
            onChange={e => setFontSize(Number(e.target.value))}
            style={{ width: '100%', accentColor: c.primary }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Small</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Large</span>
          </div>
        </div>
      </SettingsSection>

      {/* Account */}
      <SettingsSection title="Account" c={c}>
        <SettingsRow icon={'\uD83C\uDF10'} label="Language" c={c}
          right={
            <select value={language} onChange={e => setLanguage(e.target.value)} style={{
              padding: '4px 8px', borderRadius: 6, border: `1px solid ${c.borderColor}`,
              background: c.base200, color: c.baseContent, fontSize: 12, outline: 'none',
            }}>
              <option value="en">English</option>
              <option value="ko">Korean</option>
              <option value="ja">Japanese</option>
            </select>
          } />
        <SettingsRow icon={'\uD83D\uDD12'} label="Change Password" c={c} right={chevron} />
        <SettingsRow icon={'\uD83D\uDCBE'} label="Export Data" desc="Download your data" c={c} right={chevron} />
        <SettingsRow icon={'\u2753'} label="Help & Support" c={c} last right={chevron} />
      </SettingsSection>

      {/* Danger Zone */}
      <SettingsSection title="Danger Zone" c={c}>
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={() => setLogoutDialog(true)} style={{
            width: '100%', padding: '12px', borderRadius: 10,
            border: `1px solid ${c.borderColor}`, background: 'transparent',
            color: c.baseContent, fontSize: 14, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>Log Out</button>
          <button style={{
            width: '100%', padding: '12px', borderRadius: 10,
            border: `1px solid ${c.error}`, background: 'transparent',
            color: c.error, fontSize: 14, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}>Delete Account</button>
        </div>
      </SettingsSection>

      {/* Logout Dialog */}
      {logoutDialog && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{
            background: c.base100, borderRadius: 20, padding: 28, width: 320,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            animation: 'slideUp 0.2s ease',
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: c.baseContent, marginBottom: 8 }}>Log Out?</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 24 }}>
              Are you sure you want to log out of your account?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setLogoutDialog(false)} style={{
                flex: 1, padding: '12px', borderRadius: 10,
                border: `1px solid ${c.borderColor}`, background: 'transparent',
                color: c.baseContent, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>Cancel</button>
              <button onClick={() => setLogoutDialog(false)} style={{
                flex: 1, padding: '12px', borderRadius: 10, border: 'none',
                background: c.error, color: '#fff', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              }}>Log Out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
