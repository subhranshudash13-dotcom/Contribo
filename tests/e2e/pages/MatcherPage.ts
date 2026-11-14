import { type Page, type Locator, expect } from '@playwright/test';

export class MatcherPage {
  readonly page: Page;
  readonly skillsInput: Locator;
  readonly submitButton: Locator;
  readonly resultsList: Locator;

  constructor(page: Page) {
    this.page = page;
    this.skillsInput = page.locator('input[placeholder*="skill" i], textarea[placeholder*="skill" i]');
    this.submitButton = page.getByRole('button', { name: /match|find|generate/i });
    this.resultsList = page.locator('[data-testid="match-card"], .match-card');
  }

  async goto() {
    await this.page.goto('/matcher');
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/matcher/);
  }
}
