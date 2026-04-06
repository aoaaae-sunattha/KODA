import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-026: Risk Alert Modal — Close via X Button @regression @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('maxed@koda.test');
  await page.goto('/store');

  // Step 1: Trigger risk alert
  await checkoutPage.openCheckout();

  // Step 2: Verify Risk Alert Modal appears
  const riskModal = page.getByTestId('risk-alert-modal');
  await expect(riskModal).toBeVisible();

  // Step 3: Click the X close button (top-right of modal)
  await page.getByTestId('risk-alert-close').click();

  // Expected: Risk Alert Modal closes, User remains on /store
  await expect(riskModal).not.toBeVisible();
  await expect(page).toHaveURL(/\/store/);
});
