import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-024: Checkout Modal Resets to Term-4 on Reopen @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.goto('/store');

  // Step 1: Open checkout for MacBook Pro 14" ($2,499)
  await checkoutPage.openCheckoutFor('MacBook Pro 14"');
  await expect(checkoutPage.modal).toBeVisible();

  // Step 2: Click "+ other options!" → select "6 Payments"
  await page.getByTestId('expand-other-options').click();
  await checkoutPage.selectTerm(6 as any);
  await expect(page.getByTestId('plan-option-6')).toHaveClass(/bg-primary\/5/);

  // Step 3: Click the X close button to dismiss the modal
  await checkoutPage.close();
  await expect(checkoutPage.modal).not.toBeVisible();

  // Step 4: Click "Buy with KODA" on the same product to reopen
  await checkoutPage.openCheckoutFor('MacBook Pro 14"');
  await expect(checkoutPage.modal).toBeVisible();

  // Expected: Checkout modal reopens with term-4 selected
  await expect(page.getByTestId('plan-option-4')).toHaveClass(/bg-primary\/5/);
  await expect(page.getByTestId('plan-option-6')).not.toBeVisible();
});
