import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Fee Calculation', () => {
  test('TC-CHKT-003: Fee Calculation Accuracy — MacBook $2,499 / Term 6 @tag @checkout @p1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    
    // Ensure we are on the store page
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Open checkout for MacBook Pro 14" ($2,499)
    await checkoutPage.openCheckoutFor('MacBook Pro 14"');
    await expect(checkoutPage.modal).toBeVisible();

    // Expand "+ other options!"
    await page.getByTestId('expand-other-options').click();

    // Select Term 6
    await checkoutPage.selectTerm(6 as any);

    /**
     * Expected (calculated from feeRates.ts):
     * - Price: $2,499
     * - Term: 6
     * - Fee rate: 3.98% → fee = Math.round(2499 × 0.0398) = $99
     * - Monthly base: Math.floor(2499 / 6) = $416
     * - Installment 0: $416 + $99 = $515 (labeled "incl. $99 fee")
     * - Installments 1–4: $416
     * - Installment 5: $416 + remainder ($2,499 − $416×6 = $3) = $419
     * - Total charged: $2,499 + $99 = $2,598
     */

    // Verify first payment (Installment 0)
    const installment0 = page.getByTestId('timeline-amount-0');
    await expect(installment0).toHaveText('$515');

    // Timeline card shows "Incl. Fee" label on first payment
    await expect(page.getByTestId('timeline-fee-label')).toBeVisible();

    // Summary card describes the fee composition (TC-CHKT-003: "Includes first installment + $99 one-time setup fee")
    await expect(page.getByTestId('plan-summary-first-payment')).toHaveText('$515');
    await expect(page.locator('text=/Includes first installment.*\\$99.*one-time setup fee/')).toBeVisible();
    
    // Verify intermediate payments (Installments 1-4)
    for (let i = 1; i <= 4; i++) {
      const installment = page.getByTestId(`timeline-amount-${i}`);
      await expect(installment).toHaveText('$416');
    }

    // Verify last payment (Installment 5)
    const installment5 = page.getByTestId('timeline-amount-5');
    await expect(installment5).toHaveText('$419');
    
    // Total charged assertion (could be in summary)
    // Looking at CheckoutModal.tsx, total might be in a summary section
    const total = page.getByText('Total to pay');
    await expect(total.locator('..')).toContainText('$2,598');
  });
});
