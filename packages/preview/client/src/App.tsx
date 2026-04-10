import React, { useState, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useTokens } from './hooks/useTokens';
import { PreviewPanel } from './components/PreviewPanel';
import { CodeViewer } from './components/CodeViewer';
import { TokenEditor } from './components/TokenEditor';
import { ListViewPage, AuthPage, SettingsPage } from './components/ExamplePages';

type ViewTab = 'components' | 'listview' | 'auth' | 'settings';

export default function App() {
  const [activeTab, setActiveTab] = useState<ViewTab>('components');
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentPlatform, setCurrentPlatform] = useState<'react' | 'swiftui'>('react');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { connected, send, tokenSet, components, snippets, requestSnippets } = useWebSocket();
  const { updateToken } = useTokens(send);

  const handleThemeChange = useCallback((theme: string) => {
    setCurrentTheme(theme);
    document.documentElement.setAttribute('data-app-theme', theme === 'light' ? '' : theme);
    send({ type: 'theme-change', theme });
  }, [send]);

  const handleTokenUpdate = useCallback((path: string, value: unknown) => {
    updateToken(path, value, currentTheme === 'light' ? undefined : currentTheme);
  }, [updateToken, currentTheme]);

  const handleComponentSelect = useCallback((name: string) => {
    setSelectedComponent(name || null);
    if (name) requestSnippets(currentPlatform, name);
  }, [currentPlatform, requestSnippets]);

  const handlePlatformChange = useCallback((platform: 'react' | 'swiftui') => {
    setCurrentPlatform(platform);
    if (selectedComponent) {
      requestSnippets(platform, selectedComponent);
    }
  }, [selectedComponent, requestSnippets]);

  const tabs: { id: ViewTab; label: string; icon: string }[] = [
    { id: 'components', label: 'Components', icon: '\u25A6' },
    { id: 'listview', label: 'List View', icon: '\u2630' },
    { id: 'auth', label: 'Auth', icon: '\u26BF' },
    { id: 'settings', label: 'Settings', icon: '\u2699' },
  ];

  const themes = tokenSet ? ['light', ...Object.keys(tokenSet.themes?.themes || {})] : ['light'];

  return (
    <div className="app" data-sidebar={sidebarCollapsed ? 'collapsed' : 'open'}>
      {/* ─── Top Navigation ─── */}
      <header className="topbar">
        <div className="topbar-left">
          <div className="logo">
            <span className="logo-icon">R</span>
            <span className="logo-text">RynDesign</span>
          </div>
          <nav className="tab-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-icon">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="topbar-right">
          {activeTab === 'components' && (
            <div className="platform-switch">
              {(['react', 'swiftui'] as const).map(p => (
                <button
                  key={p}
                  className={`platform-btn ${p === currentPlatform ? 'active' : ''}`}
                  onClick={() => handlePlatformChange(p)}
                >
                  {p === 'react' ? 'React' : 'SwiftUI'}
                </button>
              ))}
            </div>
          )}
          <div className="theme-switch">
            {themes.map(t => (
              <button
                key={t}
                className={`theme-btn ${t === currentTheme ? 'active' : ''}`}
                onClick={() => handleThemeChange(t)}
              >
                {t === 'light' ? '\u2600' : t === 'dark' ? '\u263D' : t}
              </button>
            ))}
          </div>
          <div className="connection-status">
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
          </div>
        </div>
      </header>

      {/* ─── Sidebar: Token Editor ─── */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{!sidebarCollapsed && 'Design Tokens'}</h2>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? '\u276F' : '\u276E'}
          </button>
        </div>
        {!sidebarCollapsed && (
          <div className="sidebar-content">
            <TokenEditor
              tokens={tokenSet?.tokens ?? []}
              onTokenUpdate={handleTokenUpdate}
            />
          </div>
        )}
      </aside>

      {/* ─── Main Preview Area ─── */}
      <main className="main-content">
        {activeTab === 'components' && (
          <>
            <PreviewPanel
              tokenSet={tokenSet}
              components={components}
              selectedComponent={selectedComponent}
              onSelectComponent={handleComponentSelect}
              currentTheme={currentTheme}
            />
            <div className="code-section">
              <h3 className="code-section-title">Generated Code</h3>
              <CodeViewer
                snippets={snippets}
                platform={currentPlatform}
                component={selectedComponent}
                tokenSet={tokenSet}
              />
            </div>
          </>
        )}
        {activeTab === 'listview' && (
          <ListViewPage tokenSet={tokenSet} />
        )}
        {activeTab === 'auth' && (
          <AuthPage tokenSet={tokenSet} />
        )}
        {activeTab === 'settings' && (
          <SettingsPage tokenSet={tokenSet} />
        )}
      </main>

      <style>{globalStyles}</style>
    </div>
  );
}

const globalStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }

:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-sidebar: #f1f3f5;
  --bg-hover: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #868e96;
  --text-muted: #adb5bd;
  --border-color: #dee2e6;
  --accent: #228be6;
  --accent-light: #e7f5ff;
  --accent-dark: #1971c2;
  --radius: 8px;
  --sidebar-width: 320px;
  --topbar-height: 56px;
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-app-theme="dark"] {
  --bg-primary: #1a1b1e;
  --bg-secondary: #25262b;
  --bg-sidebar: #2c2e33;
  --bg-hover: #373a40;
  --text-primary: #e9ecef;
  --text-secondary: #909296;
  --text-muted: #5c5f66;
  --border-color: #373a40;
  --accent: #4dabf7;
  --accent-light: #1b2838;
  --accent-dark: #74c0fc;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
  -webkit-font-smoothing: antialiased;
}

/* ─── Layout ─── */
.app {
  display: grid;
  grid-template:
    "topbar topbar" var(--topbar-height)
    "sidebar main" 1fr
    / var(--sidebar-width) 1fr;
  height: 100vh;
  overflow: hidden;
}

.app[data-sidebar="collapsed"] {
  grid-template-columns: 48px 1fr;
}

/* ─── Top Bar ─── */
.topbar {
  grid-area: topbar;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  z-index: 10;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
}

.logo-text {
  color: var(--text-primary);
}

/* ─── Tab Navigation ─── */
.tab-nav {
  display: flex;
  gap: 2px;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.tab-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.tab-btn.active {
  background: var(--accent);
  color: #fff;
}

.tab-icon {
  font-size: 14px;
}

/* ─── Platform & Theme Switches ─── */
.platform-switch, .theme-switch {
  display: flex;
  gap: 2px;
  background: var(--bg-primary);
  border-radius: 8px;
  padding: 2px;
  border: 1px solid var(--border-color);
}

.platform-btn, .theme-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.platform-btn.active, .theme-btn.active {
  background: var(--accent);
  color: #fff;
}

.connection-status {
  display: flex;
  align-items: center;
  padding-left: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-dot.connected { background: #40c057; }
.status-dot.disconnected { background: #fa5252; }

/* ─── Sidebar ─── */
.sidebar {
  grid-area: sidebar;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: var(--transition);
}

.sidebar.collapsed {
  align-items: center;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  min-height: 44px;
}

.sidebar-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sidebar-toggle {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: var(--transition);
}

.sidebar-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.sidebar-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

/* ─── Main Content ─── */
.main-content {
  grid-area: main;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-primary);
}

.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: transparent;
}

.main-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.code-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.code-section-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--text-primary);
}

/* ─── Token Editor Styles ─── */
.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  font-size: 13px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  transition: var(--transition);
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-light);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.token-group { margin-bottom: 8px; }

.token-group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 8px;
  border-radius: 6px;
  cursor: pointer;
  user-select: none;
  transition: var(--transition);
}

.token-group-header:hover {
  background: var(--bg-hover);
}

.token-group-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.token-group-count {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 400;
}

.token-group-chevron {
  font-size: 10px;
  color: var(--text-muted);
  transition: transform 0.15s ease;
}

.token-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  transition: var(--transition);
}

.token-item:hover {
  background: var(--bg-hover);
}

.token-name {
  flex: 1;
  font-size: 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.token-value {
  font-size: 11px;
  color: var(--text-muted);
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
}

.color-swatch input {
  opacity: 0;
  width: 24px;
  height: 24px;
  cursor: pointer;
  position: absolute;
  top: 0;
  left: 0;
}

.token-input {
  width: 64px;
  padding: 3px 6px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 12px;
  background: var(--bg-primary);
  color: var(--text-primary);
  outline: none;
  font-family: 'SF Mono', 'Fira Code', monospace;
  transition: var(--transition);
}

.token-input:focus {
  border-color: var(--accent);
}

/* ─── Code Viewer ─── */
.code-viewer {
  background: #1e1e1e;
  color: #d4d4d4;
  padding: 16px;
  border-radius: 8px;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.6;
  overflow-x: auto;
  white-space: pre;
  position: relative;
}

.code-viewer .copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  background: #333;
  color: #ccc;
  border: 1px solid #555;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.code-viewer .copy-btn:hover { background: #444; }

.code-tabs { display: flex; gap: 2px; margin-bottom: 0; }

.code-tab {
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-bottom: none;
  border-radius: 6px 6px 0 0;
  background: var(--bg-secondary);
  cursor: pointer;
  font-size: 12px;
  color: var(--text-primary);
}

.code-tab.active {
  background: #1e1e1e;
  color: #d4d4d4;
  border-color: #333;
}

/* ─── Component preview ─── */
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.component-card {
  border: 1px solid var(--border-color);
  border-radius: var(--radius);
  padding: 20px;
  background: var(--bg-secondary);
}

.component-card h4 { margin-bottom: 12px; font-size: 14px; }

/* ─── Animations ─── */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes indeterminate {
  0% { left: -30%; }
  100% { left: 100%; }
}
`;
