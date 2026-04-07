import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';

test('TC-RFND-008: RefundModal Input + Quick-Select @regression @risk @refunds', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);

  // Preconditions — Logged in as active@koda.test. Open an order details view and click "Refund".
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Observe the Refund Modal
  await paymentPage.openRefund(0);
  const refundModal = page.getByTestId('refund-modal');
  await expect(refundModal).toBeVisible();

  // 2. Enter a value in the free-form refund input field
  await paymentPage.enterRefundAmount(123);
  await expect(page.getByTestId('refund-amount-input')).toHaveValue('123');

  // 3. Click the 25%, 50%, and 100% quick-select buttons
  // Sinnerup max refundable is $750 (3 * $250)
  await page.getByTestId('refund-percent-25').click();
  await expect(page.getByTestId('refund-amount-input')).toHaveValue('188'); // Math.round(750 * 0.25) = 187.5 -> 188

  await page.getByTestId('refund-percent-50').click();
  await expect(page.getByTestId('refund-amount-input')).toHaveValue('375'); // 750 * 0.5 = 375

  await page.getByTestId('refund-percent-100').click();
  await expect(page.getByTestId('refund-amount-input')).toHaveValue('750');

  // 4. Try to enter a value higher than the total unpaid balance
  await paymentPage.enterRefundAmount(800);
  // The input should have 'max' attribute set
  await expect(page.getByTestId('refund-amount-input')).toHaveAttribute('max', '750');
  
  // Submit button should be disabled
  await expect(page.getByTestId('refund-submit-btn')).toBeDisabled();
});
