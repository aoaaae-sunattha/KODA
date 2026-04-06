import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-025: Term-10 Enabled at $2,000+ Threshold BVA @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.goto('/store');

  // Step 1: Open checkout for MacBook Pro 14" ($2,499)
  await checkoutPage.openCheckoutFor('MacBook Pro 14"');
  await expect(checkoutPage.modal).toBeVisible();

  // Step 2: Observe the Plan Selector — term-10 row
  const term10 = page.getByTestId('plan-option-10');
  
  // Expected: Term-10 is enabled and clickable ($2,499 ≥ $2,000 threshold)
  await expect(term10).toBeEnabled();

  // Step 3: Clicking term-10 selects it
  await term10.click();
  await expect(term10).toHaveClass(/bg-primary\/5/);
  
  // Timeline updates to 10 installments (Behavioral check: timeline item 9 should exist)
  await expect(page.getByTestId('timeline-amount-9')).toBeVisible();
});
