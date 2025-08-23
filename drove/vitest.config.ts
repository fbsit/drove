import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setupTests.ts'],
    css: false,
    include: [
      'src/**/*.{test,spec}.{ts,tsx}',
      'src/**/__tests__/**/*.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html'],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'socket.io-client': path.resolve(__dirname, './src/test/shims/socket-io-client.ts'),
      'node-websocket': path.resolve(__dirname, './src/test/shims/empty.ts'),
      'node-websocket/*': path.resolve(__dirname, './src/test/shims/empty.ts'),
    },
  },
});


