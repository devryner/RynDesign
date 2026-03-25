import React, { useState } from 'react';

interface Props {
  components: any[];
  selected: string | null;
  onSelect: (name: string) => void;
}

const CATEGORIES = [
  {
    name: 'Actions',
    items: [
      { id: 'common-buttons', label: 'Common Buttons' },
      { id: 'fab', label: 'FAB' },
      { id: 'extended-fab', label: 'Extended FAB' },
      { id: 'icon-buttons', label: 'Icon Buttons' },
      { id: 'segmented-buttons', label: 'Segmented Buttons' },
    ],
  },
  {
    name: 'Communication',
    items: [
      { id: 'badges', label: 'Badges' },
      { id: 'progress', label: 'Progress Indicators' },
      { id: 'snackbar', label: 'Snackbar' },
    ],
  },
  {
    name: 'Containment',
    items: [
      { id: 'cards', label: 'Cards' },
      { id: 'dialogs', label: 'Dialogs' },
      { id: 'dividers', label: 'Dividers' },
      { id: 'lists', label: 'Lists' },
      { id: 'sheets', label: 'Sheets' },
      { id: 'tooltips', label: 'Tooltips' },
    ],
  },
  {
    name: 'Data Input',
    items: [
      { id: 'checkboxes', label: 'Checkboxes' },
      { id: 'chips', label: 'Chips' },
      { id: 'date-pickers', label: 'Date Pickers' },
      { id: 'time-pickers', label: 'Time Pickers' },
      { id: 'radio-buttons', label: 'Radio Buttons' },
      { id: 'sliders', label: 'Sliders' },
      { id: 'switches', label: 'Switches' },
      { id: 'text-fields', label: 'Text Fields' },
    ],
  },
  {
    name: 'Navigation',
    items: [
      { id: 'bottom-nav', label: 'Bottom Navigation' },
      { id: 'nav-bar', label: 'Navigation Bar' },
      { id: 'nav-drawer', label: 'Navigation Drawer' },
      { id: 'nav-rail', label: 'Navigation Rail' },
      { id: 'search', label: 'Search' },
      { id: 'tabs', label: 'Tabs' },
      { id: 'top-app-bar', label: 'Top App Bar' },
    ],
  },
];

export function ComponentBrowser({ selected, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const allItems = CATEGORIES.flatMap(cat => cat.items);
  const filtered = search
    ? allItems.filter(item => item.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div>
      <input
        className="search-input"
        type="text"
        placeholder="Search components..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {filtered ? (
        <ul className="component-list">
          {filtered.length === 0 && (
            <li style={{ color: 'var(--text-secondary)', fontSize: 13 }}>No matches</li>
          )}
          {filtered.map(item => (
            <li
              key={item.id}
              className={selected === item.id ? 'active' : ''}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </li>
          ))}
        </ul>
      ) : (
        <div>
          {/* Show All option */}
          <ul className="component-list" style={{ marginBottom: 8 }}>
            <li
              className={selected === null ? 'active' : ''}
              onClick={() => onSelect('')}
              style={{ fontWeight: 600 }}
            >
              Show All
            </li>
          </ul>
          {CATEGORIES.map(cat => (
            <div key={cat.name} style={{ marginBottom: 8 }}>
              <div
                onClick={() => setCollapsed({ ...collapsed, [cat.name]: !collapsed[cat.name] })}
                style={{
                  fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5,
                  color: 'var(--text-secondary)', cursor: 'pointer', padding: '6px 12px',
                  userSelect: 'none', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 8, transition: 'transform 0.15s ease', transform: collapsed[cat.name] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>&#9660;</span>
                {cat.name}
              </div>
              {!collapsed[cat.name] && (
                <ul className="component-list">
                  {cat.items.map(item => (
                    <li
                      key={item.id}
                      className={selected === item.id ? 'active' : ''}
                      onClick={() => onSelect(item.id)}
                    >
                      {item.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
