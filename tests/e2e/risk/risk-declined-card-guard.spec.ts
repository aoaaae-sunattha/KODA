import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-003: Action Required (Declined Card) Checkout Guard @smoke @regression @risk', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Preconditions — User logged in as declined@koda.test (Account Status: action_required)
  await loginPage.goto();
  await loginPage.login('declined@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Navigate to the Merchant Storefront
  await page.goto('/store');
  await expect(page).toHaveURL(/.*store/);

  // 2. Select any product and click "Buy with KODA"
  await checkoutPage.openCheckout();

  // Expected Results
  // - Checkout Modal DOES NOT open
  await expect(checkoutPage.modal).not.toBeVisible();

  // - RiskAlertModal displays with title: "Payment Issue"
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();
  await expect(page.getByTestId('risk-alert-title')).toHaveText('Payment Issue');

  // - A CTA button labeled "Manage Cards" is visible in the modal
  const riskBtn = page.getByTestId('risk-alert-btn');
  await expect(riskBtn).toContainText('Manage Cards');

  // - Clicking "Manage Cards" navigates to /settings/cards
  await riskBtn.click();
  await expect(page).toHaveURL(/.*settings\/cards/);
});
