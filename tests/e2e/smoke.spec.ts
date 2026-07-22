import { expect, test } from '@playwright/test';

test('introduction, studio, settings, and chat work', async ({ page }) => {
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'あなたのローカルAIキャラクター' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'はじめる' }).click();
  await expect(page.getByLabel('character stage')).toBeVisible();
  await page.getByPlaceholder('メッセージを入力').fill('こんにちは');
  await page.getByRole('button', { name: '送信' }).click();
  await expect(page.getByLabel('チャットログ')).toContainText('こんにちは');
  await page.getByRole('button', { name: '設定' }).click();
  await expect(page.getByRole('complementary', { name: '設定' })).toBeVisible();
  await page.getByLabel('テーマ').selectOption('forest');
  await page.getByRole('button', { name: '閉じる' }).click();
  await expect(page.locator('main')).toHaveClass(/theme-forest/);
});

test('switches to Arabic and applies RTL direction', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'はじめる' }).click();
  await page.getByRole('button', { name: '設定' }).click();
  await page.getByLabel('言語').selectOption('ar');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('complementary')).toContainText('الإعدادات');
});
