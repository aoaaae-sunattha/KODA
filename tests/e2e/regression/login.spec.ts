import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Flow', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-LOGIN-01: Login page renders correctly', async () => {
    await expect(loginPage.kodaLogo).toBeVisible();
    await expect(loginPage.tagline).toBeVisible();
    await expect(loginPage.emailInput).toHaveAttribute('placeholder', 'active@koda.test');
    await expect(loginPage.passwordInput).toHaveAttribute('placeholder', 'Any password works');
    await expect(loginPage.submitButton).toBeVisible();
    await expect(loginPage.page.locator('text=Demo accounts:')).toBeVisible();
  });

  test('TC-LOGIN-02: Successful login with valid email', async ({ page }) => {
    await loginPage.login('active@koda.test');
    
    // Verify redirection to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Verify user name in nav bar
    await expect(page.locator('nav').first()).toContainText('Alex Johnson');
    await expect(page.locator('nav').first()).toContainText('active');
  });

  const mockAccounts = [
    { email: 'active@koda.test', expectedUrl: /.*dashboard/ },
    { email: 'overdue@koda.test', expectedUrl: /.*dashboard/ },
    { email: 'merchant@koda.test', expectedUrl: /.*merchant/ },
  ];

  for (const account of mockAccounts) {
    test(`TC-LOGIN-03: Login with mock account ${account.email}`, async ({ page }) => {
      await loginPage.login(account.email);
      await expect(page).toHaveURL(account.expectedUrl);
    });
  }

  test('TC-LOGIN-04: Invalid email (verify error message)', async () => {
    await loginPage.login('invalid@koda.test');
    
    // Verify error message
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(/No account found/);
  });

  test('TC-LOGIN-13: Form submission via Enter key', async ({ page }) => {
    await loginPage.emailInput.fill('active@koda.test');
    await loginPage.passwordInput.fill('test');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('TC-LOGIN-14: Session persistence on page refresh', async ({ page }) => {
    await loginPage.login('active@koda.test');
    await expect(page).toHaveURL(/.*dashboard/);
    
    await page.reload();
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('nav').first()).toContainText('Alex Johnson');
  });

  test('TC-LOGIN-15: Demo shortcut data-binding', async () => {
    await loginPage.clickShortcut('overdue@koda.test');
    await expect(loginPage.emailInput).toHaveValue('overdue@koda.test');
    
    await loginPage.clickShortcut('active@koda.test');
    await expect(loginPage.emailInput).toHaveValue('active@koda.test');
  });

  test('TC-LOGIN-16: Input field attribute validation', async () => {
    await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
    await expect(loginPage.emailInput).toHaveAttribute('required', '');
    
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await expect(loginPage.passwordInput).toHaveAttribute('required', '');
  });

  test('TC-LOGIN-17: Verification of Automation Selectors (Data-TestIDs)', async () => {
    await expect(loginPage.loginForm).toBeVisible();
    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
    
    await loginPage.login('invalid@koda.test');
    await expect(loginPage.errorMessage).toBeVisible();
  });
});
