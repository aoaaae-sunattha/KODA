import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';
import { CheckoutPage } from '../../pages/CheckoutPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RFND-004: Refund > Unpaid Balance @regression @risk @refunds', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.waitForURL(/.*dashboard/);
  
  await page.goto('/store');
  await checkoutPage.openCheckoutFor('iPhone 15 Pro');
  // iPhone is $999. Term 4 -> Unpaid = $750 (Installments [249, 249, 252])
  await checkoutPage.selectTerm(4);
  await checkoutPage.confirmPurchase();

  await expect(page).toHaveURL(/.*dashboard/);
  await page.waitForTimeout(2000); 

  await paymentPage.openRefund('Apple');
  
  // Enter amount > 750
  await paymentPage.enterRefundAmount(1000);

  // Check button is disabled
  const submitBtn = page.getByTestId('refund-submit-btn');
  await expect(submitBtn).toBeDisabled();

  // Check max label
  await expect(page.getByTestId('refund-max-amount')).toContainText('$750');

  // Enter exactly 750
  await paymentPage.enterRefundAmount(750);
  await expect(submitBtn).toBeEnabled();
  await paymentPage.applyRefund();

  await expect(page.getByTestId('refund-success')).toBeVisible();
  
  // Verify order is completed
  await expect(page.locator('[data-merchant="Apple"]')).toContainText('Completed', { ignoreCase: true });
});
