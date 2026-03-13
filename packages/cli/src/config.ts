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
    const { createJiti } = await import('jiti');
    const loader = createJiti(absolutePath, {
      interopDefault: true,
    });
    const config = await loader.import(absolutePath) as Record<string, unknown>;
    return (config.default ?? config) as RynDesignConfig;
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
