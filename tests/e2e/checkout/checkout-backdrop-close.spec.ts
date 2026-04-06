import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Modal Interaction', () => {
  test('TC-CHKT-015: Checkout Modal — Close via Backdrop Click @tag @checkout @p2', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    await page.goto('/store');
    
    // Open checkout for any product
    await checkoutPage.openCheckoutFor('iPhone 15 Pro');
    await expect(checkoutPage.modal).toBeVisible();

    // Click the backdrop (dark overlay area outside the modal)
    await checkoutPage.closeViaBackdrop();

    // Expected: Modal closes
    await expect(checkoutPage.modal).not.toBeVisible();

    // User remains on /store
    await expect(page).toHaveURL(/\/store/);
  });
});
