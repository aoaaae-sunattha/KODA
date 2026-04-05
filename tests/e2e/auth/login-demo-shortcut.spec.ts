import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-15: Demo shortcut data-binding @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.clickShortcut('overdue@koda.test');
  await expect(loginPage.emailInput).toHaveValue('overdue@koda.test');
  
  await loginPage.clickShortcut('active@koda.test');
  await expect(loginPage.emailInput).toHaveValue('active@koda.test');
});
