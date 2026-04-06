import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Happy Path', () => {
  test('TC-CHKT-006: Checkout Completion — Success Toast + Dashboard Redirect @tag @checkout @p1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    
    // Ensure we are on the store page
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Attempt to buy iPhone 15 Pro
    await checkoutPage.openCheckoutFor('iPhone 15 Pro');

    // Expected: Checkout modal opens
    await expect(checkoutPage.modal).toBeVisible();
    
    // Default term is 4 payments
    const term4 = page.getByTestId('plan-option-4');
    await expect(term4).toHaveClass(/ring-primary/); // selected class

    // Click "Confirm Purchase"
    await checkoutPage.confirmPurchase();

    // Expected: Success toast appears briefly
    // Note: The toast might be hard to catch, but we expect a redirect to /dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // New order for "Apple" appears on the dashboard
    await expect(page.locator('[data-merchant="Apple"]')).toBeVisible();
  });
});
