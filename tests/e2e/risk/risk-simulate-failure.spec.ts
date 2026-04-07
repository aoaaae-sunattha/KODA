import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PaymentPage } from '../pages/PaymentPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-005: Simulate Payment Failure (Happy Path) @smoke @regression @risk', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);

  // Preconditions — User logged in as active@koda.test. User has at least one active order.
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. On the Dashboard, find an active order card.
  const orderCard = paymentPage.orderCard(0);
  await expect(orderCard).toBeVisible();

  // 2. Click the "Simulate Failure" button.
  await paymentPage.simulateFailure(0);

  // Expected Results
  // - Order status changes to "Overdue" (Red badge).
  // Use a more specific locator or wait
  const statusBadge = orderCard.getByTestId('order-status');
  await expect(statusBadge).toHaveText(/overdue/i, { timeout: 10000 });

  // - Account status banner appears: "Account Locked: Overdue Balance".
  const lockedBanner = page.getByTestId('locked-banner');
  await expect(lockedBanner).toBeVisible();
  await expect(lockedBanner).toContainText('Account Locked');

  // - Global accountStatus transitions to Locked. 
  // - Attempting to checkout on the Storefront is now blocked (TC-RISK-001 behavior).
  await page.goto('/store');
  await page.getByTestId('buy-with-koda-btn').first().click();
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();
  await expect(page.getByTestId('risk-alert-title')).toHaveText('Account Locked');
});
