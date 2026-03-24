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
      alias: 'c',
      description: 'Path to config file',
      default: 'ryndesign.config.ts',
    },
    output: {
      type: 'string',
      alias: 'o',
      description: 'Output file path',
      default: 'tokens/figma.tokens.json',
    },
    merge: {
      type: 'boolean',
      description: 'Merge with existing local tokens instead of overwriting',
      default: false,
    },
    strategy: {
      type: 'string',
      description: 'Merge strategy: prefer-remote, prefer-local, remote-only-new',
      default: 'prefer-remote',
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

    const shouldMerge = args.merge as boolean;
    const strategy = args.strategy as string;
    const validStrategies = ['prefer-remote', 'prefer-local', 'remote-only-new'];
    if (shouldMerge && !validStrategies.includes(strategy)) {
      console.error(pc.red(`Invalid merge strategy "${strategy}". Use: ${validStrategies.join(', ')}`));
      process.exit(1);
    }

    try {
      const { fetchFigmaVariables, mapFigmaToTokens, resolveFigmaModes, mergeTokens } = await import('@ryndesign/figma');

      console.log(pc.gray('Fetching variables from Figma...'));

      const variables = await fetchFigmaVariables({
        fileKey,
        personalAccessToken: pat,
      });

      console.log(pc.green(`✓ Fetched ${variables.length} variables`));

      const cwd = process.cwd();
      const modeMapping = config?.figma?.modeMapping;

      if (modeMapping) {
        // Resolve modes into separate files
        const modeFiles = resolveFigmaModes(variables, modeMapping);

        for (const [filePath, tree] of Object.entries(modeFiles)) {
          const absolutePath = path.resolve(cwd, filePath);
          await fs.mkdir(path.dirname(absolutePath), { recursive: true });

          if (shouldMerge) {
            const existing = await readJsonSafe(absolutePath);
            if (existing) {
              // For mode files, filter tokens belonging to this mode
              const modeTokens = variables.filter(t => {
                const modeName = Object.keys(modeMapping).find(m => modeMapping[m] === filePath);
                return modeName && t.modes[modeName] !== undefined;
              });

              const result = mergeTokens(existing, modeTokens, { strategy: strategy as any });
              await fs.writeFile(absolutePath, JSON.stringify(result.merged, null, 2), 'utf-8');
              console.log(pc.green(`  ✓ Merged ${filePath}`) + pc.gray(` (+${result.stats.added} new, ${result.stats.updated} updated, ${result.stats.kept} kept)`));
              continue;
            }
          }

          await fs.writeFile(absolutePath, JSON.stringify(tree, null, 2), 'utf-8');
          console.log(pc.green(`  ✓ Written ${filePath}`));
        }
      } else {
        // Write all to single file
        const outPath = path.resolve(cwd, args.output as string);
        await fs.mkdir(path.dirname(outPath), { recursive: true });

        if (shouldMerge) {
          const existing = await readJsonSafe(outPath);
          if (existing) {
            const result = mergeTokens(existing, variables, { strategy: strategy as any });
            await fs.writeFile(outPath, JSON.stringify(result.merged, null, 2), 'utf-8');
            console.log(pc.green(`  ✓ Merged tokens/figma.tokens.json`) + pc.gray(` (+${result.stats.added} new, ${result.stats.updated} updated, ${result.stats.kept} kept)`));
          } else {
            // No existing file, write fresh
            const tree = mapFigmaToTokens(variables);
            await fs.writeFile(outPath, JSON.stringify(tree, null, 2), 'utf-8');
            console.log(pc.green(`  ✓ Written tokens/figma.tokens.json`));
          }
        } else {
          const tree = mapFigmaToTokens(variables);
          await fs.writeFile(outPath, JSON.stringify(tree, null, 2), 'utf-8');
          console.log(pc.green(`  ✓ Written tokens/figma.tokens.json`));
        }
      }

      console.log(pc.green('\n✓ Figma pull complete!'));
    } catch (err) {
      console.error(pc.red(`Error: ${(err as Error).message}`));
      process.exit(1);
    }
  },
});

async function readJsonSafe(absolutePath: string): Promise<Record<string, unknown> | null> {
  try {
    const content = await fs.readFile(absolutePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}
