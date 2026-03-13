import { describe, it, expect } from 'vitest';
import { loadComponents, resolveComponent } from '../component-loader.js';
import { buildTokenSet } from '../pipeline.js';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

const TEMPLATES_DIR = path.resolve(__dirname, '../../../../templates');

async function getTestTokenSet() {
  return buildTokenSet({
    tokens: ['minimal.tokens.json'],
    basePath: TEMPLATES_DIR,
  });
}

describe('loadComponents', () => {
  it('should load component definitions from JSON files', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ryndesign-test-'));
    const componentDef = {
      name: 'Button',
      category: 'actions',
      props: {
        label: { type: 'string', required: true },
      },
      variants: {
        variant: { values: ['primary', 'secondary'], default: 'primary' },
        size: { values: ['sm', 'md', 'lg'], default: 'md' },
      },
      slots: {},
      tokenMapping: {
        backgroundColor: 'color.primary',
        textColor: 'color.white',
        padding: 'spacing.md',
      },
      states: {
        hover: {
          tokenOverrides: {
            backgroundColor: 'color.secondary',
          },
        },
      },
    };

    const filePath = path.join(tmpDir, 'button.component.json');
    await fs.writeFile(filePath, JSON.stringify(componentDef, null, 2));

    const components = await loadComponents(['*.component.json'], tmpDir);
    expect(components.length).toBe(1);
    expect(components[0].name).toBe('Button');
    expect(components[0].category).toBe('actions');
    expect(components[0].variants.variant.default).toBe('primary');

    await fs.rm(tmpDir, { recursive: true });
  });

  it('should return empty array when no files match', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ryndesign-test-'));

    const components = await loadComponents(['*.component.json'], tmpDir);
    expect(components).toEqual([]);

    await fs.rm(tmpDir, { recursive: true });
  });

  it('should throw on invalid JSON', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ryndesign-test-'));
    const filePath = path.join(tmpDir, 'bad.component.json');
    await fs.writeFile(filePath, '{ invalid json }');

    await expect(loadComponents(['*.component.json'], tmpDir)).rejects.toThrow();

    await fs.rm(tmpDir, { recursive: true });
  });

  it('should load and sort multiple component files', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'ryndesign-test-'));

    const comp1 = {
      name: 'Card',
      category: 'layout',
      props: {},
      variants: {},
      slots: {},
      tokenMapping: {},
      states: {},
    };
    const comp2 = {
      name: 'Alert',
      category: 'feedback',
      props: {},
      variants: {},
      slots: {},
      tokenMapping: {},
      states: {},
    };

    await fs.writeFile(path.join(tmpDir, 'card.component.json'), JSON.stringify(comp1));
    await fs.writeFile(path.join(tmpDir, 'alert.component.json'), JSON.stringify(comp2));

    const components = await loadComponents(['*.component.json'], tmpDir);
    expect(components.length).toBe(2);
    // Files are sorted alphabetically
    expect(components[0].name).toBe('Alert');
    expect(components[1].name).toBe('Card');

    await fs.rm(tmpDir, { recursive: true });
  });
});

describe('resolveComponent', () => {
  it('should resolve token mappings to actual token values', async () => {
    const tokenSet = await getTestTokenSet();

    const definition = {
      name: 'Button',
      category: 'actions',
      props: { label: { type: 'string' as const, required: true } },
      variants: {
        variant: { values: ['primary', 'secondary'], default: 'primary' },
        size: { values: ['sm', 'md', 'lg'], default: 'md' },
      },
      slots: {},
      tokenMapping: {
        backgroundColor: 'color.primary',
        textColor: 'color.white',
        padding: 'spacing.md',
      },
      states: {
        hover: {
          tokenOverrides: {
            backgroundColor: 'color.secondary',
          },
        },
      },
    };

    const resolved = resolveComponent(definition, tokenSet);

    expect(resolved.definition.name).toBe('Button');
    expect(resolved.resolvedTokens['backgroundColor']).toBeDefined();
    expect(resolved.resolvedTokens['backgroundColor'].$type).toBe('color');
    expect(resolved.resolvedTokens['textColor']).toBeDefined();
    expect(resolved.resolvedTokens['padding']).toBeDefined();
    expect(resolved.resolvedTokens['padding'].$type).toBe('dimension');
  });

  it('should resolve state token overrides', async () => {
    const tokenSet = await getTestTokenSet();

    const definition = {
      name: 'Button',
      category: 'actions',
      props: {},
      variants: {
        variant: { values: ['primary'], default: 'primary' },
        size: { values: ['md'], default: 'md' },
      },
      slots: {},
      tokenMapping: {
        backgroundColor: 'color.primary',
      },
      states: {
        hover: {
          tokenOverrides: {
            backgroundColor: 'color.secondary',
          },
        },
      },
    };

    const resolved = resolveComponent(definition, tokenSet);

    expect(resolved.resolvedStateTokens['hover']).toBeDefined();
    expect(resolved.resolvedStateTokens['hover']['backgroundColor']).toBeDefined();
    expect(resolved.resolvedStateTokens['hover']['backgroundColor'].$type).toBe('color');
  });

  it('should handle missing token paths gracefully', async () => {
    const tokenSet = await getTestTokenSet();

    const definition = {
      name: 'Widget',
      category: 'misc',
      props: {},
      variants: {
        variant: { values: ['primary'], default: 'primary' },
        size: { values: ['md'], default: 'md' },
      },
      slots: {},
      tokenMapping: {
        backgroundColor: 'color.nonexistent.token',
      },
      states: {},
    };

    const resolved = resolveComponent(definition, tokenSet);

    // Non-existent token should not be in resolved tokens
    expect(resolved.resolvedTokens['backgroundColor']).toBeUndefined();
  });
});
