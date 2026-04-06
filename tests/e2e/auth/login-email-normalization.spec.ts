import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-003: Email Normalization @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // Enter email with leading/trailing spaces and mixed casing
  await loginPage.login('  ACTIVE@KODA.TEST  ');
  
  // Should normalize and log in successfully
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('nav').first()).toContainText('Alex Johnson');
});
