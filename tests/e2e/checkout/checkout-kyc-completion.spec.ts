import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-018: KYC Completion Flow — Full 3-Step Walkthrough @smoke @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Precondition: Logged in as new@koda.test (unverified)
  await loginPage.goto();
  await loginPage.login('new@koda.test');
  await expect(page).toHaveURL(/\/dashboard/);

  // Step 1: Navigate to /store
  await page.goto('/store');
  await expect(page).toHaveURL(/\/store/);

  // Step 2: Click any buy button to trigger KYC modal
  await checkoutPage.openCheckout();

  // Expected: ID Verify Modal appears
  const kycModal = page.getByTestId('id-verify-modal');
  await expect(kycModal).toBeVisible();

  // Step 3: Click "Start Verification" → verify scanning step animates
  await page.getByTestId('id-verify-start-btn').click();
  await expect(page.locator('h3:has-text("Scanning ID Document...")')).toBeVisible();

  // Step 4: Wait for scanning to complete → verify "Verified!" step appears
  const successTitle = page.getByTestId('id-verify-title');
  await expect(successTitle).toHaveText('Verified!', { timeout: 15000 });

  // Step 5: Click "Go to Dashboard" → verify navigation to /dashboard
  await page.getByTestId('id-verify-finish-btn').click();
  await expect(page).toHaveURL(/\/dashboard/);

  // Step 6: Navigate back to /store → click "Buy with KODA" again
  await page.goto('/store');
  await checkoutPage.openCheckout();

  // Expected: Checkout modal opens (KYC gate no longer fires)
  await expect(checkoutPage.modal).toBeVisible();
});
