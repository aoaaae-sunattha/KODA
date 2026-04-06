import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Plan Expansion', () => {
  test('TC-CHKT-004: Plan Selector "Other Options" (UI/UX) @tag @checkout @p2', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    await page.goto('/store');
    
    // Open checkout for MacBook Pro 14" ($2,499)
    await checkoutPage.openCheckoutFor('MacBook Pro 14"');
    await expect(checkoutPage.modal).toBeVisible();

    // Observe default terms (4, 18, 24)
    await expect(page.getByTestId('plan-option-4')).toBeVisible();
    await expect(page.getByTestId('plan-option-18')).toBeVisible();
    await expect(page.getByTestId('plan-option-24')).toBeVisible();

    // Secondary terms (6, 8, 10, 12) should be hidden
    await expect(page.getByTestId('plan-option-6')).not.toBeVisible();
    await expect(page.getByTestId('plan-option-8')).not.toBeVisible();
    await expect(page.getByTestId('plan-option-12')).not.toBeVisible();

    // Click "+ other options!"
    await page.getByTestId('expand-other-options').click();

    // Expected: Terms 6, 8, and 12 expand into view
    await expect(page.getByTestId('plan-option-6')).toBeVisible();
    await expect(page.getByTestId('plan-option-8')).toBeVisible();
    await expect(page.getByTestId('plan-option-12')).toBeVisible();
    
    // Expand button should disappear
    await expect(page.getByTestId('expand-other-options')).not.toBeVisible();
  });
});
