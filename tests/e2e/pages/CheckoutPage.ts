/**
 * CheckoutPage.ts — Page Object Model
 *
 * Encapsulates interactions with the CheckoutModal + PlanSelector.
 * Used in E2E tests for store → checkout → confirm flows.
 */
import { Page, Locator } from '@playwright/test';
import type { Term } from '../../../app/src/data/types';

export class CheckoutPage {
  readonly page: Page;
  readonly modal: Locator;
  readonly confirmButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId('checkout-modal');
    this.confirmButton = page.getByTestId('checkout-confirm-btn');
    this.closeButton = page.getByTestId('checkout-close');
  }

  /** Click "Buy with KODA" on the first visible product card */
  async openCheckout() {
    await this.page.getByTestId('buy-with-koda-btn').first().click();
  }

  /** Click "Buy with KODA" on a specific product by name */
  async openCheckoutFor(productName: string) {
    await this.page
      .locator('[data-testid="product-card"]', { hasText: productName })
      .getByTestId('buy-with-koda-btn')
      .click();
  }

  /** Select a plan term (e.g., 4, 10, 24) */
  async selectTerm(term: Term) {
    await this.page.getByTestId(`plan-option-${term}`).click();
  }

  /** Click the Confirm Purchase button */
  async confirmPurchase() {
    await this.confirmButton.click();
  }

  /** Close the modal via the X button */
  async close() {
    await this.closeButton.click();
  }

  /** Close the modal by clicking the backdrop */
  async closeViaBackdrop() {
    await this.page.getByTestId('checkout-backdrop').click({ force: true });
  }
}
