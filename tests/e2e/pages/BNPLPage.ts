/**
 * BNPLPage.ts — Page Object Model
 *
 * Encapsulates interactions with the PlanSelector and PaymentTimeline
 * sub-components inside the checkout modal.
 */
import { Page, Locator } from '@playwright/test';
import type { Term } from '../../../app/src/data/types';

export class BNPLPage {
  readonly page: Page;
  readonly planSelector: Locator;
  readonly paymentTimeline: Locator;
  readonly feeDisplay: Locator;
  readonly totalDisplay: Locator;
  readonly firstPaymentDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.planSelector = page.getByTestId('plan-selector');
    this.paymentTimeline = page.getByTestId('payment-timeline');
    this.feeDisplay = page.getByTestId('plan-fee');
    this.totalDisplay = page.getByTestId('plan-total');
    this.firstPaymentDisplay = page.getByTestId('plan-first-payment');
  }

  /** Get the term pill locator for a given term */
  termPill(term: Term): Locator {
    return this.page.getByTestId(`term-pill-${term}`);
  }

  /** Get the monthly amount displayed for a term pill */
  termMonthlyAmount(term: Term): Locator {
    return this.page.getByTestId(`term-monthly-${term}`);
  }

  /** Check if "Free" badge is shown for a term (term 4 only) */
  termFreeBadge(term: Term): Locator {
    return this.page.getByTestId(`term-free-badge-${term}`);
  }

  /** Get all timeline row locators */
  timelineRows(): Locator {
    return this.page.getByTestId('timeline-row');
  }

  /** Get the nth timeline row (0-indexed) */
  timelineRow(index: number): Locator {
    return this.timelineRows().nth(index);
  }
}
