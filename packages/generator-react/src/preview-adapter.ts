import type { PreviewAdapter, ResolvedComponent } from '@ryndesign/plugin-api';

export class ReactPreviewAdapter implements PreviewAdapter {
  previewSetup(): string {
    return `
      <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
      <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    `;
  }

  renderToPreviewHTML(comp: ResolvedComponent, tokens: Record<string, string>): string {
    const { definition } = comp;
    const name = definition.name;
    const kebab = name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

    // Generate inline styles from tokens
    const styles = Object.entries(tokens)
      .map(([key, value]) => `--${key.replace(/\./g, '-')}: ${value}`)
      .join('; ');

    // Simple HTML approximation for preview
    let html = `<div style="${styles}">\n`;

    if (definition.variants.variant) {
      for (const variant of definition.variants.variant.values) {
        for (const size of definition.variants.size?.values ?? ['md']) {
          html += `  <button class="${kebab} ${kebab}--${variant} ${kebab}--${size}"`;
          html += ` style="margin: 4px;">`;
          html += `${name} ${variant} ${size}`;
          html += `</button>\n`;
        }
      }
    }

    html += '</div>';
    return html;
  }
}
