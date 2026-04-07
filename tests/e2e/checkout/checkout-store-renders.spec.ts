import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Store Rendering', () => {
  test('TC-CHKT-012: Store Loads with Product Catalog @tag @checkout @p3', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login('fresh@koda.test');
    
    // Ensure we are on the store page
    await page.goto('/store');
    await expect(page).toHaveURL(/\/store/);

    // Expected: At least 3 product cards are visible
    const productCards = page.getByTestId('product-card');
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(3);
    
    // Each card has a visible price and "Buy with KODA" button
    const firstCard = productCards.first();
    await expect(firstCard.locator('text=$')).toBeVisible();
    await expect(firstCard.getByTestId('buy-with-koda-btn')).toBeVisible();
    
    // Products include items > $500 (iPhone, MacBook, etc.)
    await expect(page.locator('text=iPhone 15 Pro')).toBeVisible();
    await expect(page.locator('text=MacBook Pro 14"')).toBeVisible();
  });
});
