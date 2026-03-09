import { expect, test } from '@playwright/test';
import { registerGithubApiMock } from './githubApiMock';

test.describe('GitHub dashboard app', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('use-custom-dashboard', 'false');
    });
    await registerGithubApiMock(page);
  });

  test('signs in, loads the dashboard, and navigates to advanced search', async ({ page }) => {
    await page.goto('/');

    await page.getByLabel(/personal access token/i).fill('github_pat_test');
    await page.getByRole('button', { name: /^sign in$/i }).click();

    await expect(page.getByRole('heading', { name: /github workspace/i })).toBeVisible();
    await expect(page.locator('select').nth(1)).toHaveValue('all');

    await page.getByRole('link', { name: /advanced search/i }).click();

    await expect(page.getByRole('heading', { name: /search github data/i })).toBeVisible();
    await expect(page.getByText(/needs review/i)).toBeVisible();
  });
});
