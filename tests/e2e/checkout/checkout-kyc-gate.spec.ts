import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout KYC Gate', () => {
  test('TC-CHKT-005: KYC Gate Blocks Checkout — IDVerify Modal Shown @tag @checkout @p0', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const checkoutPage = new CheckoutPage(page);

    await loginPage.goto();
    await loginPage.login('new@koda.test');
    
    // Ensure we are on the store page
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Attempt to buy any product
    await checkoutPage.openCheckout();

    // Expected: Checkout modal does NOT open, ID Verify Modal appears instead
    await expect(checkoutPage.modal).not.toBeVisible();
    
    const idModal = page.getByTestId('id-verify-modal');
    await expect(idModal).toBeVisible();
    
    const idTitle = page.getByTestId('id-verify-title');
    await expect(idTitle).toHaveText('Identity Verify');

    // Click CTA to start
    await page.getByTestId('id-verify-start-btn').click();
    
    // Step 2: "Scanning ID Document..."
    await expect(page.locator('h3:has-text("Scanning ID Document...")')).toBeVisible();
    
    // Step 3: Success "Verified!"
    const successTitle = page.getByTestId('id-verify-title');
    await expect(successTitle).toHaveText('Verified!', { timeout: 10000 });
    
    // Click CTA to finish and go to dashboard
    await page.getByTestId('id-verify-finish-btn').click();
    await expect(page).toHaveURL(/\/dashboard/);

    // TC-CHKT-018 Recovery: Navigate back to /store and re-attempt checkout
    await page.goto('/store');
    await checkoutPage.openCheckout();
    
    // Expected: Checkout modal opens this time (KYC gate bypassed)
    await expect(checkoutPage.modal).toBeVisible();
  });
});
