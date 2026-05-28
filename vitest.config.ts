import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'node',
    passWithNoTests: true,
    include: ['src/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['src/lib/**/*.ts', 'src/routes/**/chart-builder-reducer.ts', 'src/routes/**/chart-builder-dialog.utils.ts'],
      exclude: ['src/**/*.test.ts'],
    },
  },
})
