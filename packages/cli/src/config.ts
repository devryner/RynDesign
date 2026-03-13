import type { RynDesignConfig } from '@ryndesign/plugin-api';
import path from 'node:path';
import fs from 'node:fs/promises';

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
    const { createJiti } = await import('jiti');
    const loader = createJiti(absolutePath, {
      interopDefault: true,
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

// Re-export defineConfig for convenience
export { defineConfig } from '@ryndesign/plugin-api';
