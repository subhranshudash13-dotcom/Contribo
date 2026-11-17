import { type Page, type Locator, expect } from '@playwright/test';

export class ProjectsPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly programFilter: Locator;
  readonly sortSelect: Locator;
  readonly projectCards: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
    this.programFilter = page.locator('button, select').filter({ hasText: /program|all programs/i });
    this.sortSelect = page.locator('select, [data-testid="sort-select"]').filter({ hasText: /sort/i });
    this.projectCards = page.locator('[data-testid="project-card"], a[href*="/projects/"]');
  }

  async goto() {
    await this.page.goto('/projects');
  }

  async search(query: string) {
    if (await this.searchInput.isVisible()) {
      await this.searchInput.fill(query);
      await this.page.keyboard.press('Enter');
    }
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/projects/);
  }
}
