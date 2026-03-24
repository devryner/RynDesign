import { defineCommand } from 'citty';
import pc from 'picocolors';
import { readAndMergeTokenFiles, validateTree, buildTokenSet, postValidate, TokenValidationError } from '@ryndesign/core';
import { loadConfig } from '../config.js';

export default defineCommand({
  meta: {
    name: 'validate',
    description: 'Validate design token files',
  },
  args: {
    path: {
      type: 'positional',
      description: 'Path to token file(s)',
      required: false,
    },
    config: {
      type: 'string',
      alias: 'c',
      description: 'Path to config file',
      default: 'ryndesign.config.ts',
    },
    strict: {
      type: 'boolean',
      description: 'Treat warnings as errors',
      default: false,
    },
  },
  async run({ args }) {
    console.log(pc.cyan('  RynDesign Validate\n'));

    const config = await loadConfig(args.config as string);
    const patterns = args.path
      ? [args.path as string]
      : config?.tokens ?? ['tokens/**/*.tokens.json'];

    try {
      // Step 1: Parse and validate structure
      const tree = await readAndMergeTokenFiles(patterns);
      validateTree(tree);

      // Step 2: Build full token set for post-validation
      const tokenSet = await buildTokenSet({
        tokens: patterns,
        basePath: process.cwd(),
      });

      // Step 3: Post-resolution validation
      const issues = postValidate(tokenSet.tokens, tokenSet.themes);
      const errors = issues.filter(i => i.severity === 'error');
      const warnings = issues.filter(i => i.severity === 'warning');

      // Summary
      console.log(pc.green(`  ${tokenSet.tokens.length} tokens resolved`));
      console.log(pc.green(`  ${tokenSet.groups.length} groups`));
      const themeCount = Object.keys(tokenSet.themes.themes).length;
      if (themeCount > 0) {
        console.log(pc.green(`  ${themeCount} theme(s): ${Object.keys(tokenSet.themes.themes).join(', ')}`));
      }

      if (errors.length > 0) {
        console.error(pc.red(`\n  ${errors.length} error(s):\n`));
        for (const issue of errors) {
          console.error(`  ${pc.red('x')} ${issue.path}: ${issue.message}`);
        }
      }

      if (warnings.length > 0) {
        console.log(pc.yellow(`\n  ${warnings.length} warning(s):\n`));
        for (const issue of warnings) {
          console.log(`  ${pc.yellow('!')} ${issue.path}: ${issue.message}`);
        }
      }

      if (errors.length === 0 && warnings.length === 0) {
        console.log(pc.green('\n  All tokens are valid!'));
      } else if (errors.length === 0) {
        console.log(pc.green('\n  Tokens are valid (with warnings)'));
      }

      // --strict: exit with error if any warnings
      if (args.strict && (errors.length > 0 || warnings.length > 0)) {
        process.exit(1);
      }
      if (errors.length > 0) {
        process.exit(1);
      }
    } catch (err) {
      if (err instanceof TokenValidationError) {
        console.error(pc.red(`  Validation failed with ${err.errors.length} issue(s):\n`));
        for (const issue of err.errors) {
          const icon = issue.severity === 'error' ? pc.red('x') : pc.yellow('!');
          console.error(`  ${icon} ${issue.path.join('.')}: ${issue.message}`);
        }
        process.exit(1);
      }
      throw err;
    }
  },
});
