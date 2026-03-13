import { defineCommand } from 'citty';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'node:fs/promises';
import path from 'node:path';

const GENERATORS = ['react', 'vue', 'svelte', 'rails', 'swiftui', 'uikit', 'compose', 'android-view'];

export default defineCommand({
  meta: {
    name: 'eject',
    description: 'Eject a generator for customization',
  },
  args: {
    name: {
      type: 'positional',
      description: 'Generator name to eject',
      required: false,
    },
  },
  async run({ args }) {
    p.intro(pc.bgYellow(pc.black(' RynDesign Eject ')));

    const name = args.name as string || await p.select({
      message: 'Select a generator to eject:',
      options: GENERATORS.map(g => ({ value: g, label: `@ryndesign/generator-${g}` })),
    }) as string;

    if (p.isCancel(name)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    if (!GENERATORS.includes(name)) {
      console.error(pc.red(`Unknown generator: ${name}`));
      console.log(pc.gray(`Available: ${GENERATORS.join(', ')}`));
      process.exit(1);
    }

    const cwd = process.cwd();
    const destDir = path.join(cwd, 'generators', name);

    // Check if already ejected
    try {
      await fs.access(destDir);
      console.error(pc.yellow(`Generator "${name}" already ejected at generators/${name}/`));
      process.exit(0);
    } catch {
      // Doesn't exist, proceed
    }

    const confirm = await p.confirm({
      message: `Eject @ryndesign/generator-${name} to generators/${name}/?`,
      initialValue: true,
    });

    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    const s = p.spinner();
    s.start(`Ejecting generator-${name}...`);

    try {
      // Find the installed package source
      const pkgPath = require.resolve(`@ryndesign/generator-${name}/package.json`, {
        paths: [cwd],
      });
      const pkgDir = path.dirname(pkgPath);
      const srcDir = path.join(pkgDir, 'src');

      // Check if source exists; if not, copy dist
      let sourceDir: string;
      try {
        await fs.access(srcDir);
        sourceDir = srcDir;
      } catch {
        // Fallback to dist
        sourceDir = path.join(pkgDir, 'dist');
      }

      // Create destination
      await fs.mkdir(destDir, { recursive: true });

      // Copy files
      await copyDir(sourceDir, destDir);

      s.stop(`Generator ejected!`);

      p.note(
        [
          `Files copied to: ${pc.green(`generators/${name}/`)}`,
          '',
          'Update your ryndesign.config.ts:',
          pc.gray(`  import customGenerator from './generators/${name}/index.js';`),
          '',
          'Replace the original generator with your custom one.',
        ].join('\n'),
        'Next steps'
      );
    } catch (err) {
      s.stop('Eject failed');
      console.error(pc.red(`Error: ${(err as Error).message}`));

      // Fallback: create a skeleton generator
      s.start('Creating skeleton generator...');
      await createSkeletonGenerator(destDir, name);
      s.stop('Skeleton generator created!');

      p.note(
        [
          `Skeleton created at: ${pc.green(`generators/${name}/`)}`,
          '',
          'Customize the generator files and update your config.',
        ].join('\n'),
        'Next steps'
      );
    }

    p.outro(pc.green('Done!'));
  },
});

async function copyDir(src: string, dest: string): Promise<void> {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function createSkeletonGenerator(dir: string, name: string): Promise<void> {
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase());

  const indexContent = `import type { GeneratorPlugin, GeneratorContext, GeneratedFile, ResolvedComponent } from '@ryndesign/plugin-api';

export default function ${name.replace(/-/g, '')}Generator(options = {}): GeneratorPlugin {
  return {
    name: '${name}',
    displayName: '${pascalName}',
    platform: 'web',
    outputExtensions: ['.ts', '.css'],

    async generateTokens(ctx: GeneratorContext): Promise<GeneratedFile[]> {
      // TODO: Implement token generation
      return [];
    },

    async generateComponent(comp: ResolvedComponent, ctx: GeneratorContext): Promise<GeneratedFile[]> {
      // TODO: Implement component generation
      return [];
    },
  };
}
`;

  await fs.writeFile(path.join(dir, 'index.ts'), indexContent, 'utf-8');
}
