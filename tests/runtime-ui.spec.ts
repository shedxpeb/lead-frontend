import { test, expect } from '@playwright/test';
import { attachQaMonitors, expectNoCrash, loginAsE2E } from './helpers/qa';

test.describe('PEB CRM runtime UI', () => {
  test('login page loads and links work', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'PEB CRM' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await page.getByRole('link', { name: 'Create one' }).click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('seeded user login → open leads', async ({ page }) => {
    const monitors = attachQaMonitors(page);
    await loginAsE2E(page);
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 20_000 });
    await page.goto('/dashboard/leads');
    await expect(page).toHaveURL(/\/dashboard\/leads/);
    if (await page.getByRole('button', { name: 'Sign in' }).isVisible().catch(() => false)) {
      await loginAsE2E(page);
      await page.goto('/dashboard/leads');
    }
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible({ timeout: 20_000 });
    await expectNoCrash(page);
    monitors.assertClean({ allowPending404: true });
  });

  test('API proxy health responds', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    const dbStatus = body.details?.database?.status ?? body.data?.details?.database?.status;
    expect(dbStatus).toBe('up');
  });
});
