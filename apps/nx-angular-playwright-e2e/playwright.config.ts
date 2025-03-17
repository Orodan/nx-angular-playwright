import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

import { execSync } from 'child_process';
import { platform } from 'os';

// Permet d'assurer que la baseUrl pour Playwright sera correct, que les tests soient exécuté depuis
// des navigateurs locaux où dans un container.
const getHostIP = () => {
  try {
    if (platform() === 'darwin') { 
      // macOS : Trouver l'IP locale
      return execSync("ifconfig | grep 'inet ' | grep -v 127.0.0.1 | awk '{print $2}'")
        .toString().split("\n")[0].trim();
    } else if (platform() === 'linux') { 
      // Linux (Ubuntu, Debian...) : Trouver l'IP locale
      return execSync("ip route | grep default | awk '{print $3}'")
        .toString().trim();
    } else if (platform() === 'win32') {
      // Windows : Trouver l'IP locale
      return execSync("powershell -Command \"(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -NotLike 'Loopback*'}).IPAddress | Select-Object -First 1\"")
        .toString().trim();
    } else {
      throw new Error(`OS non supporté: ${platform()}`);
    }
  } catch (e) {
    console.error("Erreur lors de la récupération de l'IP de l'hôte", e);
    process.exit(1);
  }
};

// For CI, you may want to set BASE_URL to the deployed application.
const baseURL = process.env['BASE_URL'] || `http://${getHostIP()}:4200`;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    connectOptions: {
      wsEndpoint: 'ws://127.0.0.1:3000/'
    }
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npx nx run nx-angular-playwright:serve -- --host 0.0.0.0',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env['CI'],
    cwd: workspaceRoot,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
