import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-009: Dashboard KYC Banner for Unverified User @smoke @regression @risk', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Preconditions — Logged in as new@koda.test (verified: false).
  await loginPage.goto();
  await loginPage.login('new@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Navigate to the Dashboard.
  // 2. Observe the top of the page.
  const verifyBanner = page.getByTestId('verify-banner');
  await expect(verifyBanner).toBeVisible();

  // Expected Results
  // - An indigo "Identity Verification" banner is visible.
  await expect(verifyBanner).toContainText('Identity Verification');

  // - The banner contains a clear call-to-action (CTA) button labeled "Verify".
  const verifyBtn = page.getByTestId('verify-now-btn');
  await expect(verifyBtn).toBeVisible();
  await expect(verifyBtn).toHaveText('Verify');
});
