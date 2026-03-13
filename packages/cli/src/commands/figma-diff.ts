import { defineCommand } from 'citty';
import pc from 'picocolors';
import { buildTokenSet } from '@ryndesign/core';
import { loadConfig } from '../config.js';

export default defineCommand({
  meta: {
    name: 'diff',
    description: 'Compare local tokens with Figma',
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
    console.log(pc.cyan('🔍 Figma Diff\n'));

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
      const { fetchFigmaVariables, diffFigmaTokens } = await import('@ryndesign/figma');

      const cwd = process.cwd();

      // Build local tokens
      console.log(pc.gray('Building local token set...'));
      const tokenSet = await buildTokenSet({
        tokens: config?.tokens ?? ['tokens/**/*.tokens.json'],
        basePath: cwd,
        themes: config?.themes as any,
      });

      // Fetch remote tokens
      console.log(pc.gray('Fetching Figma variables...'));
      const remoteTokens = await fetchFigmaVariables({
        fileKey,
        personalAccessToken: pat,
      });

      // Diff
      const result = diffFigmaTokens(tokenSet.tokens, remoteTokens);

      // Display results
      if (result.added.length > 0) {
        console.log(pc.green(`\n+ Added (local only): ${result.added.length}`));
        for (const entry of result.added) {
          console.log(pc.green(`  + ${entry.path}: ${JSON.stringify(entry.local)}`));
        }
      }

      if (result.removed.length > 0) {
        console.log(pc.red(`\n- Removed (Figma only): ${result.removed.length}`));
        for (const entry of result.removed) {
          console.log(pc.red(`  - ${entry.path}: ${JSON.stringify(entry.remote)}`));
        }
      }

      if (result.modified.length > 0) {
        console.log(pc.yellow(`\n~ Modified: ${result.modified.length}`));
        for (const entry of result.modified) {
          console.log(pc.yellow(`  ~ ${entry.path}: ${JSON.stringify(entry.local)} ← ${JSON.stringify(entry.remote)}`));
        }
      }

      console.log(pc.gray(`\n  Unchanged: ${result.unchanged}`));

      const total = result.added.length + result.removed.length + result.modified.length;
      if (total === 0) {
        console.log(pc.green('\n✓ Local and Figma tokens are in sync!'));
      } else {
        console.log(pc.yellow(`\n${total} difference(s) found.`));
      }
    } catch (err) {
      console.error(pc.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  },
});
