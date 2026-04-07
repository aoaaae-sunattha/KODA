import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RFND-002: Refund Matching Multiple Installments @regression @risk @refunds', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.waitForURL(/.*dashboard/);
  
  await page.goto('/store');
  await checkoutPage.openCheckoutFor('iPhone 15 Pro');
  // iPhone is $999. Term 4 is interest-free.
  // Installments: [249, 249, 249, 252] (remainder on last)
  // 1st is paid at checkout. Unpaid: [249, 249, 252].
  await checkoutPage.selectTerm(4);
  await checkoutPage.confirmPurchase();

  await expect(page).toHaveURL(/.*dashboard/);
  await page.waitForTimeout(2000); 

  // Apply $350 refund
  // Logic: 
  // - Clear #4 ($252) -> $0. Remaining: $98
  // - Deduct from #3 ($249) -> 249 - 98 = $151.
  await paymentPage.openRefund('Apple');
  await paymentPage.enterRefundAmount(350);
  await paymentPage.applyRefund();

  await expect(page.getByTestId('refund-success')).toBeVisible();
  await expect(page.getByTestId('refund-modal')).not.toBeVisible();

  // Verify schedule (timeline-amount-{i} uses 0-based index)
  const orderCard = paymentPage.orderCardByMerchant('Apple');
  await orderCard.getByTestId('toggle-schedule-btn').click();

  // Check installment #4 (index 3) is $0
  await expect(page.getByTestId('timeline-amount-3')).toContainText('$0');
  // Check installment #3 (index 2) is $151
  await expect(page.getByTestId('timeline-amount-2')).toContainText('$151');
  // Check installment #2 (index 1) is still $249
  await expect(page.getByTestId('timeline-amount-1')).toContainText('$249');
});
