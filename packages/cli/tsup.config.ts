import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/bin.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  banner: ({ format }) => {
    if (format === 'esm') {
      return { js: '' };
    }
    return {};
  },
});
