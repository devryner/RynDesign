import { defineConfig } from '@ryndesign/cli';
import react from '@ryndesign/generator-react';
import css from '@ryndesign/generator-css';
import tailwind from '@ryndesign/generator-tailwind';

export default defineConfig({
  tokens: ['tokens/**/*.tokens.json'],
  components: ['components/**/*.component.json'],
  outDir: 'generated',

  themes: {
    default: 'light',
    dark: { file: 'tokens/dark.tokens.json' },
  },

  generators: [
    react({
      outDir: 'generated/react',
      cssStrategy: 'css-variables',
      typescript: true,
      darkMode: 'media+class',
    }),
    css({
      outDir: 'generated/css',
      cssStrategy: 'css-variables',
      typescript: true,
      darkMode: 'media+class',
    }),
    tailwind({
      outDir: 'generated/tailwind',
    }),
  ],

  preview: { port: 4400, open: true },
});
