import { defineConfig, devices } from '@playwright/test';
import process from 'node:process';

import { API_ORIGIN, API_PORT, WEB_ORIGIN, WEB_PORT } from './e2e/origins';

const IS_CI = process.env.CI !== undefined;

/** Cold start is a Prisma migration plus a Nest or Vite build. */
const SERVER_TIMEOUT_MS = 120_000;

export default defineConfig({
  forbidOnly: IS_CI,
  fullyParallel: true,
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  reporter: IS_CI ? 'github' : 'list',
  retries: IS_CI ? 2 : 0,
  testDir: './e2e',
  use: {
    baseURL: WEB_ORIGIN,
    trace: 'on-first-retry',
  },
  // The real API, not a mock: `/l/$slug` resolves server-side, where the browser
  // cannot intercept anything.
  webServer: [
    {
      command: 'pnpm exec prisma migrate deploy && pnpm exec nest start',
      cwd: '../api',
      // The flag picks `E2E_DATABASE_URL` inside the API; the path stays over there.
      env: {
        CORS_ORIGIN: WEB_ORIGIN,
        PORT: API_PORT,
        USE_E2E_DATABASE: '1',
      },
      reuseExistingServer: !IS_CI,
      timeout: SERVER_TIMEOUT_MS,
      url: `${API_ORIGIN}/health`,
    },
    {
      command: `pnpm exec vite dev --port ${WEB_PORT}`,
      env: { VITE_API_URL: API_ORIGIN },
      reuseExistingServer: !IS_CI,
      timeout: SERVER_TIMEOUT_MS,
      url: WEB_ORIGIN,
    },
  ],
  workers: IS_CI ? 1 : undefined,
});
