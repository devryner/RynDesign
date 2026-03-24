import { defineCommand } from 'citty';
import pc from 'picocolors';
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

    try {
      const { startPreviewServer } = await import('@ryndesign/preview');
      await startPreviewServer({
        port,
        open: args.open as boolean,
      });
    } catch {
      console.log(pc.yellow('Preview package not found. Install @ryndesign/preview'));
      console.log(pc.gray('  pnpm add @ryndesign/preview'));
    }
  },
});
