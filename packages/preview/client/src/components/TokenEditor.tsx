import React, { useState, useMemo } from 'react';

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

const TYPE_ICONS: Record<string, string> = {
  color: '\u25CF',
  dimension: '\u2195',
  fontWeight: 'W',
  duration: '\u23F1',
  number: '#',
};

export function TokenEditor({ tokens, onTokenUpdate }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => {
    const map: Record<string, any[]> = {};
    for (const token of tokens) {
      const group = token.path[0];
      if (!map[group]) map[group] = [];
      map[group].push(token);
    }
    return map;
  }, [tokens]);

  const filteredGroups = useMemo(() => {
    const result: Record<string, any[]> = {};
    const q = search.toLowerCase();
    for (const [group, groupTokens] of Object.entries(groups)) {
      const filtered = q
        ? groupTokens.filter(t => t.path.join('.').toLowerCase().includes(q))
        : groupTokens;
      if (filtered.length > 0) result[group] = filtered;
    }
    return result;
  }, [groups, search]);

  if (tokens.length === 0) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.3 }}>{'\u2B22'}</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No tokens loaded</p>
        <p style={{ color: 'var(--text-muted)', fontSize: 11, marginTop: 4 }}>
          Start the server with a token file
        </p>
      </div>
    );
  }

  const totalTokens = tokens.length;
  const filteredCount = Object.values(filteredGroups).reduce((s, g) => s + g.length, 0);

  return (
    <div>
      <input
        className="search-input"
        type="text"
        placeholder={`Search ${totalTokens} tokens...`}
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {search && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', padding: '4px 4px 8px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{filteredCount} results</span>
          <button
            onClick={() => setSearch('')}
            style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontSize: 11 }}
          >
            Clear
          </button>
        </div>
      )}
      <div style={{ marginTop: search ? 0 : 8 }}>
        {Object.entries(filteredGroups).map(([group, groupTokens]) => {
          const isCollapsed = collapsed[group] ?? false;
          return (
            <div className="token-group" key={group}>
              <div
                className="token-group-header"
                onClick={() => setCollapsed(prev => ({ ...prev, [group]: !prev[group] }))}
              >
                <span className="token-group-name">
                  <span className="token-group-chevron" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0)' }}>
                    {'\u25BC'}
                  </span>
                  {group}
                  <span className="token-group-count">({groupTokens.length})</span>
                </span>
              </div>
              {!isCollapsed && (
                <div style={{ paddingLeft: 4 }}>
                  {groupTokens.map((token: any) => {
                    const path = token.path.join('.');
                    const value = token.$value;
                    const typeIcon = TYPE_ICONS[value.type] || '?';
                    return (
                      <div className="token-item" key={path}>
                        {value.type === 'color' ? (
                          <div className="color-swatch" style={{ background: value.hex }}>
                            <input
                              type="color"
                              value={value.hex}
                              onChange={e => onTokenUpdate(path, e.target.value)}
                            />
                          </div>
                        ) : (
                          <span style={{
                            width: 24, height: 24, borderRadius: 6,
                            background: 'var(--bg-hover)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: 10, color: 'var(--text-muted)', fontWeight: 600,
                            flexShrink: 0,
                          }}>{typeIcon}</span>
                        )}
                        {value.type === 'dimension' && (
                          <input
                            className="token-input"
                            type="number"
                            value={value.value}
                            onChange={e => onTokenUpdate(path, `${e.target.value}${value.unit}`)}
                            style={{ width: 56 }}
                          />
                        )}
                        {value.type === 'fontWeight' && (
                          <select
                            className="token-input"
                            value={value.value}
                            onChange={e => onTokenUpdate(path, Number(e.target.value))}
                            style={{ width: 64 }}
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
                            style={{ width: 56 }}
                          />
                        )}
                        {value.type === 'duration' && (
                          <input
                            className="token-input"
                            type="number"
                            value={value.value}
                            onChange={e => onTokenUpdate(path, `${e.target.value}${value.unit}`)}
                            style={{ width: 56 }}
                          />
                        )}
                        <span className="token-name">{token.path.slice(1).join('.')}</span>
                        <span className="token-value">{formatValue(value)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
