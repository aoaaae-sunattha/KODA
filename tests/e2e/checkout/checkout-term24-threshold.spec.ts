import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Term 24 Threshold', () => {
  test('TC-CHKT-010: Term 24 Minimum Threshold BVA @tag @checkout @p2', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    await page.goto('/store');
    
    // Open checkout for Eames Lounge Chair ($7,900)
    await checkoutPage.openCheckoutFor('Eames Lounge Chair');
    await expect(checkoutPage.modal).toBeVisible();

    // Term 24 is disabled with threshold label "$15,000+"
    const term24 = page.getByTestId('plan-option-24');
    await expect(term24).toBeDisabled();
    await expect(term24).toContainText('$15,000+');
    
    // Term 18 is enabled ($7,900 ≥ $5,000 threshold)
    const term18 = page.getByTestId('plan-option-18');
    await expect(term18).toBeEnabled();
  });
});
