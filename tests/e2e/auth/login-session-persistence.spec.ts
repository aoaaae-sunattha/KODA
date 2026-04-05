import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-14: Session persistence on page refresh @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('active@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);
  
  await page.reload();
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.locator('nav').first()).toContainText('Alex Johnson');
});
