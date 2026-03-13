import type { RynDesignConfig } from '@ryndesign/plugin-api';
import path from 'node:path';
import fs from 'node:fs/promises';

export async function loadConfig(configPath: string = 'ryndesign.config.ts'): Promise<RynDesignConfig | null> {
  const cwd = process.cwd();
  const absolutePath = path.resolve(cwd, configPath);

  try {
    await fs.access(absolutePath);
  } catch {
    return null;
  }

  try {
    const jiti = await import('jiti').then(m => m.default || m);
    const loader = jiti(absolutePath, {
      interopDefault: true,
      esmResolve: true,
    });
    const config = await loader(absolutePath);
    return config.default ?? config;
  } catch (err) {
    // Fallback: try dynamic import
    try {
      const mod = await import(absolutePath);
      return mod.default ?? mod;
    } catch {
      throw new Error(`Failed to load config: ${(err as Error).message}`);
    }
  }
}

// Re-export defineConfig for convenience
export { defineConfig } from '@ryndesign/plugin-api';
