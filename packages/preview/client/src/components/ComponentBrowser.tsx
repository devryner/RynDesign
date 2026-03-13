import React, { useState } from 'react';

interface Props {
  components: any[];
  selected: string | null;
  onSelect: (name: string) => void;
}

export function ComponentBrowser({ components, selected, onSelect }: Props) {
  const [search, setSearch] = useState('');

  const filtered = components.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.definition?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getName = (c: any) => c.definition?.name ?? c.name ?? 'Unknown';

  return (
    <div>
      <input
        className="search-input"
        type="text"
        placeholder="Search components..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <ul className="component-list">
        {filtered.length === 0 && (
          <li style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
            {components.length === 0 ? 'No components loaded' : 'No matches'}
          </li>
        )}
        {filtered.map(c => {
          const name = getName(c);
          return (
            <li
              key={name}
              className={selected === name ? 'active' : ''}
              onClick={() => onSelect(name)}
            >
              {name}
              {c.definition?.category && (
                <span style={{ fontSize: 11, opacity: 0.6, marginLeft: 8 }}>
                  {c.definition.category}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
