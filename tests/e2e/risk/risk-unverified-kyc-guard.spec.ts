import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-002: Unverified Account KYC Guard (Critical) @smoke @regression @risk', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Preconditions — User logged in as new@koda.test (Verified: false)
  await loginPage.goto();
  await loginPage.login('new@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Navigate to the Merchant Storefront
  await page.goto('/store');
  await expect(page).toHaveURL(/.*store/);

  // 2. Select any product and click "Buy with KODA"
  await checkoutPage.openCheckout();

  // Expected Results
  // - IDVerifyModal opens automatically instead of the Checkout Modal
  const idVerifyModal = page.getByTestId('id-verify-modal');
  await expect(idVerifyModal).toBeVisible();
  await expect(checkoutPage.modal).not.toBeVisible();

  // - User is prompted to scan their ID
  await expect(page.getByTestId('id-verify-title')).toHaveText('Identity Verify');
  await expect(page.getByTestId('id-verify-start-btn')).toBeVisible();

  // - Checkout is blocked until verification is complete
  await expect(checkoutPage.confirmButton).not.toBeVisible();
});
