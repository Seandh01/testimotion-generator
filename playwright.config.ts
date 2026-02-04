import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for TESTIMOTION Landing Page Testing
 *
 * This config supports both:
 * 1. Visual regression testing against the SVG design (preview/)
 * 2. E2E functional testing for the generator UI (generator/)
 */
export default defineConfig({
  testDir: './tests',

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI */
  workers: process.env.CI ? 1 : undefined,

  /* Test timeout */
  timeout: 60000,

  /* Reporter to use */
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
    ['json', { outputFile: 'tests/reports/test-results.json' }]
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL for tests - defaults to generator server */
    baseURL: 'http://localhost:3001',

    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',

    /* Screenshot settings */
    screenshot: 'only-on-failure',

    /* Video on failure */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'visual-tests',
      testMatch: '**/visual.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        baseURL: 'file://' + process.cwd() + '/preview',
      },
    },
  ],

  /* Global expect settings for screenshots */
  expect: {
    toHaveScreenshot: {
      /* Allow up to 500 different pixels (for minor rendering differences) */
      maxDiffPixels: 500,

      /* Pixel comparison threshold (0 = exact, 1 = any difference) */
      threshold: 0.3,

      /* Animation settings */
      animations: 'disabled',
    },
  },

  /* Web server for generator tests */
  webServer: {
    command: 'node generator/server.js',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
