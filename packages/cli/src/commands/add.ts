import { defineCommand } from 'citty';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'node:fs/promises';
import path from 'node:path';

const AVAILABLE_COMPONENTS = ['button', 'input', 'card', 'checkbox', 'toggle', 'badge', 'avatar'];

// Token dependencies for each component
const COMPONENT_TOKENS: Record<string, Record<string, any>> = {
  button: {
    'component.button': {
      $type: 'color',
      primary: {
        background: { $value: '{color.primary}' },
        text: { $value: '{color.white}' },
        hover: { background: { $value: '{color.primary}' } },
        pressed: { background: { $value: '{color.primary}' } },
      },
      secondary: {
        background: { $value: '{color.secondary}' },
        text: { $value: '{color.white}' },
      },
      borderRadius: { $type: 'dimension', $value: '8px' },
      sm: { paddingX: { $type: 'dimension', $value: '12px' }, paddingY: { $type: 'dimension', $value: '6px' }, fontSize: { $type: 'dimension', $value: '14px' } },
      md: { paddingX: { $type: 'dimension', $value: '16px' }, paddingY: { $type: 'dimension', $value: '10px' }, fontSize: { $type: 'dimension', $value: '16px' } },
      lg: { paddingX: { $type: 'dimension', $value: '24px' }, paddingY: { $type: 'dimension', $value: '14px' }, fontSize: { $type: 'dimension', $value: '18px' } },
      disabled: { background: { $value: '{color.gray.300}' } },
    },
  },
};

export default defineCommand({
  meta: {
    name: 'add',
    description: 'Add a component definition',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Component name to add',
      required: false,
    },
    'with-tokens': {
      type: 'boolean',
      description: 'Also scaffold component tokens',
      default: false,
    },
  },
  async run({ args }) {
    const name = args.name as string || await p.select({
      message: 'Choose a component to add:',
      options: AVAILABLE_COMPONENTS.map(c => ({
        value: c,
        label: c.charAt(0).toUpperCase() + c.slice(1),
      })),
    }) as string;

    if (p.isCancel(name)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    const cwd = process.cwd();
    const componentsDir = path.join(cwd, 'components');
    await fs.mkdir(componentsDir, { recursive: true });

    const destPath = path.join(componentsDir, `${name}.component.json`);

    // Check if already exists
    try {
      await fs.access(destPath);
      console.log(pc.yellow(`Component ${name} already exists at ${destPath}`));
      return;
    } catch {
      // Doesn't exist, proceed
    }

    // Try to copy from bundled components
    let copied = false;
    const searchPaths = [
      path.resolve(__dirname, `../../components/${name}.component.json`),
      // ESM fallback
      typeof __dirname !== 'undefined'
        ? path.resolve(__dirname, `../../components/${name}.component.json`)
        : path.resolve(new URL('.', import.meta.url).pathname, `../../components/${name}.component.json`),
    ];

    for (const srcPath of searchPaths) {
      try {
        const content = await fs.readFile(srcPath, 'utf-8');
        await fs.writeFile(destPath, content);
        console.log(pc.green(`  Added ${name} component to ${destPath}`));
        copied = true;
        break;
      } catch {
        continue;
      }
    }

    if (!copied) {
      console.error(pc.red(`Component "${name}" not found in available components.`));
      console.log(pc.gray(`Available: ${AVAILABLE_COMPONENTS.join(', ')}`));
      return;
    }

    // Scaffold component tokens if requested
    const withTokens = args['with-tokens'] as boolean;
    if (withTokens && COMPONENT_TOKENS[name]) {
      const tokensDir = path.join(cwd, 'tokens');
      await fs.mkdir(tokensDir, { recursive: true });
      const tokenFile = path.join(tokensDir, `${name}.tokens.json`);

      try {
        await fs.access(tokenFile);
        console.log(pc.yellow(`  Token file already exists: ${tokenFile}`));
      } catch {
        await fs.writeFile(tokenFile, JSON.stringify(COMPONENT_TOKENS[name], null, 2));
        console.log(pc.green(`  Created component tokens: ${tokenFile}`));
      }
    }
  },
});
