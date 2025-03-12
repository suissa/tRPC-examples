import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/server/**/*.ts'],
    },
    setupFiles: ['./tests/setup.ts'],
  },
});