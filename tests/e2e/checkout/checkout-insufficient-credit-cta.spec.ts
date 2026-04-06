import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-022: Insufficient Credit — "Back to Shop" CTA Closes Modal @smoke @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Precondition: User maxed@koda.test (99% used)
  await loginPage.goto();
  await loginPage.login('maxed@koda.test');
  await page.goto('/store');

  // Step 1: Attempt to buy a high-value item
  await checkoutPage.openCheckoutFor('MacBook Pro 14"');

  // Step 2: Verify Risk Alert Modal appears with title "Insufficient Credit"
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();
  await expect(page.getByTestId('risk-alert-title')).toHaveText('Insufficient Credit');

  // Step 3: Click the "Back to Shop" button
  const backToShopBtn = page.getByTestId('risk-alert-btn');
  await expect(backToShopBtn).toHaveText('Back to Shop');
  await backToShopBtn.click();

  // Expected: Risk Alert Modal closes, User remains on /store
  await expect(riskModal).not.toBeVisible();
  await expect(page).toHaveURL(/\/store/);
  await expect(checkoutPage.modal).not.toBeVisible();
});
