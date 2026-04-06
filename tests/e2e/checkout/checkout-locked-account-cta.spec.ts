import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-023: Locked Account — "Go to Dashboard to Pay" CTA Navigates @smoke @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Precondition: User overdue@koda.test (locked)
  await loginPage.goto();
  await loginPage.login('overdue@koda.test');
  await page.goto('/store');

  // Step 1: Click "Buy with KODA"
  await checkoutPage.openCheckout();

  // Step 2: Verify Risk Alert Modal appears with title "Account Locked"
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();
  await expect(page.getByTestId('risk-alert-title')).toHaveText('Account Locked');

  // Step 3: Click the "Go to Dashboard to Pay" button
  const riskBtn = page.getByTestId('risk-alert-btn');
  await expect(riskBtn).toHaveText('Go to Dashboard to Pay');
  await riskBtn.click();

  // Expected: User navigates to /dashboard
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(riskModal).not.toBeVisible();
});
