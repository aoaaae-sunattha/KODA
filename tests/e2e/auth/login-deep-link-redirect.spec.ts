import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-023: Deep Link to Protected Route Redirect @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  
  // Directly navigate to /store while logged out
  await page.goto('/store');
  await expect(page).toHaveURL(/.*login/);

  // Log in
  await loginPage.login('active@koda.test');

  // Verify behavior (currently: redirects to dashboard, not the original route)
  await expect(page).toHaveURL(/.*dashboard/);
});
