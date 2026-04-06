import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-005: Logout Flow @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // Click Logout
  await page.getByTestId('logout-btn').click();

  // Verify redirect to login
  await expect(page).toHaveURL(/.*login/);

  // Verify Auth Guard: attempting to go back to dashboard redirects to login
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/.*login/);
});
