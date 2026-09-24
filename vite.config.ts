import vue from '@vitejs/plugin-vue'
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import path from 'path'

// https://vite.dev/config/
// @ts-ignore - vitest test prop not in vite types but vitest will pick it up
export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  // @ts-ignore
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: { provider: 'v8', reporter: ['text', 'html'] },
  },
} as any)
