// playwright.config.js
// @ts-check
const { devices } = require('@playwright/test')
const headless = true

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    testDir: 'test-e2e/spec',
    testMatch: '*.spec.js',
    reportSlowTests: null,
    timeout: 1000 * 60 * 5,
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    use: {
        // trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        // video: 'on-first-retry'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'], headless },
        }
    ],
}

module.exports = config