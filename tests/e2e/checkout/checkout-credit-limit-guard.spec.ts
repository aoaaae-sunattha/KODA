import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Credit Limit Guard', () => {
  test('TC-CHKT-002: Credit Limit Guard (Negative) @tag @checkout @p0', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('maxed@koda.test');
    
    // Ensure we are on the store page
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Attempt to buy a high-value item
    await checkoutPage.openCheckoutFor('MacBook Pro 14"');

    // Expected: Checkout does not open, Risk Alert Modal displays "Insufficient Credit"
    await expect(checkoutPage.modal).not.toBeVisible();
    
    const riskModal = page.getByTestId('risk-alert-modal');
    await expect(riskModal).toBeVisible();
    
    const riskTitle = page.getByTestId('risk-alert-title');
    await expect(riskTitle).toHaveText('Insufficient Credit');
    
    const riskMessage = page.getByTestId('risk-alert-message');
    await expect(riskMessage).toContainText('exceeds your available credit');
    
    // Click CTA to close
    await page.getByTestId('risk-alert-btn').click();
    await expect(riskModal).not.toBeVisible();
  });
});
