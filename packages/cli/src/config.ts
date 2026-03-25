import type { RynDesignConfig } from '@ryndesign/plugin-api';
import path from 'node:path';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const CONFIG_NAMES = [
  'ryndesign.config.ts',
  'ryndesign.config.js',
  'ryndesign.config.mjs',
  'ryndesign.config.json',
];

export async function loadConfig(configPath?: string): Promise<RynDesignConfig | null> {
  const cwd = process.cwd();

  // If explicit path provided, try only that
  if (configPath) {
    return loadConfigFile(path.resolve(cwd, configPath));
  }

  // Try each config name in order
  for (const name of CONFIG_NAMES) {
    const absolutePath = path.resolve(cwd, name);
    try {
      await fs.access(absolutePath);
      return loadConfigFile(absolutePath);
    } catch {
      continue;
    }
  }

  return null;
}

async function loadConfigFile(absolutePath: string): Promise<RynDesignConfig | null> {
  try {
    await fs.access(absolutePath);
  } catch {
    return null;
  }

  // JSON config
  if (absolutePath.endsWith('.json')) {
    try {
      const content = await fs.readFile(absolutePath, 'utf-8');
      const config = JSON.parse(content) as RynDesignConfig;
      return validateConfig(config, absolutePath);
    } catch (err) {
      throw new Error(`Failed to parse config ${absolutePath}: ${(err as Error).message}`);
    }
  }

  // JS/TS config
  try {
    // Discover all @ryndesign/* packages from the CLI's own node_modules
    // so globally-installed generators are resolvable even without local node_modules.
    const alias = await resolveCliPackageAlias();

    const { createJiti } = await import('jiti');
    const loader = createJiti(absolutePath, {
      interopDefault: true,
      alias,
    });
    const config = await loader.import(absolutePath) as Record<string, unknown>;
    const resolved = (config.default ?? config) as RynDesignConfig;
    return validateConfig(resolved, absolutePath);
  } catch (err) {
    // Fallback: try dynamic import
    try {
      const mod = await import(absolutePath);
      const resolved = mod.default ?? mod;
      return validateConfig(resolved, absolutePath);
    } catch {
      throw new Error(`Failed to load config ${absolutePath}: ${(err as Error).message}`);
    }
  }
}

function validateConfig(config: RynDesignConfig, filePath: string): RynDesignConfig {
  if (!config.tokens || !Array.isArray(config.tokens) || config.tokens.length === 0) {
    throw new Error(`Invalid config in ${filePath}: "tokens" must be a non-empty array of glob patterns`);
  }

  if (config.components && !Array.isArray(config.components)) {
    throw new Error(`Invalid config in ${filePath}: "components" must be an array of glob patterns`);
  }

  if (config.generators && !Array.isArray(config.generators)) {
    throw new Error(`Invalid config in ${filePath}: "generators" must be an array`);
  }

  return config;
}

function getCliRoot(): string {
  if (typeof __dirname !== 'undefined') {
    return path.resolve(__dirname, '..');
  }
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

async function resolvePackageEntry(pkgDir: string): Promise<string> {
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  try {
    const content = await fs.readFile(pkgJsonPath, 'utf-8');
    const pkg = JSON.parse(content) as {
      exports?: { '.'?: { import?: { default?: string } | string } | string };
      module?: string;
    };
    // Prefer exports["."].import.default, then module field, then directory itself
    const exportsEntry = pkg.exports?.['.'];
    if (typeof exportsEntry === 'object' && exportsEntry !== null) {
      const importEntry = (exportsEntry as { import?: { default?: string } | string }).import;
      if (typeof importEntry === 'string') {
        return path.join(pkgDir, importEntry);
      }
      if (typeof importEntry === 'object' && importEntry?.default) {
        return path.join(pkgDir, importEntry.default);
      }
    }
    if (pkg.module) {
      return path.join(pkgDir, pkg.module);
    }
  } catch {
    // fall through
  }
  return pkgDir;
}

async function scanRyndesignPackages(dir: string, alias: Record<string, string>): Promise<void> {
  try {
    const entries = await fs.readdir(dir);
    for (const entry of entries) {
      if (alias[`@ryndesign/${entry}`]) continue; // already found
      const pkgDir = path.join(dir, entry);
      const pkgJsonPath = path.join(pkgDir, 'package.json');
      try {
        await fs.access(pkgJsonPath);
        alias[`@ryndesign/${entry}`] = await resolvePackageEntry(pkgDir);
      } catch {
        // Not a valid package, skip
      }
    }
  } catch {
    // Directory not found, skip
  }
}

async function resolveCliPackageAlias(): Promise<Record<string, string>> {
  const alias: Record<string, string> = {};
  try {
    const cliRoot = getCliRoot();
    alias['@ryndesign/cli'] = await resolvePackageEntry(cliRoot);

    // 1. CLI's own node_modules/@ryndesign/ (direct dependencies)
    await scanRyndesignPackages(path.join(cliRoot, 'node_modules', '@ryndesign'), alias);

    // 2. Global sibling packages: when CLI is at node_modules/@ryndesign/cli,
    //    other generators may be at node_modules/@ryndesign/generator-*
    const parentScope = path.resolve(cliRoot, '..');
    const parentScopeName = path.basename(parentScope);
    if (parentScopeName === '@ryndesign') {
      await scanRyndesignPackages(parentScope, alias);
    }

    // 3. Monorepo: when CLI is at packages/cli, sibling packages are at packages/generator-*
    //    Read each sibling's package.json to check if it's a @ryndesign/* package
    if (parentScopeName !== '@ryndesign') {
      try {
        const siblings = await fs.readdir(parentScope);
        for (const sibling of siblings) {
          const siblingPkgPath = path.join(parentScope, sibling, 'package.json');
          try {
            const content = await fs.readFile(siblingPkgPath, 'utf-8');
            const pkg = JSON.parse(content) as { name?: string };
            if (pkg.name?.startsWith('@ryndesign/') && !alias[pkg.name]) {
              alias[pkg.name] = await resolvePackageEntry(path.join(parentScope, sibling));
            }
          } catch {
            // skip
          }
        }
      } catch {
        // skip
      }
    }
  } catch {
    // CLI packages not discoverable, alias stays empty
  }
  return alias;
}

// Re-export defineConfig for convenience
export { defineConfig } from '@ryndesign/plugin-api';
