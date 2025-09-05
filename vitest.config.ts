import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'test/**',
        'playground/**',
        'dist/**',
        '*.config.*',
        '*.d.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '~': new URL('./', import.meta.url).pathname,
      '@': new URL('./', import.meta.url).pathname,
      '#imports': new URL('./test/mocks/imports.ts', import.meta.url).pathname,
    },
  },
})
