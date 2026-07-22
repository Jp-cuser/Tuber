import { expect, test } from '@playwright/test';

test('shows the local application status', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'LocalAITuber' }),
  ).toBeVisible();
  await expect(page.getByRole('status')).toContainText('正常に動作');
});
