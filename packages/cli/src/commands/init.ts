import { defineCommand } from 'citty';
import * as p from '@clack/prompts';
import pc from 'picocolors';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export default defineCommand({
  meta: {
    name: 'init',
    description: 'Initialize a new RynDesign project',
  },
  args: {
    template: {
      type: 'string',
      description: 'Template to use (minimal or full)',
      default: 'minimal',
    },
    platforms: {
      type: 'string',
      description: 'Comma-separated list of target platforms',
    },
  },
  async run({ args }) {
    p.intro(pc.bgCyan(pc.black(' RynDesign Init ')));

    const template = args.template || await p.select({
      message: 'Choose a template:',
      options: [
        { value: 'minimal', label: 'Minimal', hint: 'Basic color, spacing, typography tokens' },
        { value: 'full', label: 'Full', hint: 'Complete token set with shadows, borders, gradients' },
      ],
    }) as string;

    if (p.isCancel(template)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    const platformsInput = args.platforms || await p.multiselect({
      message: 'Select target platforms:',
      initialValues: ['react', 'swiftui'],
      options: [
        { value: 'react', label: 'React', hint: 'recommended' },
        { value: 'swiftui', label: 'SwiftUI', hint: 'recommended' },
        { value: 'vue', label: 'Vue' },
        { value: 'svelte', label: 'Svelte' },
        { value: 'rails', label: 'Rails' },
        { value: 'uikit', label: 'UIKit' },
        { value: 'compose', label: 'Jetpack Compose' },
        { value: 'android-view', label: 'Android View' },
      ],
      required: true,
    }) as string[];

    if (p.isCancel(platformsInput)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    const platforms = Array.isArray(platformsInput)
      ? platformsInput
      : (platformsInput as string).split(',').map(s => s.trim());

    const darkMode = await p.confirm({
      message: 'Enable dark mode support?',
      initialValue: true,
    });

    if (p.isCancel(darkMode)) {
      p.cancel('Operation cancelled.');
      process.exit(0);
    }

    const s = p.spinner();
    s.start('Creating project files...');

    const cwd = process.cwd();

    // Create directories
    await fs.mkdir(path.join(cwd, 'tokens'), { recursive: true });
    await fs.mkdir(path.join(cwd, 'components'), { recursive: true });
    await fs.mkdir(path.join(cwd, 'generated'), { recursive: true });

    // Copy template tokens
    // ESM-compatible path resolution
    const templateDir = path.resolve(
      typeof __dirname !== 'undefined'
        ? path.resolve(__dirname, '../../templates')
        : path.resolve(new URL('.', import.meta.url).pathname, '../../templates')
    );
    const templateFile = template === 'full' ? 'full.tokens.json' : 'minimal.tokens.json';

    try {
      const templateContent = await fs.readFile(
        path.join(templateDir, templateFile),
        'utf-8'
      );
      await fs.writeFile(
        path.join(cwd, 'tokens', 'base.tokens.json'),
        templateContent
      );
    } catch {
      // If templates not found, create a basic one inline
      await fs.writeFile(
        path.join(cwd, 'tokens', 'base.tokens.json'),
        JSON.stringify(getDefaultTokens(), null, 2)
      );
    }

    // Create semantic tokens
    await fs.writeFile(
      path.join(cwd, 'tokens', 'semantic.tokens.json'),
      JSON.stringify(getSemanticTokens(), null, 2)
    );

    // Create dark theme if enabled
    if (darkMode) {
      try {
        const darkContent = await fs.readFile(
          path.join(templateDir, 'dark.tokens.json'),
          'utf-8'
        );
        await fs.writeFile(
          path.join(cwd, 'tokens', 'dark.tokens.json'),
          darkContent
        );
      } catch {
        await fs.writeFile(
          path.join(cwd, 'tokens', 'dark.tokens.json'),
          JSON.stringify(getDarkTokens(), null, 2)
        );
      }
    }

    // Create config file
    const configContent = generateConfig(platforms, darkMode as boolean);
    await fs.writeFile(path.join(cwd, 'ryndesign.config.ts'), configContent);

    // Copy button component
    try {
      const buttonComp = await fs.readFile(
        path.join(templateDir, '../components/button.component.json'),
        'utf-8'
      );
      await fs.writeFile(
        path.join(cwd, 'components', 'button.component.json'),
        buttonComp
      );
    } catch {
      // Skip if not found
    }

    // Add generated/ to .gitignore
    const gitignorePath = path.join(cwd, '.gitignore');
    try {
      let gitignore = '';
      try {
        gitignore = await fs.readFile(gitignorePath, 'utf-8');
      } catch {
        // File doesn't exist yet
      }
      if (!gitignore.includes('generated/')) {
        gitignore += (gitignore.endsWith('\n') || gitignore === '' ? '' : '\n') + 'generated/\n';
        await fs.writeFile(gitignorePath, gitignore);
      }
    } catch {
      // Skip if can't write .gitignore
    }

    // Ensure package.json exists, then add scripts and dependencies
    const pkgJsonPath = path.join(cwd, 'package.json');
    let pkg: Record<string, unknown>;
    try {
      const pkgContent = await fs.readFile(pkgJsonPath, 'utf-8');
      pkg = JSON.parse(pkgContent);
    } catch {
      // No package.json yet — create one
      const dirName = path.basename(cwd);
      pkg = {
        name: dirName,
        version: '1.0.0',
        private: true,
        type: 'module',
      };
    }

    if (!pkg.scripts || typeof pkg.scripts !== 'object') pkg.scripts = {};
    const scripts = pkg.scripts as Record<string, string>;
    if (!scripts['generate']) scripts['generate'] = 'ryndesign generate';
    if (!scripts['preview']) scripts['preview'] = 'ryndesign preview';

    // Add generator packages as devDependencies
    if (!pkg.devDependencies || typeof pkg.devDependencies !== 'object') pkg.devDependencies = {};
    const devDeps = pkg.devDependencies as Record<string, string>;
    devDeps['@ryndesign/cli'] = 'latest';
    for (const platform of platforms) {
      devDeps[`@ryndesign/generator-${platform}`] = 'latest';
    }

    await fs.writeFile(pkgJsonPath, JSON.stringify(pkg, null, 2) + '\n');

    s.stop('Project files created!');

    // Install dependencies
    const installSpinner = p.spinner();
    installSpinner.start('Installing dependencies...');
    try {
      const pm = detectPackageManager(cwd);
      execSync(`${pm} install`, { cwd, stdio: 'pipe' });
      installSpinner.stop('Dependencies installed!');
    } catch {
      installSpinner.stop(pc.yellow('Could not auto-install. Run `npm install` manually.'));
    }

    p.note(
      [
        `${pc.green('tokens/')}       - Your design tokens`,
        `${pc.green('components/')}    - Component definitions`,
        `${pc.green('generated/')}     - Generated output (gitignored)`,
        `${pc.green('ryndesign.config.ts')} - Configuration`,
      ].join('\n'),
      'Project structure'
    );

    p.outro(pc.green('Run `ryndesign generate` to generate your design system!'));
  },
});

function generateConfig(platforms: string[], darkMode: boolean): string {
  const imports: string[] = [];
  const generators: string[] = [];

  for (const platform of platforms) {
    const pkgName = `@ryndesign/generator-${platform}`;
    const varName = platform.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    imports.push(`import ${varName} from '${pkgName}';`);

    if (['react', 'vue', 'svelte'].includes(platform)) {
      generators.push(`    ${varName}({
      outDir: 'generated/${platform}',
      cssStrategy: 'css-variables',
      typescript: true,${darkMode ? "\n      darkMode: 'media+class'," : ''}
    })`);
    } else {
      generators.push(`    ${varName}({
      outDir: 'generated/${platform}',
    })`);
    }
  }

  return `import { defineConfig } from '@ryndesign/cli';
${imports.join('\n')}

export default defineConfig({
  tokens: ['tokens/**/*.tokens.json'],
  components: ['components/**/*.component.json'],
  outDir: 'generated',
${darkMode ? `
  themes: {
    default: 'light',
    dark: { file: 'tokens/dark.tokens.json' },
  },
` : ''}
  generators: [
${generators.join(',\n')}
  ],

  preview: { port: 4400, open: true },
});
`;
}

function getDefaultTokens() {
  return {
    color: {
      $type: 'color',
      primary: { $value: '#3B82F6' },
      white: { $value: '#FFFFFF' },
      black: { $value: '#000000' },
      gray: {
        50: { $value: '#F9FAFB' },
        900: { $value: '#111827' },
      },
    },
    spacing: {
      $type: 'dimension',
      sm: { $value: '8px' },
      md: { $value: '16px' },
      lg: { $value: '24px' },
    },
  };
}

function getSemanticTokens() {
  return {
    color: {
      $type: 'color',
      background: {
        primary: { $value: '{color.white}' },
        secondary: { $value: '{color.gray.50}' },
      },
      text: {
        primary: { $value: '{color.gray.900}' },
      },
    },
  };
}

function getDarkTokens() {
  return {
    $description: 'Dark theme overrides',
    $extensions: { 'com.ryndesign.theme': { name: 'dark', extends: 'default' } },
    color: {
      $type: 'color',
      background: {
        primary: { $value: '{color.gray.900}' },
        secondary: { $value: '{color.gray.800}' },
      },
      text: {
        primary: { $value: '{color.gray.50}' },
      },
    },
  };
}

function detectPackageManager(cwd: string): string {
  try {
    const userAgent = process.env.npm_config_user_agent || '';
    if (userAgent.startsWith('pnpm')) return 'pnpm';
    if (userAgent.startsWith('yarn')) return 'yarn';
    if (userAgent.startsWith('bun')) return 'bun';
  } catch {}

  // Check for lock files
  if (existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  if (existsSync(path.join(cwd, 'bun.lockb'))) return 'bun';
  return 'npm';
}
