import { type Page, type Locator, expect } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly savedTab: Locator;
  readonly readinessScore: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { name: /dashboard|command center/i });
    this.savedTab = page.locator('button, a').filter({ hasText: /saved|bookmarks/i });
    this.readinessScore = page.locator('[data-testid="readiness-score"], text=/%/');
  }

  async goto() {
    await this.page.goto('/dashboard');
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/(dashboard|login)/);
  }
}
