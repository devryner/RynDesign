import { defineCommand } from 'citty';
import pc from 'picocolors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { loadConfig } from '../config.js';

export default defineCommand({
  meta: {
    name: 'pull',
    description: 'Pull design tokens from Figma',
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
    console.log(pc.cyan('📥 Figma Pull\n'));

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
      const { fetchFigmaVariables, mapFigmaToTokens } = await import('@ryndesign/figma');
      const { resolveFigmaModes } = await import('@ryndesign/figma');

      console.log(pc.gray('Fetching variables from Figma...'));

      const variables = await fetchFigmaVariables({
        fileKey,
        personalAccessToken: pat,
      });

      console.log(pc.green(`✓ Fetched ${variables.length} variables`));

      // Check for mode mapping in config
      const modeMapping = config?.figma?.modeMapping;

      if (modeMapping) {
        // Resolve modes into separate files
        const modeFiles = resolveFigmaModes(variables, modeMapping);
        const cwd = process.cwd();

        for (const [filePath, tree] of Object.entries(modeFiles)) {
          const absolutePath = path.resolve(cwd, filePath);
          await fs.mkdir(path.dirname(absolutePath), { recursive: true });
          await fs.writeFile(absolutePath, JSON.stringify(tree, null, 2), 'utf-8');
          console.log(pc.green(`  ✓ Written ${filePath}`));
        }
      } else {
        // Write all to single file
        const tree = mapFigmaToTokens(variables);
        const cwd = process.cwd();
        const outPath = path.resolve(cwd, 'tokens/figma.tokens.json');
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        await fs.writeFile(outPath, JSON.stringify(tree, null, 2), 'utf-8');
        console.log(pc.green(`  ✓ Written tokens/figma.tokens.json`));
      }

      console.log(pc.green('\n✓ Figma pull complete!'));
    } catch (err) {
      console.error(pc.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  },
});
