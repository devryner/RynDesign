import React from 'react';

interface Props {
  currentTheme: string;
  themes: string[];
  onThemeChange: (theme: string) => void;
  onSplitView: () => void;
}

export function ThemeSwitcher({ currentTheme, themes, onThemeChange, onSplitView }: Props) {
  return (
    <div className="theme-switcher">
      {themes.map(t => (
        <button
          key={t}
          className={`theme-btn ${t === currentTheme ? 'active' : ''}`}
          onClick={() => onThemeChange(t)}
        >
          {t}
        </button>
      ))}
      <button className="theme-btn" onClick={onSplitView}>
        Split
      </button>
    </div>
  );
}
