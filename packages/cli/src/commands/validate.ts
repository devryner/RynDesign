import { defineCommand } from 'citty';
import pc from 'picocolors';
import { readAndMergeTokenFiles, validateTree, TokenValidationError } from '@ryndesign/core';

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
  },
  async run({ args }) {
    console.log(pc.cyan('🔍 RynDesign Validate\n'));

    const patterns = args.path ? [args.path as string] : ['tokens/**/*.tokens.json'];

    try {
      const tree = await readAndMergeTokenFiles(patterns);
      validateTree(tree);
      console.log(pc.green('✓ All tokens are valid!'));
    } catch (err) {
      if (err instanceof TokenValidationError) {
        console.error(pc.red(`✗ Validation failed with ${err.errors.length} issue(s):\n`));
        for (const issue of err.errors) {
          const icon = issue.severity === 'error' ? pc.red('✗') : pc.yellow('⚠');
          console.error(`  ${icon} ${issue.path.join('.')}: ${issue.message}`);
        }
        process.exit(1);
      }
      throw err;
    }
  },
});
