import { defineCommand } from 'citty';
import pc from 'picocolors';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { loadConfig } from '../config.js';

export default defineCommand({
  meta: {
    name: 'preview',
    description: 'Start the design system preview server',
  },
  args: {
    config: {
      type: 'string',
      alias: 'c',
      description: 'Path to config file',
      default: 'ryndesign.config.ts',
    },
    port: {
      type: 'string',
      description: 'Port to run the preview server on',
    },
    open: {
      type: 'boolean',
      description: 'Open browser automatically',
      default: true,
    },
  },
  async run({ args }) {
    console.log(pc.cyan('🖥  RynDesign Preview\n'));

    const config = await loadConfig(args.config as string);
    const port = args.port
      ? parseInt(args.port as string, 10)
      : config?.preview?.port ?? 4400;

    let previewModule;
    try {
      const localRequire = createRequire(path.resolve(process.cwd(), 'package.json'));
      const previewPath = localRequire.resolve('@ryndesign/preview');
      previewModule = await import(pathToFileURL(previewPath).href);
    } catch {
      // Fallback: try direct import (works when CLI is installed locally)
      try {
        previewModule = await import('@ryndesign/preview');
      } catch {
        console.log(pc.yellow('Preview package not found. Install @ryndesign/preview'));
        console.log(pc.gray('  npm install @ryndesign/preview'));
        return;
      }
    }

    await previewModule.startPreviewServer({
      port,
      open: args.open as boolean,
    });
  },
});
