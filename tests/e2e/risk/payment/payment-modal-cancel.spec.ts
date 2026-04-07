import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';

test('TC-PAY-011: Payment Modal Cancel Dismisses Without Payment @regression @risk @payment', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);

  // Preconditions — Logged in as active@koda.test.
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Click "Pay" to open the Payment Modal.
  const orderCard = paymentPage.orderCard(0);
  await expect(orderCard).toContainText('1 / 4 Payments');
  await paymentPage.openPayment(0);

  // 2. Click the "X" (close) icon or the "Cancel" button.
  await page.getByTestId('cancel-payment-btn').click();

  // Expected Results
  // - The Payment Modal closes immediately.
  await expect(page.getByTestId('payment-modal')).not.toBeVisible();

  // - The paidCount for the order remains unchanged.
  await expect(orderCard).toContainText('1 / 4 Payments');
});
