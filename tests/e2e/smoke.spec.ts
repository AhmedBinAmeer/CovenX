import { test, expect } from '@playwright/test';

test('public CovenX landing experience is reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/CovenX/i);
  await expect(page.getByText(/CovenX is the enterprise Contract Lifecycle Management Platform/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Enter workspace/i })).toBeVisible();
});

test('login route preserves the governed workspace entry', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByText(/Welcome back/i)).toBeVisible();
  await expect(page.getByLabel(/Email/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();
});

test('authenticated shell smoke path can be exercised with a configured test session', async ({ page }) => {
  test.skip(!process.env.COVENX_E2E_EMAIL || !process.env.COVENX_E2E_PASSWORD, 'Set COVENX_E2E_EMAIL and COVENX_E2E_PASSWORD for authenticated E2E coverage.');
  await page.goto('/login');
  await page.getByLabel(/Email/i).fill(process.env.COVENX_E2E_EMAIL!);
  await page.getByLabel(/Password/i).fill(process.env.COVENX_E2E_PASSWORD!);
  await page.getByRole('button', { name: /Sign in|Log in/i }).click();
  await expect(page.getByText(/Live workspace/i)).toBeVisible();
  await page.keyboard.press('Control+K');
  await expect(page.getByRole('dialog', { name: /command palette/i })).toBeVisible();
});
