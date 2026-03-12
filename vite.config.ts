import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-router': ['react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-sentry': ['@sentry/react'],
          'vendor-state': ['zustand', 'zod'],
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    exclude: ['e2e/**', 'tests/e2e/**', 'node_modules/**', '.claude/**'],
  },
})
