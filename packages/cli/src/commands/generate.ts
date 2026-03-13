import { defineCommand } from 'citty';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs/promises';
import { buildTokenSet, loadComponents, resolveComponent, createGeneratorHelpers } from '@ryndesign/core';
import { loadConfig } from '../config.js';
import type { GeneratedFile, GeneratorPlugin } from '@ryndesign/plugin-api';

export default defineCommand({
  meta: {
    name: 'generate',
    description: 'Generate design system files for target platforms',
  },
  args: {
    platforms: {
      type: 'string',
      description: 'Comma-separated list of platforms to generate',
    },
    watch: {
      type: 'boolean',
      description: 'Watch for changes and regenerate',
      default: false,
    },
    clean: {
      type: 'boolean',
      description: 'Clean output directory before generating',
      default: false,
    },
    config: {
      type: 'string',
      description: 'Path to config file',
      default: 'ryndesign.config.ts',
    },
  },
  async run({ args }) {
    console.log(pc.cyan('⚡ RynDesign Generate\n'));

    const config = await loadConfig(args.config);
    if (!config) {
      console.error(pc.red('Config file not found. Run `ryndesign init` first.'));
      process.exit(1);
    }

    const cwd = process.cwd();

    // Clean output directory if requested
    if (args.clean && config.outDir) {
      const outDir = path.resolve(cwd, config.outDir);
      await fs.rm(outDir, { recursive: true, force: true });
      await fs.mkdir(outDir, { recursive: true });
      console.log(pc.yellow(`Cleaned ${config.outDir}/`));
    }

    // Build token set
    console.log(pc.gray('Building token set...'));
    const tokenSet = await buildTokenSet({
      tokens: config.tokens,
      basePath: cwd,
      themes: config.themes as any,
      name: 'design-system',
    });

    console.log(pc.green(`✓ Resolved ${tokenSet.tokens.length} tokens`));
    if (Object.keys(tokenSet.themes.themes).length > 0) {
      console.log(pc.green(`✓ Resolved themes: ${Object.keys(tokenSet.themes.themes).join(', ')}`));
    }

    // Filter generators by platform if specified
    let generators = config.generators ?? [];
    if (args.platforms) {
      const targetPlatforms = (args.platforms as string).split(',').map(s => s.trim());
      generators = generators.filter(g => targetPlatforms.includes(g.name));
    }

    if (generators.length === 0) {
      console.log(pc.yellow('No generators configured. Add generators to your ryndesign.config.ts'));
      return;
    }

    // Load and resolve components
    const components = config.components
      ? await loadComponents(config.components, cwd)
      : [];

    if (components.length > 0) {
      console.log(pc.green(`✓ Loaded ${components.length} component(s)`));
    }

    // Run generators
    const allFiles: GeneratedFile[] = [];
    for (const generator of generators) {
      console.log(pc.gray(`\nGenerating ${generator.displayName}...`));

      const ctx = {
        tokenSet,
        config: { outDir: config.outDir ?? 'generated', ...generator },
        outputDir: path.resolve(cwd, config.outDir ?? 'generated'),
        helpers: createGeneratorHelpers(),
      };

      // Generate tokens
      const tokenFiles = await generator.generateTokens(ctx);
      allFiles.push(...tokenFiles);

      for (const file of tokenFiles) {
        const filePath = path.resolve(ctx.outputDir, file.path);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, file.content, 'utf-8');
      }

      // Generate components
      for (const compDef of components) {
        const resolvedComp = resolveComponent(compDef, tokenSet);
        const compFiles = await generator.generateComponent(resolvedComp, ctx);
        allFiles.push(...compFiles);

        for (const file of compFiles) {
          const filePath = path.resolve(ctx.outputDir, file.path);
          await fs.mkdir(path.dirname(filePath), { recursive: true });
          await fs.writeFile(filePath, file.content, 'utf-8');
        }
      }

      console.log(pc.green(`  ✓ ${tokenFiles.length + components.length} files generated for ${generator.displayName}`));
    }

    // Run hooks
    if (config.hooks?.['generate:complete']) {
      await config.hooks['generate:complete'](allFiles);
    }

    console.log(pc.green(`\n✓ Generation complete! ${allFiles.length} files written.`));

    // Watch mode
    if (args.watch) {
      console.log(pc.cyan('\nWatching for changes...'));
      const { watch } = await import('chokidar');
      const watcher = watch(config.tokens, {
        cwd,
        ignoreInitial: true,
      });

      watcher.on('change', async (changedPath) => {
        console.log(pc.gray(`\nFile changed: ${changedPath}`));
        try {
          // Re-run the generate (simplified - in real implementation would be incremental)
          const newTokenSet = await buildTokenSet({
            tokens: config.tokens,
            basePath: cwd,
            themes: config.themes as any,
          });
          console.log(pc.green('✓ Rebuilt tokens'));
        } catch (err) {
          console.error(pc.red(`Error: ${(err as Error).message}`));
        }
      });
    }
  },
});

