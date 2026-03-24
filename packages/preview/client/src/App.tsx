import React, { useState, useCallback } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useTokens } from './hooks/useTokens';
import { ComponentBrowser } from './components/ComponentBrowser';
import { PreviewPanel } from './components/PreviewPanel';
import { CodeViewer } from './components/CodeViewer';
import { TokenEditor } from './components/TokenEditor';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { ExamplePages } from './components/ExamplePages';

export default function App() {
  const [currentTheme, setCurrentTheme] = useState('light');
  const [currentPlatform, setCurrentPlatform] = useState<'react' | 'swiftui'>('react');
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [splitView, setSplitView] = useState(false);
  const [viewMode, setViewMode] = useState<'components' | 'examples'>('components');

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
    setSelectedComponent(name);
    requestSnippets(currentPlatform, name);
  }, [currentPlatform, requestSnippets]);

  const handlePlatformChange = useCallback((platform: 'react' | 'swiftui') => {
    setCurrentPlatform(platform);
    if (selectedComponent) {
      requestSnippets(platform, selectedComponent);
    }
  }, [selectedComponent, requestSnippets]);

  return (
    <div className="app">
      <header className="header">
        <h1>RynDesign Preview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeSwitcher
            currentTheme={currentTheme}
            themes={tokenSet ? ['light', ...Object.keys(tokenSet.themes?.themes || {})] : ['light']}
            onThemeChange={handleThemeChange}
            onSplitView={() => setSplitView(!splitView)}
          />
          <div className="status">
            <span className={`status-dot ${connected ? 'connected' : 'disconnected'}`} />
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <div className="sidebar-section">
          <h2 className="sidebar-title">Components</h2>
          <ComponentBrowser
            components={components}
            selected={selectedComponent}
            onSelect={handleComponentSelect}
          />
        </div>
        <div className="sidebar-section">
          <h2 className="sidebar-title">Token Editor</h2>
          <TokenEditor
            tokens={tokenSet?.tokens ?? []}
            onTokenUpdate={handleTokenUpdate}
          />
        </div>
      </aside>

      <main className="main">
        <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
          <div className="platform-tabs" style={{ marginBottom: 0 }}>
            <button
              className={`platform-tab ${viewMode === 'components' ? 'active' : ''}`}
              onClick={() => setViewMode('components')}
            >
              Components
            </button>
            <button
              className={`platform-tab ${viewMode === 'examples' ? 'active' : ''}`}
              onClick={() => setViewMode('examples')}
            >
              Examples
            </button>
          </div>
          {viewMode === 'components' && (
            <div className="platform-tabs" style={{ marginBottom: 0, marginLeft: 16 }}>
              {(['react', 'swiftui'] as const).map(p => (
                <button
                  key={p}
                  className={`platform-tab ${p === currentPlatform ? 'active' : ''}`}
                  onClick={() => handlePlatformChange(p)}
                >
                  {p === 'react' ? 'React' : 'SwiftUI'}
                </button>
              ))}
            </div>
          )}
        </div>

        {viewMode === 'components' ? (
          <>
            <PreviewPanel
              tokenSet={tokenSet}
              components={components}
              selectedComponent={selectedComponent}
              splitView={splitView}
              currentTheme={currentTheme}
            />

            <div style={{ marginTop: 24 }}>
              <h3 style={{ fontSize: 14, marginBottom: 12 }}>Generated Code</h3>
              <CodeViewer
                snippets={snippets}
                platform={currentPlatform}
                component={selectedComponent}
                tokenSet={tokenSet}
              />
            </div>
          </>
        ) : (
          <ExamplePages tokenSet={tokenSet} components={components} />
        )}
      </main>

      <footer className="footer">
        <span>RynDesign v0.1.0</span>
      </footer>

      <style>{globalStyles}</style>
    </div>
  );
}

const globalStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --bg-sidebar: #fafafa;
  --text-primary: #1a1a1a;
  --text-secondary: #666;
  --border-color: #e5e5e5;
  --accent: #3B82F6;
}
[data-app-theme="dark"] {
  --bg-primary: #1a1a2e;
  --bg-secondary: #16213e;
  --bg-sidebar: #0f3460;
  --text-primary: #e5e5e5;
  --text-secondary: #a0a0a0;
  --border-color: #333;
  --accent: #60a5fa;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: var(--bg-primary);
  color: var(--text-primary);
}
.app {
  display: grid;
  grid-template: "header header" auto "sidebar main" 1fr "sidebar footer" auto / 300px 1fr;
  height: 100vh;
}
.header {
  grid-area: header; padding: 12px 20px; background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color); display: flex;
  align-items: center; justify-content: space-between;
}
.header h1 { font-size: 18px; font-weight: 600; }
.sidebar {
  grid-area: sidebar; background: var(--bg-sidebar);
  border-right: 1px solid var(--border-color); overflow-y: auto; padding: 16px;
}
.sidebar-section { margin-bottom: 24px; }
.sidebar-title { font-size: 14px; margin-bottom: 12px; font-weight: 600; }
.main { grid-area: main; overflow-y: auto; padding: 24px; }
.footer {
  grid-area: footer; padding: 12px 20px; background: var(--bg-secondary);
  border-top: 1px solid var(--border-color); font-size: 12px;
}
.status { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.status-dot { width: 8px; height: 8px; border-radius: 50%; }
.status-dot.connected { background: #10b981; }
.status-dot.disconnected { background: #ef4444; }
.platform-tabs { display: flex; gap: 4px; margin-bottom: 20px; }
.platform-tab {
  padding: 8px 16px; border: 1px solid var(--border-color); border-radius: 6px;
  background: var(--bg-secondary); cursor: pointer; font-size: 13px;
  color: var(--text-primary);
}
.platform-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
.code-viewer {
  background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px;
  font-family: 'Fira Code', 'Cascadia Code', monospace; font-size: 13px;
  line-height: 1.6; overflow-x: auto; white-space: pre; position: relative;
}
.code-viewer .copy-btn {
  position: absolute; top: 8px; right: 8px; padding: 4px 10px;
  background: #333; color: #ccc; border: 1px solid #555; border-radius: 4px;
  cursor: pointer; font-size: 12px;
}
.code-viewer .copy-btn:hover { background: #444; }
.component-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px; margin-bottom: 24px;
}
.component-card {
  border: 1px solid var(--border-color); border-radius: 8px;
  padding: 20px; background: var(--bg-secondary);
}
.component-card h4 { margin-bottom: 12px; font-size: 14px; }
.split-view { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.split-pane {
  border: 1px solid var(--border-color); border-radius: 8px; padding: 16px;
}
.split-pane h4 { margin-bottom: 12px; font-size: 13px; color: var(--text-secondary); }
.theme-switcher { display: flex; gap: 8px; }
.theme-btn {
  padding: 6px 12px; border: 1px solid var(--border-color); border-radius: 6px;
  background: var(--bg-primary); color: var(--text-primary); cursor: pointer; font-size: 13px;
}
.theme-btn.active { background: var(--accent); color: white; border-color: var(--accent); }
.token-group { margin-bottom: 16px; }
.token-group h3 {
  font-size: 13px; font-weight: 600; margin-bottom: 8px;
  color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;
  cursor: pointer; user-select: none;
}
.token-item {
  display: flex; align-items: center; gap: 8px; padding: 6px 0;
  border-bottom: 1px solid var(--border-color);
}
.token-name { flex: 1; font-size: 13px; font-family: monospace; }
.token-value { font-size: 12px; color: var(--text-secondary); }
.color-swatch {
  width: 24px; height: 24px; border-radius: 4px;
  border: 1px solid var(--border-color); cursor: pointer; position: relative;
  overflow: hidden;
}
.color-swatch input {
  opacity: 0; width: 24px; height: 24px; cursor: pointer;
  position: absolute; top: 0; left: 0;
}
.token-input {
  width: 70px; padding: 2px 6px; border: 1px solid var(--border-color);
  border-radius: 4px; font-size: 12px; background: var(--bg-primary);
  color: var(--text-primary);
}
.component-list { list-style: none; }
.component-list li {
  padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px;
  margin-bottom: 2px;
}
.component-list li:hover { background: var(--bg-secondary); }
.component-list li.active { background: var(--accent); color: white; }
.search-input {
  width: 100%; padding: 8px 12px; border: 1px solid var(--border-color);
  border-radius: 6px; font-size: 13px; margin-bottom: 12px;
  background: var(--bg-primary); color: var(--text-primary);
}
.code-tabs { display: flex; gap: 2px; margin-bottom: 0; }
.code-tab {
  padding: 6px 12px; border: 1px solid var(--border-color); border-bottom: none;
  border-radius: 6px 6px 0 0; background: var(--bg-secondary); cursor: pointer;
  font-size: 12px; color: var(--text-primary);
}
.code-tab.active { background: #1e1e1e; color: #d4d4d4; border-color: #333; }
.variant-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px; margin-bottom: 16px;
}
.variant-cell {
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;
  background: var(--bg-primary); font-size: 11px; color: var(--text-secondary);
}
`;
