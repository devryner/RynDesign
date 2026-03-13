import { defineCommand } from 'citty';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'node:fs/promises';
import path from 'node:path';

const AVAILABLE_COMPONENTS = ['button', 'input', 'card', 'checkbox', 'toggle', 'badge', 'avatar'];

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
    try {
      const srcPath = path.resolve(__dirname, `../../components/${name}.component.json`);
      const content = await fs.readFile(srcPath, 'utf-8');
      await fs.writeFile(destPath, content);
      console.log(pc.green(`✓ Added ${name} component to ${destPath}`));
    } catch {
      console.error(pc.red(`Component "${name}" not found in available components.`));
      console.log(pc.gray(`Available: ${AVAILABLE_COMPONENTS.join(', ')}`));
    }
  },
});
