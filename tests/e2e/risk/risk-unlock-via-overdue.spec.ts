import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-004: Unlock Account via Pay Overdue (Happy Path) @smoke @regression @risk', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Preconditions — User logged in as overdue@koda.test (Account Status: Locked)
  await loginPage.goto();
  await loginPage.login('overdue@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. On the Dashboard, click the "Pay Overdue" button in the warning banner
  const lockedBanner = page.getByTestId('locked-banner');
  await expect(lockedBanner).toBeVisible();

  const payOverdueBtn = page.getByTestId('pay-overdue-btn');
  await payOverdueBtn.click();

  // Expected Results
  // - Account status transitions from Locked to Active
  // - All "Locked" banners and warnings disappear
  await expect(lockedBanner).not.toBeVisible();
  
  // - Success message is shown
  const successBanner = page.getByTestId('pay-success-banner');
  await expect(successBanner).toBeVisible();
  await expect(successBanner).toContainText('active again');

  // - User can now successfully open the Checkout Modal on the Storefront
  await page.goto('/store');
  await checkoutPage.openCheckout();
  await expect(checkoutPage.modal).toBeVisible();
});
