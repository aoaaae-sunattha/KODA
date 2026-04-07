import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';

test('TC-PAY-009: Payment Modal Shows All 3 Options @smoke @regression @risk @payment', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);

  // Preconditions — Logged in as active@koda.test. Open an order details view and click "Pay".
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  await paymentPage.openPayment(0);
  
  // Expected Results
  // - All 3 radio labels are present and correctly worded
  await expect(page.getByTestId('payment-option-next')).toContainText('Pay my next installment');
  await expect(page.getByTestId('payment-option-specific')).toContainText('Pay specific amount');
  await expect(page.getByTestId('payment-option-full')).toContainText('Pay off my balance in full');
});
