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
    this.applyRefundButton = page.getByTestId('refund-submit-btn');
    this.refundSuccessScreen = page.getByTestId('refund-success');
  }

  /** Get a specific order card by index (0 = most recent) */
  orderCard(index: number): Locator {
    return this.orderCards.nth(index);
  }

  /** Get an order card by merchant name */
  orderCardByMerchant(name: string): Locator {
    return this.page.locator(`[data-merchant="${name}"]`);
  }

  /** Click "Pay" on a specific order card to open PaymentModal */
  async openPayment(indexOrName: number | string) {
    const card = typeof indexOrName === 'number' ? this.orderCard(indexOrName) : this.orderCardByMerchant(indexOrName);
    await card.getByTestId('pay-btn').click();
  }

  /** Open the refund modal on a specific order card */
  async openRefund(indexOrName: number | string) {
    const card = typeof indexOrName === 'number' ? this.orderCard(indexOrName) : this.orderCardByMerchant(indexOrName);
    await card.getByTestId('open-refund-modal-btn').click();
  }

  /** Click a quick-select refund percentage button */
  async selectRefundPercent(percent: 25 | 50 | 100) {
    await this.page.getByTestId(`refund-percent-${percent}`).click();
  }

  /** Enter a custom refund amount */
  async enterRefundAmount(amount: number) {
    await this.refundInput.fill(String(amount));
    await this.refundInput.dispatchEvent('input');
    await this.refundInput.dispatchEvent('change');
  }

  /** Submit the refund */
  async applyRefund() {
    await this.applyRefundButton.click();
  }

  /** Click "Simulate Failure" on a specific order card */
  async simulateFailure(index = 0) {
    await this.orderCard(index).getByTestId('simulate-failure-btn').click();
  }

  /** Get the progress bar fill locator for an order card */
  progressBar(index = 0): Locator {
    return this.orderCard(index).getByTestId('order-progress-bar');
  }
}
