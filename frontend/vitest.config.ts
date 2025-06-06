import { defineConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default defineConfig({
  ...viteConfig,
  test: {
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
    globals: true,
    exclude: ['node_modules', 'cypress/**'],
    coverage: { reporter: ['text', 'lcov'] },
  },
});
