/**
 * PaymentPage.ts — Page Object Model
 *
 * Encapsulates interactions with the Dashboard payment controls:
 *   - OrderCard "Pay Now" button
 *   - RefundModal
 *   - Simulate Failure / Simulate Refund buttons
 */
import { Page, Locator } from '@playwright/test';

export class PaymentPage {
  readonly page: Page;
  readonly orderCards: Locator;
  readonly refundModal: Locator;
  readonly refundInput: Locator;
  readonly applyRefundButton: Locator;
  readonly refundSuccessScreen: Locator;

  constructor(page: Page) {
    this.page = page;
    this.orderCards = page.getByTestId('order-card');
    this.refundModal = page.getByTestId('refund-modal');
    this.refundInput = page.getByTestId('refund-amount-input');
    this.applyRefundButton = page.getByTestId('apply-refund-button');
    this.refundSuccessScreen = page.getByTestId('refund-success');
  }

  /** Get a specific order card by index (0 = most recent) */
  orderCard(index: number): Locator {
    return this.orderCards.nth(index);
  }

  /** Click "Pay Now" on a specific order card */
  async payNow(index = 0) {
    await this.orderCard(index).getByTestId('pay-now-button').click();
  }

  /** Open the refund modal on a specific order card */
  async openRefund(index = 0) {
    await this.orderCard(index).getByTestId('refund-button').click();
  }

  /** Click a quick-select refund percentage button */
  async selectRefundPercent(percent: 25 | 50 | 100) {
    await this.page.getByTestId(`refund-percent-${percent}`).click();
  }

  /** Enter a custom refund amount */
  async enterRefundAmount(amount: number) {
    await this.refundInput.fill(String(amount));
  }

  /** Submit the refund */
  async applyRefund() {
    await this.applyRefundButton.click();
  }

  /** Click "Simulate Failure" on a specific order card */
  async simulateFailure(index = 0) {
    await this.orderCard(index).getByTestId('simulate-failure-button').click();
  }

  /** Get the progress bar fill locator for an order card */
  progressBar(index = 0): Locator {
    return this.orderCard(index).getByTestId('order-progress-bar');
  }
}
