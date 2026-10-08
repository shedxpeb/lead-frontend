import { test, expect, Page, BrowserContext } from '@playwright/test';
import {
  attachQaMonitors,
  ensureAuthenticated,
  expectNoCrash,
  loginAsE2E,
} from './helpers/qa';

const noAuth = { cookies: [], origins: [] };

test.describe('Production gate — auth (logged out)', () => {
  test.use({ storageState: noAuth });

  test('login page + protected URL redirect', async ({ page }) => {
    const monitors = attachQaMonitors(page);
    await page.goto('/dashboard/leads');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    monitors.assertClean();
  });

  test('invalid credentials show error', async ({ page }) => {
    await page.goto('/login');
    // Use a non-E2E identity so failed attempts do not lock the shared QA user.
    await page.getByPlaceholder('you@example.com').fill('invalid.login@pebcrm.test');
    await page.getByPlaceholder('Enter your password').fill('WrongPassword1!');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});

/**
 * One browser context for all authenticated checks.
 * Refresh-token rotation invalidates storageState between separate contexts.
 */
test.describe('Production gate — authenticated UI', () => {
  test.describe.configure({ mode: 'serial' });
  test.use({ storageState: noAuth });

  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    });
    page = await context.newPage();
    await loginAsE2E(page);
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 20_000 });
  });

  test.afterAll(async () => {
    await context?.close();
  });

  test('Leads: search, export menu, create CRUD', async () => {
    const monitors = attachQaMonitors(page);
    const stamp = Date.now();
    const mobile = `9${String(stamp).slice(-9)}`;
    const email = `lead.${stamp}@pebcrm.test`;

    await page.goto('/dashboard/leads');
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible({ timeout: 20_000 });
    await expectNoCrash(page);

    const search = page.getByPlaceholder(/Search leads/i);
    await expect(search).toBeVisible();
    await search.fill('zzz-no-match');
    await page.waitForTimeout(500);

    const filterBtn = page.locator('button').filter({ hasText: /Filter/i }).first();
    if (await filterBtn.isVisible().catch(() => false)) {
      await filterBtn.click();
      await page.keyboard.press('Escape');
    }

    await page.getByRole('button', { name: /Export/i }).click();
    await expect(page.getByRole('menuitem', { name: /Export All Leads/i })).toBeVisible();
    await page.keyboard.press('Escape');

    for (const mode of ['Kanban', 'Calendar', 'List', 'Table']) {
      const btn = page.getByRole('button', { name: new RegExp(mode, 'i') });
      if (await btn.isVisible().catch(() => false)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    await page.getByRole('button', { name: /Add Lead/i }).click();
    await expect(page.getByRole('heading', { name: 'Create Lead' })).toBeVisible();
    await page.getByPlaceholder('Enter customer name').fill(`QA Lead ${stamp}`);
    await page.getByPlaceholder('Enter company name').fill(`QA Co ${stamp}`);
    await page.getByPlaceholder('Enter mobile number').fill(mobile);
    await page.getByPlaceholder('Enter email address').fill(email);
    await page.getByPlaceholder('Enter project name').fill(`QA Project ${stamp}`);
    await page.getByRole('button', { name: 'Create Lead' }).click();

    await expect(page.getByRole('heading', { name: 'Create Lead' })).toBeHidden({ timeout: 30_000 });
    await search.fill(`QA Lead ${stamp}`);
    await expect(page.getByText(`QA Lead ${stamp}`).first()).toBeVisible({ timeout: 20_000 });

    await page.getByText(`QA Lead ${stamp}`).first().click();
    await page.waitForTimeout(800);
    await expectNoCrash(page);
    monitors.assertClean({ allowPending404: true });
  });

  test('Customers: create modal, search, export, create CRUD', async () => {
    const monitors = attachQaMonitors(page);
    const stamp = Date.now();
    const mobile = `8${String(stamp).slice(-9)}`;

    await page.goto('/dashboard/customers');
    await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible({ timeout: 20_000 });
    await expectNoCrash(page);

    const search = page.getByPlaceholder(/Search by name, company/i);
    await expect(search).toBeVisible();
    await search.fill('zzz-no-match');
    await page.waitForTimeout(400);

    await page.getByRole('button', { name: /Export/i }).click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /Add Customer/i }).click();
    await expect(page.getByRole('heading', { name: 'Create New Customer' })).toBeVisible();
    await page.getByPlaceholder('Enter customer name').fill(`QA Customer ${stamp}`);
    await page.getByPlaceholder('Enter company name').fill(`QA Cust Co ${stamp}`);
    await page.getByPlaceholder('+91 XXXXX XXXXX').first().fill(mobile);
    await page.getByPlaceholder('Enter email address').fill(`cust.${stamp}@pebcrm.test`);
    await page.getByPlaceholder('Enter full address').fill('12 Industrial Area');
    await page.getByPlaceholder('Enter city').fill('Pune');
    await page.getByPlaceholder('Enter state').fill('Maharashtra');
    await page.getByRole('button', { name: 'Create Customer' }).click();

    await expect(page.getByRole('heading', { name: 'Create New Customer' })).toBeHidden({
      timeout: 30_000,
    });
    await search.fill(`QA Customer ${stamp}`);
    await expect(page.getByText(`QA Customer ${stamp}`).first()).toBeVisible({ timeout: 20_000 });
    monitors.assertClean({ allowPending404: true });
  });

  test('Projects: create modal, search, export', async () => {
    const monitors = attachQaMonitors(page);

    await page.goto('/dashboard/projects');
    await expect(page.getByRole('heading', { name: /Projects/i })).toBeVisible({ timeout: 20_000 });
    await expectNoCrash(page);

    const search = page.getByPlaceholder(/Search by name, code/i);
    await expect(search).toBeVisible();
    await search.fill('zzz-no-match');
    await page.waitForTimeout(400);

    await page.getByRole('button', { name: /Export/i }).click();
    await page.waitForTimeout(300);

    await page.getByRole('button', { name: /New Project/i }).click();
    await expect(page.getByRole('heading', { name: 'Create New Project' })).toBeVisible();
    await page.getByPlaceholder('Enter project name').fill('QA Smoke Project');
    await page.getByRole('button', { name: /Cancel/i }).click();
    await expect(page.getByRole('heading', { name: 'Create New Project' })).toBeHidden({
      timeout: 10_000,
    });
    monitors.assertClean({ allowPending404: true });
  });

  test('pending module pages do not crash', async () => {
    const monitors = attachQaMonitors(page);
    const routes = [
      '/dashboard/documents',
      '/dashboard/finance',
      '/dashboard/inventory',
      '/dashboard/item-master',
      '/dashboard/task-management',
      '/dashboard/accounting',
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expectNoCrash(page);
      await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
    }
    monitors.assertClean({ allowPending404: true });
  });

  test('responsive viewports + zoom do not crash leads', async () => {
    const monitors = attachQaMonitors(page);
    await ensureAuthenticated(page);
    await page.goto('/dashboard/leads');
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible({ timeout: 20_000 });

    for (const vp of [
      { width: 390, height: 844 },
      { width: 768, height: 1024 },
      { width: 1280, height: 800 },
      { width: 1920, height: 1080 },
    ]) {
      await page.setViewportSize(vp);
      await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();
      await expectNoCrash(page);
    }

    for (const zoom of [1.25, 1.5, 2]) {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.evaluate((z) => {
        document.body.style.zoom = String(z);
      }, zoom);
      await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible();
      await expectNoCrash(page);
    }

    await page.evaluate(() => {
      document.body.style.zoom = '1';
    });
    monitors.assertClean({ allowPending404: true });
  });

  test('leads initial load timings', async () => {
    const started = Date.now();
    await page.goto('/dashboard/leads');
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible({ timeout: 30_000 });
    const elapsed = Date.now() - started;

    const metrics = await page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
      const paints = performance.getEntriesByType('paint');
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      return {
        domContentLoaded: nav?.domContentLoadedEventEnd ?? null,
        loadEventEnd: nav?.loadEventEnd ?? null,
        fcp: paints.find((p) => p.name === 'first-contentful-paint')?.startTime ?? null,
        lcp: lcpEntries.length ? lcpEntries[lcpEntries.length - 1].startTime : null,
      };
    });

    expect(elapsed, `Leads page took ${elapsed}ms`).toBeLessThan(15_000);
    console.log('[perf] leads load ms=', elapsed, 'metrics=', JSON.stringify(metrics));
  });

  test('session restore → logout → protected URL blocked', async () => {
    const monitors = attachQaMonitors(page);
    await ensureAuthenticated(page);

    await page.reload();
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 20_000 });

    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.waitForURL(/\/login/, { timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();

    await page.goto('/dashboard/customers');
    await page.waitForURL(/\/login/, { timeout: 15_000 });
    monitors.assertClean({ allowPending404: true });
  });
});
