import React, { useState } from 'react';

interface Props {
  tokens: any[];
  onTokenUpdate: (path: string, value: unknown) => void;
}

function formatValue(value: any): string {
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

export function TokenEditor({ tokens, onTokenUpdate }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  if (tokens.length === 0) {
    return <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No tokens loaded</p>;
  }

  // Group tokens by first path segment
  const groups: Record<string, any[]> = {};
  for (const token of tokens) {
    const group = token.path[0];
    if (!groups[group]) groups[group] = [];
    groups[group].push(token);
  }

  const filteredGroups: Record<string, any[]> = {};
  for (const [group, groupTokens] of Object.entries(groups)) {
    const filtered = search
      ? groupTokens.filter(t => t.path.join('.').toLowerCase().includes(search.toLowerCase()))
      : groupTokens;
    if (filtered.length > 0) {
      filteredGroups[group] = filtered;
    }
  }

  return (
    <div>
      <input
        className="search-input"
        type="text"
        placeholder="Filter tokens..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {Object.entries(filteredGroups).map(([group, groupTokens]) => (
        <div className="token-group" key={group}>
          <h3 onClick={() => setCollapsed(prev => ({ ...prev, [group]: !prev[group] }))}>
            {collapsed[group] ? '▸' : '▾'} {group} ({groupTokens.length})
          </h3>
          {!collapsed[group] && groupTokens.map((token: any) => {
            const path = token.path.join('.');
            const value = token.$value;
            return (
              <div className="token-item" key={path}>
                {value.type === 'color' && (
                  <div className="color-swatch" style={{ background: value.hex }}>
                    <input
                      type="color"
                      value={value.hex}
                      onChange={e => onTokenUpdate(path, e.target.value)}
                    />
                  </div>
                )}
                {value.type === 'dimension' && (
                  <input
                    className="token-input"
                    type="number"
                    value={value.value}
                    onChange={e => onTokenUpdate(path, `${e.target.value}${value.unit}`)}
                    style={{ width: 60 }}
                  />
                )}
                {value.type === 'fontWeight' && (
                  <select
                    className="token-input"
                    value={value.value}
                    onChange={e => onTokenUpdate(path, Number(e.target.value))}
                    style={{ width: 80 }}
                  >
                    {[100, 200, 300, 400, 500, 600, 700, 800, 900].map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                )}
                {value.type === 'number' && (
                  <input
                    className="token-input"
                    type="number"
                    value={value.value}
                    onChange={e => onTokenUpdate(path, Number(e.target.value))}
                    style={{ width: 60 }}
                  />
                )}
                <span className="token-name">{token.path.slice(1).join('.')}</span>
                <span className="token-value">{formatValue(value)}</span>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
