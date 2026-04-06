import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout Locked Account', () => {
  test('TC-CHKT-008: Locked Account Blocks Checkout — Account Locked Alert @tag @checkout @p1', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('overdue@koda.test');
    
    // Ensure we are on the store page
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Attempt to buy any product
    await checkoutPage.openCheckout();

    // Expected: Checkout modal does NOT open, Risk Alert Modal appears with title "Account Locked"
    await expect(checkoutPage.modal).not.toBeVisible();
    
    const riskModal = page.getByTestId('risk-alert-modal');
    await expect(riskModal).toBeVisible();
    
    const riskTitle = page.getByTestId('risk-alert-title');
    await expect(riskTitle).toHaveText('Account Locked');
    
    const riskMessage = page.getByTestId('risk-alert-message');
    await expect(riskMessage).toContainText('locked due to overdue payments');
    
    // Click CTA button "Go to Dashboard to Pay"
    const riskBtn = page.getByTestId('risk-alert-btn');
    await expect(riskBtn).toContainText('Go to Dashboard to Pay');
    await riskBtn.click();
    
    // Expected redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
