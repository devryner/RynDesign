import { defineCommand } from 'citty';
import pc from 'picocolors';
import path from 'node:path';
import fs from 'node:fs/promises';
import { loadConfig } from '../config.js';

export default defineCommand({
  meta: {
    name: 'figma',
    description: 'Figma integration commands',
  },
  subCommands: {
    pull: () => import('./figma-pull.js').then(m => m.default),
    push: () => import('./figma-push.js').then(m => m.default),
    diff: () => import('./figma-diff.js').then(m => m.default),
  },
});
