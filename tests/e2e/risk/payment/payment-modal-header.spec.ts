import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';

test('TC-PAY-010: Payment Modal Header Shows Merchant Name and Balance @regression @risk @payment', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);

  // Preconditions — Logged in as active@koda.test. Alex Johnson has Sinnerup ($1000 total, 1st paid).
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  await paymentPage.openPayment(0);
  
  // Expected Results
  // - The merchant's name is correctly displayed in the modal header.
  // - The total remaining balance for the order is displayed correctly ($750).
  const paymentModal = page.getByTestId('payment-modal');
  await expect(paymentModal.getByRole('heading')).toHaveText('Sinnerup');
  await expect(paymentModal.getByText(/remaining:/i)).toContainText('$750');
});
