import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly demoShortcuts: Locator;
  readonly kodaLogo: Locator;
  readonly tagline: Locator;
  readonly loginForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
    this.demoShortcuts = page.locator('button[style*="color: rgb(93, 95, 239)"]');
    this.kodaLogo = page.locator('text=-Koda');
    this.tagline = page.locator('text=Buy Now, Pay Later');
    this.loginForm = page.getByTestId('login-form');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string = 'any-password') {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async clickShortcut(email: string) {
    await this.page.getByRole('button', { name: email }).click();
  }
}
