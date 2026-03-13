import { defineCommand } from 'citty';
import pc from 'picocolors';

export default defineCommand({
  meta: {
    name: 'preview',
    description: 'Start the design system preview server',
  },
  args: {
    port: {
      type: 'string',
      description: 'Port to run the preview server on',
      default: '4400',
    },
    open: {
      type: 'boolean',
      description: 'Open browser automatically',
      default: true,
    },
  },
  async run({ args }) {
    console.log(pc.cyan('🖥  RynDesign Preview\n'));

    try {
      const { startPreviewServer } = await import('@ryndesign/preview');
      await startPreviewServer({
        port: parseInt(args.port as string, 10),
        open: args.open as boolean,
      });
    } catch {
      console.log(pc.yellow('Preview package not found. Install @ryndesign/preview'));
      console.log(pc.gray('  pnpm add @ryndesign/preview'));
    }
  },
});
