import React, { useState } from 'react';
import { getThemeColors } from '../utils/tokenHelpers';

interface ExamplePagesProps {
  tokenSet: any;
  components: any[];
}

type PageId = 'login' | 'profile' | 'list' | 'dashboard';

export function ExamplePages({ tokenSet, components }: ExamplePagesProps) {
  const [activePage, setActivePage] = useState<PageId>('login');
  const tokens = tokenSet?.tokens ?? [];
  const c = getThemeColors(tokens);

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 20px',
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? c.primary : c.baseContent,
    background: active ? c.base100 : 'transparent',
    border: active ? `1px solid ${c.borderColor}` : '1px solid transparent',
    borderBottom: active ? `2px solid ${c.primary}` : '2px solid transparent',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  });

  const cardStyle: React.CSSProperties = {
    background: c.base100,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    padding: 24,
  };

  const inputStyle: React.CSSProperties = {
    border: `1px solid ${c.borderColor}`,
    borderRadius: 8,
    padding: '10px 14px',
    background: c.base100,
    color: c.baseContent,
    fontSize: 14,
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const btnPrimary: React.CSSProperties = {
    background: c.primary,
    color: c.primaryContent,
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  };

  const btnOutline: React.CSSProperties = {
    background: 'transparent',
    border: `1px solid ${c.borderColor}`,
    color: c.baseContent,
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    width: '100%',
    textAlign: 'center',
  };

  const badgeStyle = (bg: string, color: string): React.CSSProperties => ({
    borderRadius: 9999,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 600,
    background: bg,
    color,
    display: 'inline-block',
  });

  const avatarStyle = (size: number): React.CSSProperties => ({
    width: size,
    height: size,
    borderRadius: '50%',
    background: c.primary,
    color: c.primaryContent,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size * 0.4,
    flexShrink: 0,
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: c.baseContent,
    marginBottom: 6,
    display: 'block',
  };

  // ─── Login Page ──────────────────────────────────────────
  const renderLogin = () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 500 }}>
      <div style={{ ...cardStyle, maxWidth: 400, width: '100%', padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ ...avatarStyle(48), margin: '0 auto 16px', background: c.primary }}>R</div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: c.baseContent, margin: 0 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: c.neutral, marginTop: 6 }}>Sign in to your account to continue</p>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Email</label>
          <input style={inputStyle} type="text" value="user@example.com" readOnly />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Password</label>
          <input style={inputStyle} type="password" value="********" readOnly />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, fontSize: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, color: c.baseContent, cursor: 'pointer' }}>
            <span style={{
              width: 16, height: 16, borderRadius: 4,
              border: `2px solid ${c.primary}`, background: c.primary,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: c.primaryContent, fontSize: 10, fontWeight: 700,
            }}>&#10003;</span>
            Remember me
          </label>
          <span style={{ color: c.primary, cursor: 'pointer' }}>Forgot password?</span>
        </div>

        <button style={btnPrimary}>Sign In</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: c.borderColor }} />
          <span style={{ fontSize: 12, color: c.neutral }}>or</span>
          <div style={{ flex: 1, height: 1, background: c.borderColor }} />
        </div>

        <button style={btnOutline}>Create Account</button>
      </div>
    </div>
  );

  // ─── Profile Page ────────────────────────────────────────
  const renderProfile = () => (
    <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={avatarStyle(80)}>JD</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: c.baseContent, margin: 0 }}>John Doe</h2>
          <p style={{ fontSize: 14, color: c.neutral, margin: '4px 0 10px' }}>Senior Designer</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={badgeStyle(c.primary + '22', c.primary)}>Admin</span>
            <span style={badgeStyle(c.secondary + '22', c.secondary)}>Pro</span>
            <span style={badgeStyle(c.success + '22', c.success)}>Active</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 16 }}>
        {[
          { label: 'Posts', value: '128' },
          { label: 'Followers', value: '1.2k' },
          { label: 'Following', value: '348' },
        ].map((s) => (
          <div key={s.label} style={{ ...cardStyle, flex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: c.baseContent }}>{s.value}</div>
            <div style={{ fontSize: 12, color: c.neutral, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Edit Section */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: c.baseContent, margin: '0 0 16px' }}>Edit Profile</h3>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Name</label>
          <input style={inputStyle} type="text" value="John Doe" readOnly />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Bio</label>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: 'none', fontFamily: 'inherit' }}
            readOnly
            placeholder="Tell us about yourself..."
          />
        </div>
        <button style={{ ...btnPrimary, width: 'auto' }}>Save Changes</button>
      </div>
    </div>
  );

  // ─── List Page ───────────────────────────────────────────
  const listItems = [
    { name: 'Alice Johnson', desc: 'Product Designer', status: 'Active', statusColor: c.success },
    { name: 'Bob Smith', desc: 'Frontend Engineer', status: 'Active', statusColor: c.success },
    { name: 'Carol White', desc: 'Project Manager', status: 'Pending', statusColor: c.warning },
    { name: 'David Kim', desc: 'Backend Engineer', status: 'Inactive', statusColor: c.error },
    { name: 'Emma Lee', desc: 'UX Researcher', status: 'Active', statusColor: c.success },
  ];

  const toggleSwitch = (on: boolean): React.CSSProperties => ({
    width: 40, height: 22, borderRadius: 11,
    background: on ? c.primary : c.borderColor,
    position: 'relative',
    cursor: 'pointer',
    flexShrink: 0,
  });

  const toggleKnob = (on: boolean): React.CSSProperties => ({
    width: 16, height: 16, borderRadius: '50%',
    background: c.base100,
    position: 'absolute',
    top: 3,
    left: on ? 21 : 3,
    transition: 'left 0.15s ease',
    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
  });

  const renderList = () => (
    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Navbar */}
      <div style={{
        ...cardStyle, padding: '12px 20px', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.primary }}>AppName</span>
        <input style={{ ...inputStyle, width: 240 }} type="text" value="Search..." readOnly />
        <div style={avatarStyle(32)}>JD</div>
      </div>

      {/* List Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {listItems.map((item, i) => (
          <div key={i} style={{
            ...cardStyle, padding: '14px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={avatarStyle(40)}>{item.name.split(' ').map(n => n[0]).join('')}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.baseContent }}>{item.name}</div>
              <div style={{ fontSize: 12, color: c.neutral, marginTop: 2 }}>{item.desc}</div>
            </div>
            <span style={badgeStyle(item.statusColor + '22', item.statusColor)}>{item.status}</span>
            <div style={toggleSwitch(item.status === 'Active')}>
              <div style={toggleKnob(item.status === 'Active')} />
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
        {['<', '1', '2', '3', '4', '5', '>'].map((p) => (
          <span key={p} style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, fontSize: 14, fontWeight: p === '2' ? 700 : 400, cursor: 'pointer',
            background: p === '2' ? c.primary : 'transparent',
            color: p === '2' ? c.primaryContent : c.baseContent,
            border: p === '2' ? 'none' : `1px solid ${c.borderColor}`,
          }}>{p}</span>
        ))}
      </div>
    </div>
  );

  // ─── Dashboard Page ──────────────────────────────────────
  const stats = [
    { label: 'Revenue', value: '$12,345', change: '+12%', color: c.success },
    { label: 'Users', value: '1,234', change: '+5%', color: c.success },
    { label: 'Orders', value: '567', change: '-2%', color: c.error },
    { label: 'Conversion', value: '3.2%', change: '+0.5%', color: c.success },
  ];

  const orders = [
    { id: '#ORD-001', customer: 'Alice Johnson', amount: '$234.50', status: 'Completed', statusColor: c.success, date: '2026-03-20' },
    { id: '#ORD-002', customer: 'Bob Smith', amount: '$129.00', status: 'Processing', statusColor: c.warning, date: '2026-03-21' },
    { id: '#ORD-003', customer: 'Carol White', amount: '$567.80', status: 'Completed', statusColor: c.success, date: '2026-03-21' },
    { id: '#ORD-004', customer: 'David Kim', amount: '$89.99', status: 'Cancelled', statusColor: c.error, date: '2026-03-22' },
    { id: '#ORD-005', customer: 'Emma Lee', amount: '$345.00', status: 'Processing', statusColor: c.warning, date: '2026-03-23' },
  ];

  const renderDashboard = () => (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Navbar */}
      <div style={{
        ...cardStyle, padding: '12px 20px', borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: c.baseContent }}>Dashboard</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ fontSize: 18, cursor: 'pointer' }}>&#128276;</span>
            <span style={{
              position: 'absolute', top: -4, right: -6,
              width: 16, height: 16, borderRadius: '50%',
              background: c.error, color: c.primaryContent,
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>3</span>
          </div>
          <div style={avatarStyle(32)}>JD</div>
        </div>
      </div>

      {/* Stat Cards 2x2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {stats.map((s) => (
          <div key={s.label} style={cardStyle}>
            <div style={{ fontSize: 12, color: c.neutral, marginBottom: 4 }}>{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: c.baseContent }}>{s.value}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: s.color }}>{s.change}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Banner */}
      <div style={{
        background: c.info + '18',
        border: `1px solid ${c.info}44`,
        borderRadius: 8,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 14,
        color: c.baseContent,
      }}>
        <span style={{
          width: 22, height: 22, borderRadius: '50%',
          background: c.info, color: c.primaryContent,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, flexShrink: 0,
        }}>i</span>
        System maintenance scheduled for tonight at 11:00 PM UTC.
      </div>

      {/* Orders Table */}
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${c.borderColor}` }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: c.baseContent, margin: 0 }}>Recent Orders</h3>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr style={{ background: c.base200 }}>
              {['Order ID', 'Customer', 'Amount', 'Status', 'Date'].map((h) => (
                <th key={h} style={{
                  padding: '10px 16px', textAlign: 'left',
                  fontWeight: 600, color: c.neutral, fontSize: 12,
                  borderBottom: `1px solid ${c.borderColor}`,
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} style={{ borderBottom: `1px solid ${c.borderColor}` }}>
                <td style={{ padding: '10px 16px', fontWeight: 600, color: c.baseContent }}>{o.id}</td>
                <td style={{ padding: '10px 16px', color: c.baseContent }}>{o.customer}</td>
                <td style={{ padding: '10px 16px', color: c.baseContent }}>{o.amount}</td>
                <td style={{ padding: '10px 16px' }}>
                  <span style={badgeStyle(o.statusColor + '22', o.statusColor)}>{o.status}</span>
                </td>
                <td style={{ padding: '10px 16px', color: c.neutral }}>{o.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress Bar */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: c.baseContent }}>Monthly Target</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: c.primary }}>67%</span>
        </div>
        <div style={{
          height: 10, borderRadius: 5, background: c.base200, overflow: 'hidden',
        }}>
          <div style={{
            width: '67%', height: '100%', borderRadius: 5,
            background: `linear-gradient(90deg, ${c.primary}, ${c.secondary})`,
          }} />
        </div>
        <div style={{ fontSize: 12, color: c.neutral, marginTop: 6 }}>67% complete</div>
      </div>
    </div>
  );

  const pages: Record<PageId, { label: string; render: () => React.ReactNode }> = {
    login: { label: 'Login', render: renderLogin },
    profile: { label: 'Profile', render: renderProfile },
    list: { label: 'List', render: renderList },
    dashboard: { label: 'Dashboard', render: renderDashboard },
  };

  return (
    <div style={{ fontSize: 14, color: c.baseContent }}>
      {/* Tab Bar */}
      <div style={{
        display: 'flex', gap: 4, borderBottom: `1px solid ${c.borderColor}`,
        marginBottom: 24, paddingBottom: 0,
      }}>
        {(Object.keys(pages) as PageId[]).map((id) => (
          <button
            key={id}
            style={tabStyle(activePage === id)}
            onClick={() => setActivePage(id)}
          >
            {pages[id].label}
          </button>
        ))}
      </div>

      {/* Page Content */}
      {pages[activePage].render()}
    </div>
  );
}
