import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-008: Declined Card User Banner @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('declined@koda.test');
  
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Verify dashboard shows 'Action Required' state
  const banner = page.getByTestId('action-banner');
  await expect(banner).toBeVisible();
  await expect(banner).toContainText('Action Required');
  await expect(banner).toContainText('Payment failed');
  await expect(banner).toContainText('Update Card');
});
