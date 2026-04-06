import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-018: Already-authenticated User visits /login @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);

  // Navigate back to /login while authenticated
  await page.goto('/login');

  // Verify behavior (currently: page renders normally)
  await expect(loginPage.loginForm).toBeVisible();
});
