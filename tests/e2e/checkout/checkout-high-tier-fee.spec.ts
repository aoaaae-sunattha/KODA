import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-020: Fee Calculation Accuracy — High-Tier Term 18 on Eames Chair @regression @checkout @p2', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.goto('/store');
  
  // Open checkout for Eames Lounge Chair ($7,900)
  await checkoutPage.openCheckoutFor('Eames Lounge Chair');
  await expect(checkoutPage.modal).toBeVisible();

  // Select Term 18
  await checkoutPage.selectTerm(18 as any);

  /**
   * Expected (calculated from feeRates.ts):
   * - Fee: Math.round(7900 × 0.1725) = $1,363
   * - Base: Math.floor(7900 / 18) = $438
   * - Remainder: 7900 − 438×18 = $16
   * - First payment: $438 + $1,363 = $1,801
   * - Last installment (17): $438 + $16 = $454
   */

  await expect(page.getByTestId('timeline-amount-0')).toHaveText('$1,801');
  await expect(page.getByTestId('timeline-amount-1')).toHaveText('$438');
  await expect(page.getByTestId('timeline-amount-17')).toHaveText('$454');
  
  // Summary card checks
  await expect(page.getByTestId('plan-summary-total')).toHaveText('$9,263');
  await expect(page.getByTestId('plan-summary-first-payment')).toHaveText('$1,801');
});
