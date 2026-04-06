import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-017: action_required CTA Navigates to /settings/cards (Bug Validation) @smoke @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Precondition: Logged in as declined@koda.test (card declined)
  await loginPage.goto();
  await loginPage.login('declined@koda.test');
  await expect(page).toHaveURL(/\/dashboard/);

  // Step 1: Navigate to /store
  await page.goto('/store');
  await expect(page).toHaveURL(/\/store/);

  // Step 2: Trigger risk alert by clicking "Buy with KODA"
  await checkoutPage.openCheckout();

  // Expected: Checkout modal does NOT open
  await expect(checkoutPage.modal).not.toBeVisible();

  // Expected: Risk Alert Modal appears with title "Payment Issue"
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();
  await expect(page.getByTestId('risk-alert-title')).toHaveText('Payment Issue');

  // Step 3: Click the "Manage Cards" button
  const manageCardsBtn = page.getByTestId('risk-alert-btn');
  await expect(manageCardsBtn).toHaveText('Manage Cards');
  await manageCardsBtn.click();

  // Expected: User lands at /settings/cards (card management page), not /login
  await expect(page).toHaveURL(/\/settings\/cards/);
  await expect(page.locator('h1:has-text("Payment Methods")')).toBeVisible();
});
