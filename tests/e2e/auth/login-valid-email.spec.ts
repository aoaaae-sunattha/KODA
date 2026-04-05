import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-02: Successful login with valid email @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  
  // Verify redirection to dashboard
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Verify user name in nav bar
  await expect(page.locator('nav').first()).toContainText('Alex Johnson');
  await expect(page.locator('nav').first()).toContainText('active');
});
