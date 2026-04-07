import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { PaymentPage } from '../../pages/PaymentPage';

test('TC-RFND-009: RefundModal Processing + Simulation Label @regression @risk @refunds', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const paymentPage = new PaymentPage(page);

  // Preconditions — Refund Modal is open with a valid amount entered.
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await paymentPage.openRefund(0);
  await paymentPage.enterRefundAmount(100);

  // 1. Click the "Submit Refund" button.
  await page.getByTestId('refund-submit-btn').click();

  // Expected Results
  // - A loading spinner is visible for approximately 1.2 seconds.
  await expect(page.getByTestId('refund-spinner')).toBeVisible();

  // - A success screen or confirmation message is displayed after processing.
  await expect(page.getByTestId('refund-success')).toBeVisible({ timeout: 5000 });

  // - A disclaimer label "Simulation only · No real funds moved" is clearly visible on the success screen.
  const simulationLabel = page.getByTestId('refund-simulation-label-success');
  await expect(simulationLabel).toBeVisible();
  await expect(simulationLabel).toContainText(/simulation only/i);
});
