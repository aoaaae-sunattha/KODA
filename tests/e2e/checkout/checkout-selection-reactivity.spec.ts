import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-019: Term Selection Updates Timeline @regression @checkout @p2', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.goto('/store');
  
  // Step 1: Open checkout for MacBook Pro 14" ($2,499)
  await checkoutPage.openCheckoutFor('MacBook Pro 14"');
  await expect(checkoutPage.modal).toBeVisible();

  // Step 2: Verify term-4 selected by default
  const term4 = page.getByTestId('plan-option-4');
  await expect(term4).toHaveClass(/bg-primary\/5/); // active styling
  
  // Step 3: Expand and select Term 6
  await page.getByTestId('expand-other-options').click();
  await checkoutPage.selectTerm(6 as any);
  
  // Step 4: Verify timeline updates
  // Term 4 first payment: $2499 / 4 = $624.75 -> $624/627?
  // Let's check calculations for Term 6 specifically: first payment $515
  await expect(page.getByTestId('timeline-amount-0')).toHaveText('$515');
  
  // Term 6 row is now highlighted
  const term6 = page.getByTestId('plan-option-6');
  await expect(term6).toHaveClass(/bg-primary\/5/);
});
