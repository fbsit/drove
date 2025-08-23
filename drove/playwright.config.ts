import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    baseURL: 'http://localhost:8080',
    headless: true,
  },
  webServer: {
    command: 'yarn dev',
    port: 8080,
    reuseExistingServer: true,
    timeout: 120_000,
  },
  timeout: 60_000,
});


