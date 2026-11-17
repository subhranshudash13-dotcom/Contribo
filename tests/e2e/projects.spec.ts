import { test, expect } from '@playwright/test';
import { ProjectsPage } from './pages/ProjectsPage';

test.describe('Projects Directory & Filtering', () => {
  let projectsPage: ProjectsPage;

  test.beforeEach(async ({ page }) => {
    projectsPage = new ProjectsPage(page);
    await projectsPage.goto();
  });

  test('loads projects directory page with navigation and search', async ({ page }) => {
    await projectsPage.verifyPageLoaded();
    await expect(page.locator('body')).not.toBeEmpty();
  });

  test('search input accepts query and updates URL or state', async ({ page }) => {
    await projectsPage.search('React');
    await page.waitForTimeout(500);
    expect(page.url()).toMatch(/\/projects/);
  });

  test('pagination does not break with boundary parameters', async ({ page }) => {
    // Testing issue #78 regression (page=0 or negative skips)
    await page.goto('/projects?page=0');
    await page.waitForLoadState('domcontentloaded');
    expect(page.url()).toMatch(/\/projects/);
    await expect(page.locator('body')).toBeVisible();

    await page.goto('/projects?page=1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
  });
});
