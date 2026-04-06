import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-027: Plan Selector Expand Link Disappears After Click @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.goto('/store');

  // Step 1: Open checkout for MacBook Pro 14" ($2,499)
  await checkoutPage.openCheckoutFor('MacBook Pro 14"');
  await expect(checkoutPage.modal).toBeVisible();

  // Step 2: Verify "+ other options!" link is visible
  const expandBtn = page.getByTestId('expand-other-options');
  await expect(expandBtn).toBeVisible();

  // Step 3: Click "+ other options!"
  await expandBtn.click();

  // Expected: The "+ other options!" link is no longer visible
  await expect(expandBtn).not.toBeVisible();
});
