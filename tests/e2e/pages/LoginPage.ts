import { type Page, type Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly githubButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /sign in|welcome/i });
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole('button', { name: /log in|sign in|sign up|continue/i });
    this.githubButton = page.getByRole('button', { name: /github/i });
    this.errorMessage = page.locator('[role="alert"], .text-red-500');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async verifyElementsVisible() {
    await expect(this.page).toHaveURL(/\/login/);
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }
}
