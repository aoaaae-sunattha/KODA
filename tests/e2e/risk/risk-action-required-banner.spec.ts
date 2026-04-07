import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
});

test('TC-RISK-008: Action Required Banner & Navigation @smoke @regression @risk', async ({ page }) => {
  const loginPage = new LoginPage(page);

  // Preconditions — User logged in as declined@koda.test.
  await loginPage.goto();
  await loginPage.login('declined@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // 1. Navigate to the Dashboard.
  // 2. Verify banner text.
  const actionBanner = page.getByTestId('action-banner');
  await expect(actionBanner).toBeVisible();
  
  // Matches US.5 AC1; date is dynamic (today)
  await expect(actionBanner).toContainText('Action Required');
  // Use regex to match any date format or just the static part
  await expect(actionBanner).toContainText(/Payment failed on/);

  // 3. Click the "Update Card" button in the banner.
  const updateCardBtn = page.getByTestId('update-card-btn');
  await updateCardBtn.click();

  // Expected Results
  // - CTA "Update Card" navigates to /settings/cards (matches US.5 AC2)
  await expect(page).toHaveURL(/.*settings\/cards/);
});
