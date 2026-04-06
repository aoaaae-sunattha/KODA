import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-CHKT-021: Product Image Click Also Triggers Checkout Guard @regression @checkout @p3', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.login('new@koda.test');
  await page.goto('/store');
  
  // Navigate back to /store just in case of redirects
  await page.goto('/store');
  await expect(page).toHaveURL(/\/store/);

  // Step 2: Click the product image/emoji of MacBook Pro 14"
  const macCard = page.getByTestId('product-card').filter({ hasText: 'MacBook Pro 14"' }).first();
  const imageDiv = macCard.locator('.aspect-\\[4\\/3\\]'); // The emoji container
  await imageDiv.click();
  
  // Expected: IDVerify modal appears (same guard fires as clicking "Buy with KODA")
  const idModal = page.getByTestId('id-verify-modal');
  await expect(idModal).toBeVisible();
});
