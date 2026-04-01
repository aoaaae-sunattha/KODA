import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('should login successfully with valid active user', async ({ page }) => {
    await loginPage.login('active@koda.test');
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify credit gauge exists (shows we are logged in)
    await expect(page.locator('text=Available Credit')).toBeVisible();
  });

  test('should show error with invalid email', async ({ page }) => {
    await loginPage.login('invalid@koda.test');
    
    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(/No account found/);
  });
});
