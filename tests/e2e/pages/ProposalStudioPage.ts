import { type Page, type Locator, expect } from '@playwright/test';

export class ProposalStudioPage {
  readonly page: Page;
  readonly newDraftButton: Locator;
  readonly editorPanels: Locator;
  readonly saveIndicator: Locator;
  readonly wordCounter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newDraftButton = page.getByRole('button', { name: /new draft|create proposal|start/i });
    this.editorPanels = page.locator('[data-section], textarea, [contenteditable="true"]');
    this.saveIndicator = page.locator('text=/saved|saving/i');
    this.wordCounter = page.locator('[data-testid="word-counter"], text=/words/i');
  }

  async goto() {
    await this.page.goto('/proposal-studio');
  }

  async verifyPageLoaded() {
    await expect(this.page).toHaveURL(/\/proposal-studio/);
  }
}
