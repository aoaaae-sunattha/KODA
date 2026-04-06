import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Plan Badges', () => {
  test('TC-CHKT-007: Term 4 Shows "Free" Badge and Zero Fee @tag @checkout @p2', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    await page.goto('/store');
    
    // Open checkout for iPhone 15 Pro ($999)
    await checkoutPage.openCheckoutFor('iPhone 15 Pro');
    await expect(checkoutPage.modal).toBeVisible();

    // Observe term-4 row in the Plan Selector (default selected)
    const term4Row = page.getByTestId('plan-option-4');
    
    // Expected: Term 4 row displays a purple "free" badge
    const freeBadge = term4Row.getByTestId('plan-badge-free');
    await expect(freeBadge).toBeVisible();
    await expect(freeBadge).toHaveText('free');
    
    // No fee amount shown anywhere in the summary
    await expect(page.locator('text=One-time Setup Fee')).not.toBeVisible();
    
    // First payment = monthly payment = Math.floor(999/4) = $249
    await expect(page.getByTestId('timeline-amount-0')).toHaveText('$249');
    // Last installment (3) = $252 ($249 + $3 rounding remainder)
    await expect(page.getByTestId('timeline-amount-3')).toHaveText('$252');
  });
});
