import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test('TC-CHKT-016: No Primary Card — Confirm Disabled @regression @checkout @p1', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  
  // Step 1: Navigate to /settings/cards
  await page.goto('/settings/cards');
  
  // Step 2: Remove the Mastercard ••••1234
  const cardRow = page.getByTestId('card-item').filter({ hasText: "1234" });
  const deleteBtn = cardRow.getByRole('button', { name: 'Remove' });
  await deleteBtn.click();
  
  // Verify card is removed
  await expect(cardRow).not.toBeVisible();
  
  // Step 3: Navigate to /store
  await page.goto('/store');
  
  // Step 4: Attempt checkout for iPhone 15 Pro
  await checkoutPage.openCheckoutFor('iPhone 15 Pro');
  
  // Expected: Modal opens
  await expect(checkoutPage.modal).toBeVisible();
  
  // Footer shows warning
  await expect(page.getByText('No payment method found')).toBeVisible();
  
  // Confirm button is disabled
  const confirmBtn = page.getByTestId('checkout-confirm-btn');
  await expect(confirmBtn).toBeDisabled();
});
