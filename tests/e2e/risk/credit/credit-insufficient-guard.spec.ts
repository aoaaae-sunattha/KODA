import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-CRED-001: Insufficient Credit Guard (Critical) @smoke @regression @credit', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Preconditions — User maxed@koda.test with $5000 limit and $4850 used credit (Available: $150)
  await loginPage.goto();
  await loginPage.login('maxed@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Navigate to Merchant Storefront
  await page.goto('/store');
  await expect(page).toHaveURL(/.*store/);

  // 2. Attempt to purchase an item priced at $199
  await checkoutPage.openCheckoutFor('iPhone 15 Pro');

  // Expected Results
  // - Checkout is blocked
  await expect(checkoutPage.modal).not.toBeVisible();

  // - Error message: "Insufficient Credit Limit"
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();
  await expect(page.getByTestId('risk-alert-title')).toHaveText('Insufficient Credit');
  await expect(page.getByTestId('risk-alert-message')).toContainText('exceeds your available credit');
});
