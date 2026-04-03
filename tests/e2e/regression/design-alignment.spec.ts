import { test, expect } from '@playwright/test'

test.describe('Phase 8.5 — Design Alignment', () => {

  test.describe('Plan Selector', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'power@koda.test')
      await page.fill('input[type="password"]', 'any')
      await page.click('button:has-text("Log in")')
      await page.waitForURL('/dashboard')
      await page.goto('/store')
    })

    test('shows primary terms and hides secondary terms by default', async ({ page }) => {
      // Click first product's "Buy with KODA" button to open checkout
      await page.click('[data-testid="buy-with-koda-btn"]:first-of-type')
      await expect(page.getByTestId('plan-option-4')).toBeVisible()
      await expect(page.getByTestId('plan-option-10')).toBeVisible()
      await expect(page.getByTestId('plan-option-18')).toBeVisible()
      await expect(page.getByTestId('plan-option-24')).toBeVisible()
      await expect(page.getByTestId('plan-option-6')).not.toBeVisible()
      await expect(page.getByTestId('plan-option-8')).not.toBeVisible()
    })

    test('expands secondary terms when "+ other options!" is clicked', async ({ page }) => {
      await page.click('[data-testid="buy-with-koda-btn"]:first-of-type')
      await page.click('[data-testid="expand-other-options"]')
      await expect(page.getByTestId('plan-option-6')).toBeVisible()
      await expect(page.getByTestId('plan-option-8')).toBeVisible()
    })

    test('shows free badge on term 4 and most flexible on term 24', async ({ page }) => {
      // Click fourth product (Specialized Turbo Levo, $15,500) to ensure 24-payment plan is available
      await page.getByTestId('buy-with-koda-btn').nth(3).click()
      await expect(page.getByTestId('plan-badge-free')).toBeVisible()
      await expect(page.getByTestId('plan-badge-flexible')).toBeVisible()
    })
  })

  test.describe('Payment Timeline', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'power@koda.test')
      await page.fill('input[type="password"]', 'any')
      await page.click('button:has-text("Log in")')
      await page.waitForURL('/dashboard')
      await page.goto('/store')
    })

    test('renders timeline cards with progress rings', async ({ page }) => {
      await page.click('[data-testid="buy-with-koda-btn"]:first-of-type')
      await expect(page.getByTestId('timeline-card-0')).toBeVisible()
      await expect(page.getByTestId('timeline-ring-0')).toBeVisible()
      await expect(page.getByTestId('timeline-amount-0')).toBeVisible()
    })

    test('first card shows "Upon checkout"', async ({ page }) => {
      await page.click('[data-testid="buy-with-koda-btn"]:first-of-type')
      const firstCard = page.getByTestId('timeline-card-0')
      await expect(firstCard).toContainText('Upon checkout')
    })
  })

  test.describe('Payment Modal', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
      await page.fill('input[type="email"]', 'power@koda.test')
      await page.fill('input[type="password"]', 'any')
      await page.click('button:has-text("Log in")')
      await page.waitForURL('/dashboard')
    })

    test('opens payment modal when Pay button is clicked', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await expect(page.getByTestId('payment-modal')).toBeVisible()
    })

    test('shows all 3 payment options', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await expect(page.getByTestId('payment-option-next')).toBeVisible()
      await expect(page.getByTestId('payment-option-specific')).toBeVisible()
      await expect(page.getByTestId('payment-option-full')).toBeVisible()
    })

    test('pay next installment updates order card', async ({ page }) => {
      const orderCard = page.getByTestId('order-card').first()
      const paidTextBefore = await orderCard.getByText(/\d+ \/ \d+ Payments/).textContent()

      await page.click('[data-testid="pay-btn"]:first-of-type')
      await page.click('[data-testid="confirm-payment-btn"]')

      // Modal should close
      await expect(page.getByTestId('payment-modal')).not.toBeVisible()
      // Paid count should increase
      const paidTextAfter = await orderCard.getByText(/\d+ \/ \d+ Payments/).textContent()
      expect(paidTextAfter).not.toBe(paidTextBefore)
    })

    test('pay specific amount shows input field', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await page.click('[data-testid="payment-option-specific"]')
      await expect(page.getByTestId('specific-amount-input')).toBeVisible()
    })

    test('pay off full balance completes the order', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await page.click('[data-testid="payment-option-full"]')
      await page.click('[data-testid="confirm-payment-btn"]')
      await expect(page.getByTestId('payment-modal')).not.toBeVisible()
    })

    test('cancel closes the modal', async ({ page }) => {
      await page.click('[data-testid="pay-btn"]:first-of-type')
      await expect(page.getByTestId('payment-modal')).toBeVisible()
      await page.click('[data-testid="cancel-payment-btn"]')
      await expect(page.getByTestId('payment-modal')).not.toBeVisible()
    })
  })
})
