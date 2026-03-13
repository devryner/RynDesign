import React, { useState, useCallback } from 'react';

interface Props {
  snippets: Record<string, string>;
  platform: string;
  component: string | null;
  tokenSet: any;
}

type CodeTab = 'tokens' | 'component';

function formatTokenValue(value: any): string {
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

function generateTokenPreview(tokenSet: any, platform: string): string {
  if (!tokenSet?.tokens) return '// No tokens loaded';

  if (platform === 'react') {
    let css = '/* tokens.css */\n:root {\n';
    for (const token of tokenSet.tokens.slice(0, 20)) {
      css += `  --${token.path.join('-')}: ${formatTokenValue(token.$value)};\n`;
    }
    if (tokenSet.tokens.length > 20) css += `  /* ... ${tokenSet.tokens.length - 20} more tokens */\n`;
    css += '}';
    return css;
  }

  if (platform === 'swiftui') {
    let swift = '// DesignTokens+Color.swift\nimport SwiftUI\n\nextension Color {\n    enum DesignSystem {\n';
    for (const token of tokenSet.tokens.filter((t: any) => t.$type === 'color').slice(0, 10)) {
      swift += `        static let ${token.path.join('_').replace(/[.-]/g, '_')} = Color(hex: "${token.$value.hex}")\n`;
    }
    swift += '    }\n}';
    return swift;
  }

  return `// ${platform} code generation`;
}

export function CodeViewer({ snippets, platform, component, tokenSet }: Props) {
  const [activeTab, setActiveTab] = useState<CodeTab>('tokens');
  const [copied, setCopied] = useState(false);

  const code = activeTab === 'component' && component
    ? snippets[`${platform}:${component}`] || `// Select a component to view generated code`
    : snippets[`${platform}:tokens`] || generateTokenPreview(tokenSet, platform);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }, [code]);

  return (
    <div>
      <div className="code-tabs">
        <button
          className={`code-tab ${activeTab === 'tokens' ? 'active' : ''}`}
          onClick={() => setActiveTab('tokens')}
        >
          Tokens
        </button>
        <button
          className={`code-tab ${activeTab === 'component' ? 'active' : ''}`}
          onClick={() => setActiveTab('component')}
        >
          Component
        </button>
      </div>
      <div className="code-viewer">
        <button className="copy-btn" onClick={handleCopy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
        {code}
      </div>
    </div>
  );
}
