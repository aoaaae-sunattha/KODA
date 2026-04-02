/**
 * auth.setup.ts — Global Auth Setup
 *
 * Logs in once and saves storageState so subsequent tests
 * can reuse the authenticated session without re-logging in.
 *
 * Usage in playwright.config.ts:
 *   setup: { testMatch: '**/helpers/auth.setup.ts' }
 *   projects[n].dependencies: ['setup']
 *   use: { storageState: 'tests/e2e/helpers/.auth/user.json' }
 *
 * NOTE: KODA uses Zustand + localStorage for session state.
 * Auth state is stored in the browser's localStorage, which
 * Playwright captures via storageState.
 *
 * Run: npx playwright test --project=setup
 */

import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('authenticate as active@koda.test', async ({ page }) => {
  // Navigate to login
  await page.goto('/login');

  // Fill in credentials
  await page.getByTestId('login-email').fill('active@koda.test');
  await page.getByTestId('login-password').fill('any-password');
  await page.getByTestId('login-submit').click();

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/);

  // Save auth state (Zustand localStorage) to file
  await page.context().storageState({ path: AUTH_FILE });
});
