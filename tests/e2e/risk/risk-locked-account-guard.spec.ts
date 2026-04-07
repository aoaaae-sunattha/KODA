import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-001: Locked Account Checkout Blocking (Critical) @smoke @regression @risk', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Preconditions — User logged in as overdue@koda.test (Account Status: Locked)
  await loginPage.goto();
  await loginPage.login('overdue@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Navigate to the Merchant Storefront
  await page.goto('/store');
  await expect(page).toHaveURL(/.*store/);

  // 2. Select any product and Click "Buy with KODA"
  await checkoutPage.openCheckout();

  // Expected Results
  // - Checkout Modal DOES NOT open
  await expect(checkoutPage.modal).not.toBeVisible();

  // - A "403 Locked State" alert or RiskAlertModal is displayed
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();

  // - Message: "Account Locked. Please pay your overdue balance to unlock."
  await expect(page.getByTestId('risk-alert-title')).toHaveText('Account Locked');
  await expect(page.getByTestId('risk-alert-message')).toContainText('overdue payments');
});
