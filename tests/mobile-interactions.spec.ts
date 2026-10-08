import { test, expect } from '@playwright/test';
import { loginAsE2E } from './helpers/qa';

test.describe('Mobile header interactions', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 412, height: 896 });
    await loginAsE2E(page);
    await page.goto('/dashboard/leads');
    await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible({ timeout: 20_000 });
  });

  test('burger opens drawer', async ({ page }) => {
    const burger = page.getByRole('button', { name: /Open navigation/i });
    await expect(burger).toBeVisible();
    await burger.click();

    // Check drawer is open
    const drawer = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(drawer).toBeVisible();
  });

  test('X closes drawer', async ({ page }) => {
    const burger = page.getByRole('button', { name: /Open navigation/i });
    await burger.click();

    const closeButton = page.getByRole('button', { name: 'Close menu' });
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    const drawer = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(drawer).not.toBeVisible();
  });

  test('Dashboard navigation closes drawer', async ({ page }) => {
    const burger = page.getByRole('button', { name: /Open navigation/i });
    await burger.click();

    const dashboardLink = page.getByRole('link', { name: 'Dashboard' });
    await dashboardLink.click();

    await expect(page).toHaveURL(/\/dashboard/);

    const drawer = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(drawer).not.toBeVisible();
  });

  test('Leads navigation closes drawer', async ({ page }) => {
    const burger = page.getByRole('button', { name: /Open navigation/i });
    await burger.click();

    const leadsLink = page.getByRole('link', { name: 'Leads' });
    await leadsLink.click();

    await expect(page).toHaveURL(/\/dashboard\/leads/);

    const drawer = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(drawer).not.toBeVisible();
  });

  test('backdrop closes drawer', async ({ page }) => {
    const burger = page.getByRole('button', { name: /Open navigation/i });
    await burger.click();

    const drawer = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(drawer).toBeVisible();

    // Click backdrop (click outside drawer)
    const backdrop = page.locator('.fixed.inset-0');
    await backdrop.click({ position: { x: 10, y: 10 } });

    await expect(drawer).not.toBeVisible();
  });

  test('Escape closes drawer', async ({ page }) => {
    const burger = page.getByRole('button', { name: /Open navigation/i });
    await burger.click();

    const drawer = page.getByRole('navigation', { name: 'Mobile navigation' });
    await expect(drawer).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(drawer).not.toBeVisible();
  });

  test('profile button opens menu, does NOT navigate to Dashboard', async ({ page }) => {
    const profileButton = page.getByRole('button', { name: /Open profile menu/i });
    await expect(profileButton).toBeVisible();

    const currentUrl = page.url();
    await profileButton.click();

    // Should still be on leads page
    await expect(page).toHaveURL(/\/dashboard\/leads/);

    // Profile menu should be visible
    const profileMenu = page.getByRole('menu');
    await expect(profileMenu).toBeVisible();
  });

  test('profile menu closes on outside click', async ({ page }) => {
    const profileButton = page.getByRole('button', { name: /Open profile menu/i });
    await profileButton.click();

    const profileMenu = page.getByRole('menu');
    await expect(profileMenu).toBeVisible();

    // Click outside
    await page.locator('body').click({ position: { x: 10, y: 10 } });

    await expect(profileMenu).not.toBeVisible();
  });

  test('profile menu closes on Escape', async ({ page }) => {
    const profileButton = page.getByRole('button', { name: /Open profile menu/i });
    await profileButton.click();

    const profileMenu = page.getByRole('menu');
    await expect(profileMenu).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(profileMenu).not.toBeVisible();
  });

  test('logout from profile menu', async ({ page }) => {
    const profileButton = page.getByRole('button', { name: /Open profile menu/i });
    await profileButton.click();

    const logoutButton = page.getByRole('menuitem', { name: 'Logout' });
    await logoutButton.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('logout from drawer', async ({ page }) => {
    const burger = page.getByRole('button', { name: /Open navigation/i });
    await burger.click();

    const logoutButton = page.getByRole('button', { name: 'Logout' });
    await logoutButton.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('no horizontal overflow at 412px', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 896 });

    const body = page.locator('body');
    const bodyBox = await body.boundingBox();

    if (bodyBox) {
      expect(bodyBox.width).toBeLessThanOrEqual(412);
    }

    // Check for horizontal scroll
    const html = page.locator('html');
    const overflowX = await html.evaluate((el) => window.getComputedStyle(el).overflowX);
    expect(overflowX).not.toBe('scroll');
    expect(overflowX).not.toBe('auto');
  });

  test('touch targets at 412px', async ({ page }) => {
    await page.setViewportSize({ width: 412, height: 896 });

    const burger = page.getByRole('button', { name: /Open navigation/i });
    const burgerBox = await burger.boundingBox();
    expect(burgerBox).toBeTruthy();
    if (burgerBox) {
      expect(burgerBox.width).toBeGreaterThanOrEqual(44);
      expect(burgerBox.height).toBeGreaterThanOrEqual(44);
    }

    const profileButton = page.getByRole('button', { name: /Open profile menu/i });
    const profileBox = await profileButton.boundingBox();
    expect(profileBox).toBeTruthy();
    if (profileBox) {
      expect(profileBox.width).toBeGreaterThanOrEqual(44);
      expect(profileBox.height).toBeGreaterThanOrEqual(44);
    }
  });
});

test.describe('Mobile widths', () => {
  const widths = [320, 360, 375, 390, 412, 430];

  for (const width of widths) {
    test(`${width}px - header interactions work`, async ({ page }) => {
      await page.setViewportSize({ width, height: 896 });
      await loginAsE2E(page);
      await page.goto('/dashboard/leads');
      await expect(page.getByRole('heading', { name: 'Leads' })).toBeVisible({ timeout: 20_000 });

      const burger = page.getByRole('button', { name: /Open navigation/i });
      await expect(burger).toBeVisible();
      await burger.click();

      const drawer = page.getByRole('navigation', { name: 'Mobile navigation' });
      await expect(drawer).toBeVisible();

      const closeButton = page.getByRole('button', { name: 'Close menu' });
      await closeButton.click();
      await expect(drawer).not.toBeVisible();
    });
  }
});
