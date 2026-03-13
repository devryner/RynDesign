import { defineCommand } from 'citty';

export const main = defineCommand({
  meta: {
    name: 'ryndesign',
    version: '0.1.0',
    description: 'Multi-platform design system generator',
  },
  subCommands: {
    init: () => import('./init.js').then(m => m.default),
    generate: () => import('./generate.js').then(m => m.default),
    validate: () => import('./validate.js').then(m => m.default),
    preview: () => import('./preview.js').then(m => m.default),
    add: () => import('./add.js').then(m => m.default),
  },
});
