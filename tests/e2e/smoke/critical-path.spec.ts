/**
 * critical-path.spec.ts — Smoke Suite
 *
 * Tests the single most important user journey end-to-end:
 *   Login → Browse Store → BNPL Checkout → Dashboard confirmation
 *
 * This suite runs on every push (fast, ~30s).
 * If this fails, the build is broken. Nothing else matters.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-SMOKE-01: Critical path — Login → Store → BNPL → Dashboard', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  // Step 1: Login
  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // Step 2: Navigate to store
  await page.getByTestId('nav-link-shop').click();
  await expect(page).toHaveURL(/.*store/);

  // Step 3: Open checkout on first product
  await checkoutPage.openCheckout();
  await expect(checkoutPage.modal).toBeVisible();

  // Step 4: Select a plan and confirm
  await checkoutPage.selectTerm(4);
  await checkoutPage.confirmPurchase();

  // Step 5: Verify order appears on dashboard
  await page.getByRole('link', { name: /dashboard/i }).click();
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByTestId('order-card').first()).toBeVisible();
});

test('TC-SMOKE-02: Auth guard blocks unauthenticated access', async ({ page }) => {
  // Unauthenticated user should be redirected to /login
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/.*login/);

  await page.goto('/store');
  await expect(page).toHaveURL(/.*login/);
});

test('TC-SMOKE-03: Merchant guard blocks shoppers from /merchant', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // Shopper navigating to /merchant should be redirected
  await page.goto('/merchant');
  await expect(page).toHaveURL(/.*dashboard/);
});
