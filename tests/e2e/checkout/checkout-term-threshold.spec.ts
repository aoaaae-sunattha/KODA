import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Term Thresholds', () => {
  test('TC-CHKT-001: Term Threshold Disables Unavailable Options (BVA) @tag @checkout @p1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    
    // Ensure we are on the store page
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Click "Buy with KODA" on Dyson Gen5detect ($949)
    await checkoutPage.openCheckoutFor('Dyson Gen5detect');

    // Expected: Checkout modal opens
    await expect(checkoutPage.modal).toBeVisible();
    
    // Term 4 is enabled
    const term4 = page.getByTestId('plan-option-4');
    await expect(term4).toBeEnabled();
    
    // Term 10 is disabled with label "$2,000+"
    const term10 = page.getByTestId('plan-option-10');
    await expect(term10).toBeDisabled();
    await expect(term10).toContainText('$2,000+');
    
    // Term 18 is disabled with label "$5,000+"
    const term18 = page.getByTestId('plan-option-18');
    await expect(term18).toBeDisabled();
    await expect(term18).toContainText('$5,000+');
    
    // Term 24 is disabled with label "$15,000+"
    const term24 = page.getByTestId('plan-option-24');
    await expect(term24).toBeDisabled();
    await expect(term24).toContainText('$15,000+');
  });
});
