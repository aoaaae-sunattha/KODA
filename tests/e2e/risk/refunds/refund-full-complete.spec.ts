import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RFND-003: Full Refund (All Unpaid) @smoke @regression @risk @refunds', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Preconditions — Fresh user performs a checkout
  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.waitForURL(/.*dashboard/);
  await page.waitForLoadState('networkidle');

  await page.goto('/store');
  await page.waitForLoadState('networkidle');
  await checkoutPage.openCheckoutFor('Dyson Gen5detect');
  await checkoutPage.confirmPurchase();

  // Wait for redirect and ensure we are on dashboard
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(3000);

  // 1. Apply a full refund of remaining balance
  // Dyson is $949, term 4 (0% fee). calculatePlan uses Math.floor:
  // base=237, remainder=1 → installments=[237, 237, 237, 238].
  // First payment (inst 0) = $237. Remaining = 237 + 237 + 238 = $712.
  const orderCard = paymentPage.orderCardByMerchant('Dyson');
  await expect(orderCard).toBeVisible({ timeout: 10000 });
  await paymentPage.openRefund('Dyson');
  await paymentPage.enterRefundAmount(712);

  await expect(page.getByTestId('refund-submit-btn')).toBeEnabled({ timeout: 5000 });
  await paymentPage.applyRefund();

  // Wait for success screen
  await expect(page.locator('[data-testid="refund-success"]')).toBeVisible({ timeout: 15000 });

  // Wait for modal to auto-close
  await expect(page.getByTestId('refund-modal')).not.toBeVisible({ timeout: 15000 });

  // Expected Results
  // - Order status transitions to completed

  // Let's check the completed section
  const completedHeader = page.getByText(/Completed \(/);
  await expect(completedHeader).toBeVisible({ timeout: 15000 });

  const completedOrder = page.locator('[data-testid="order-card"]').last(); 
  await expect(completedOrder.getByText('Dyson')).toBeVisible();});
