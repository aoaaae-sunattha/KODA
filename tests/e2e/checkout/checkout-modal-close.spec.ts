import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Modal Dismissal', () => {
  test('TC-CHKT-011: Checkout Modal — Close via X Button @tag @checkout @p3', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    await page.goto('/store');
    
    // Open checkout for any product
    await checkoutPage.openCheckout();
    await expect(checkoutPage.modal).toBeVisible();

    // Click the X close button on the modal
    await checkoutPage.close();

    // Expected: Modal closes, User remains on /store
    await expect(checkoutPage.modal).not.toBeVisible();
    await expect(page).toHaveURL(/\/store/);
  });
});
