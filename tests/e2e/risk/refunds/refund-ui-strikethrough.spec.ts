import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RFND-005: Refund UI Price Strikethrough @regression @risk @refunds', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.waitForURL(/.*dashboard/);
  
  await page.goto('/store');
  await checkoutPage.openCheckoutFor('iPhone 15 Pro');
  // iPhone is $999.
  await checkoutPage.selectTerm(4);
  await checkoutPage.confirmPurchase();

  await expect(page).toHaveURL(/.*dashboard/);
  await page.waitForTimeout(2000); 

  const orderCard = paymentPage.orderCardByMerchant('Apple');
  
  // Apply $100 refund
  await paymentPage.openRefund('Apple');
  await paymentPage.enterRefundAmount(100);
  await paymentPage.applyRefund();

  await expect(page.getByTestId('refund-success')).toBeVisible();
  await expect(page.getByTestId('refund-modal')).not.toBeVisible();

  // Verify UI shows strikethrough original price and new total
  // New total is 999 - 100 = 899
  await expect(orderCard.getByText('$899')).toBeVisible();
  
  // The original price should have line-through class or similar
  // Looking at OrderCard.tsx: <span className="... line-through ...">
  const strikethroughPrice = orderCard.locator('span.line-through');
  await expect(strikethroughPrice).toBeVisible();
  await expect(strikethroughPrice).toContainText('$999');

  // Refunded label
  await expect(orderCard.getByText('$100 Refunded')).toBeVisible();
});
