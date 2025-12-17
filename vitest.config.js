import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      include: ['tests/**/*.test.js'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov', 'html'],
        exclude: ['node_modules/', 'dist/', 'tests/', '**/*.config.js', 'public/', 'fonts/'],
        thresholds: {
          // Initial conservative thresholds - increase as more tests are added
          lines: 25,
          functions: 40,
          branches: 20,
          statements: 25,
        },
      },
      globals: true,
    },
  })
);
