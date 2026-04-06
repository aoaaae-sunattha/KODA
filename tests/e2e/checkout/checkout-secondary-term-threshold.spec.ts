import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Secondary Term Thresholds', () => {
  test('TC-CHKT-014: Term 6/8 Threshold BVA — Disabled After Expand ($1,000 minimum) @tag @checkout @p1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    await page.goto('/store');
    
    // Open checkout for Dyson Gen5detect ($949)
    await checkoutPage.openCheckoutFor('Dyson Gen5detect');
    await expect(checkoutPage.modal).toBeVisible();

    // Click "+ other options!" to expand secondary terms
    await page.getByTestId('expand-other-options').click();

    // Observe terms 6 and 8
    const term6 = page.getByTestId('plan-option-6');
    const term8 = page.getByTestId('plan-option-8');
    const term12 = page.getByTestId('plan-option-12');

    // Expected: Term 6 is disabled with label "$1,000+"
    await expect(term6).toBeDisabled();
    await expect(term6).toContainText('$1,000+');

    // Expected: Term 8 is disabled with label "$1,000+"
    await expect(term8).toBeDisabled();
    await expect(term8).toContainText('$1,000+');

    // Expected: Term 12 is disabled with label "$5,000+"
    await expect(term12).toBeDisabled();
    await expect(term12).toContainText('$5,000+');
  });
});
