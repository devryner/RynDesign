import { defineCommand } from 'citty';
import pc from 'picocolors';
import { buildTokenSet } from '@ryndesign/core';
import { loadConfig } from '../config.js';

export default defineCommand({
  meta: {
    name: 'push',
    description: 'Push design tokens to Figma',
  },
  args: {
    'file-key': {
      type: 'string',
      description: 'Figma file key',
    },
    token: {
      type: 'string',
      description: 'Figma personal access token',
    },
    config: {
      type: 'string',
      description: 'Path to config file',
      default: 'ryndesign.config.ts',
    },
  },
  async run({ args }) {
    console.log(pc.cyan('📤 Figma Push\n'));

    const config = await loadConfig(args.config as string);
    const fileKey = (args['file-key'] as string) || config?.figma?.fileKey;
    const pat = (args.token as string) || config?.figma?.personalAccessToken || process.env.FIGMA_TOKEN;

    if (!fileKey) {
      console.error(pc.red('Missing Figma file key. Use --file-key or set in config.'));
      process.exit(1);
    }
    if (!pat) {
      console.error(pc.red('Missing Figma token. Use --token, set FIGMA_TOKEN env var, or configure in ryndesign.config.ts'));
      process.exit(1);
    }

    try {
      const { pushVariablesToFigma } = await import('@ryndesign/figma');

      const cwd = process.cwd();
      console.log(pc.gray('Building token set...'));

      const tokenSet = await buildTokenSet({
        tokens: config?.tokens ?? ['tokens/**/*.tokens.json'],
        basePath: cwd,
        themes: config?.themes as any,
      });

      console.log(pc.green(`✓ Resolved ${tokenSet.tokens.length} tokens`));
      console.log(pc.gray('Pushing to Figma...'));

      const darkTokens = tokenSet.themes.themes['dark']?.tokens;

      await pushVariablesToFigma({
        fileKey,
        personalAccessToken: pat,
        tokens: tokenSet.tokens,
        darkTokens,
      });

      console.log(pc.green('\n✓ Figma push complete!'));
    } catch (err) {
      console.error(pc.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  },
});
