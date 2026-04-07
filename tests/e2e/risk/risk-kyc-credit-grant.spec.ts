import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-007: KYC Credit Limit Grant Verification @regression @risk @kyc', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  // new@koda.test starts with $0 limit and verified: false
  await loginPage.login('new@koda.test');
  await page.waitForURL(/.*dashboard/);

  // Verify initial limit is $0
  // CreditGauge renders total-limit and available-credit test IDs
  await expect(page.getByTestId('total-limit')).toContainText('$0');

  // Trigger KYC via Storefront
  await page.goto('/store');
  await checkoutPage.openCheckoutFor('iPhone 15 Pro');

  // IDVerifyModal should open
  const idVerifyModal = page.getByTestId('id-verify-modal');
  await expect(idVerifyModal).toBeVisible();

  // Start Verification (scanning progress runs ~1.5s, then shows success step)
  await page.getByTestId('id-verify-start-btn').click();

  // Wait for success step's finish button
  await expect(page.getByTestId('id-verify-finish-btn')).toBeVisible({ timeout: 15000 });

  // Click finish — verifyKYC() is called, user navigates to /dashboard
  await page.getByTestId('id-verify-finish-btn').click();
  await page.waitForURL(/.*dashboard/);

  // Verify limit is now $8,000
  await expect(page.getByTestId('total-limit')).toContainText('$8,000');
  await expect(page.getByTestId('available-credit')).toContainText('$8,000');
});
