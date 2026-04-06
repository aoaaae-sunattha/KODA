import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Term 24 Badge', () => {
  test('TC-CHKT-009: Term 24 Shows "Most Flexible" Badge @tag @checkout @p2', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('power@koda.test');
    await page.goto('/store');
    
    // Open checkout for Specialized Turbo Levo ($15,500)
    await checkoutPage.openCheckoutFor('Specialized Turbo Levo');
    await expect(checkoutPage.modal).toBeVisible();

    // Observe term-24 row in the Plan Selector
    const term24Row = page.getByTestId('plan-option-24');
    
    // Expected: Term 24 row displays a purple "most flexible" badge
    const flexibleBadge = term24Row.getByTestId('plan-badge-flexible');
    await expect(flexibleBadge).toBeVisible();
    await expect(flexibleBadge).toHaveText('most flexible');
    
    // Term 24 is enabled ($15,500 ≥ $15,000 threshold)
    await expect(term24Row).toBeEnabled();
  });
});
