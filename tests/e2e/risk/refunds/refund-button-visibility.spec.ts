import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';

test('TC-RFND-007: Refund Button Visibility @smoke @regression @risk @refunds', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);

  // Preconditions — User with active and completed orders.
  // power@koda.test has completed orders (Bolia, Illums Bolighus) 
  // and active orders (Bang & Olufsen, Sneakersnstuff).
  await loginPage.goto();
  await loginPage.login('power@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Observe active order (Sneakersnstuff - 2 of 8 paid)
  const activeOrder = page.locator('[data-merchant="Sneakersnstuff"]');
  await expect(activeOrder.getByTestId('open-refund-modal-btn')).toBeVisible();

  // 2. Observe completed order (Bolia - 4 of 4 paid)
  const completedOrder = page.locator('[data-merchant="Bolia"]');
  await expect(completedOrder.getByTestId('open-refund-modal-btn')).not.toBeVisible();

  // Expected Results
  // - "Refund" button is PRESENT on orders with paid installments and unpaid balance.
  // - "Refund" button is ABSENT on fully completed orders.
});
