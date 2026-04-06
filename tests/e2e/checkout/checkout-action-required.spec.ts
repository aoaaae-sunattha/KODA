import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Risk Guards', () => {
  test('TC-CHKT-013: Action Required Blocks Checkout — Payment Issue Alert @tag @checkout @p1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('declined@koda.test');
    await page.goto('/store');
    
    // Attempt to buy any product
    await checkoutPage.openCheckoutFor('iPhone 15 Pro');
    
    // Assert checkout-modal is NOT visible
    await expect(checkoutPage.modal).not.toBeVisible();
    
    // Assert [data-testid="risk-alert-modal"] is visible
    const riskModal = page.getByTestId('risk-alert-modal');
    await expect(riskModal).toBeVisible();
    
    // Assert [data-testid="risk-alert-title"] has text "Payment Issue"
    await expect(page.getByTestId('risk-alert-title')).toHaveText('Payment Issue');
    
    // Assert [data-testid="risk-alert-btn"] has text "Manage Cards"
    const manageCardsBtn = page.getByTestId('risk-alert-btn');
    await expect(manageCardsBtn).toHaveText('Manage Cards');
    
    // Click the button and verify navigation (TC-CHKT-017)
    await manageCardsBtn.click();
    await expect(page).toHaveURL(/\/settings\/cards/);
  });
});
