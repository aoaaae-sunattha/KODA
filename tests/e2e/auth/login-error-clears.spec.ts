import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-015: Error State Clears on Valid Re-attempt @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Enter unknown email
  await loginPage.login('ghost@koda.test');
  
  // Verify error message is displayed
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toHaveText(/No account found/);
  
  // Enter valid email
  await loginPage.login('active@koda.test');
  
  // Verify error message disappears and redirect to dashboard
  await expect(loginPage.errorMessage).not.toBeVisible();
  await expect(page).toHaveURL(/.*dashboard/);
});
