import { defineConfig, devices } from '@playwright/test';

const BACKEND_PORT = 5232;
const FRONTEND_PORT = 4200;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  timeout: 30_000,

  use: {
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'api',
      testDir: './e2e/api',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${BACKEND_PORT}`,
      },
    },
    {
      name: 'ui',
      testDir: './e2e/ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://localhost:${FRONTEND_PORT}`,
      },
    },
  ],

  webServer: {
    command: `dotnet run --project ../UniversalItemManagement.Server --launch-profile http`,
    url: `http://localhost:${BACKEND_PORT}`,
    reuseExistingServer: true,
    timeout: 30_000,
    ignoreHTTPSErrors: true,
  },
});
