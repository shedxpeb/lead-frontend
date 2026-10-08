import { expect, Page, Request, Response } from '@playwright/test';

export const E2E_USER = {
  email: process.env.E2E_EMAIL || 'e2e.prodqa@pebcrm.test',
  password: process.env.E2E_PASSWORD || 'Test1234!Qa',
};

export type NetworkIssue = {
  kind: 'status' | 'failed' | 'cors' | 'hang' | 'duplicate';
  url: string;
  detail: string;
};

export type ConsoleIssue = {
  type: string;
  text: string;
};

const IGNORED_CONSOLE = [
  /Download the React DevTools/i,
  /\[HMR\]/i,
  /Fast Refresh/i,
  /webpack/i,
];

const ASSET_EXT = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot|css|js|map)(\?|$)/i;

export function attachQaMonitors(page: Page) {
  const consoleIssues: ConsoleIssue[] = [];
  const networkIssues: NetworkIssue[] = [];
  const pending = new Map<string, { url: string; started: number }>();
  const recentGetKeys: string[] = [];
  const duplicateCounts = new Map<string, number>();

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    if (IGNORED_CONSOLE.some((re) => re.test(text))) return;
    if (type === 'error' || type === 'warning') {
      consoleIssues.push({ type, text });
    }
  });

  page.on('pageerror', (err) => {
    consoleIssues.push({ type: 'pageerror', text: err.message });
  });

  page.on('request', (req: Request) => {
    const url = req.url();
    pending.set(req.url() + '|' + req.method() + '|' + Date.now(), {
      url,
      started: Date.now(),
    });

    // Flag burst duplicates of the exact same URL (incl. query). Ignore bootstrap polls.
    const isBootstrap =
      /\/api\/(auth\/me|auth\/refresh|system\/capabilities|health)\b/i.test(url);
    if (
      req.method() === 'GET' &&
      !ASSET_EXT.test(url) &&
      url.includes('/api/') &&
      !isBootstrap
    ) {
      const key = `${req.method()} ${url}`;
      recentGetKeys.push(key);
      if (recentGetKeys.length > 60) recentGetKeys.shift();
      const burst = recentGetKeys.filter((k) => k === key).length;
      if (burst >= 6) {
        duplicateCounts.set(key, burst);
      }
    }
  });

  page.on('requestfailed', (req) => {
    const failure = req.failure()?.errorText || 'failed';
    if (/ERR_ABORTED/i.test(failure)) return;
    networkIssues.push({
      kind: 'failed',
      url: req.url(),
      detail: failure,
    });
    if (/cors/i.test(failure)) {
      networkIssues.push({ kind: 'cors', url: req.url(), detail: failure });
    }
  });

  page.on('response', (res: Response) => {
    const url = res.url();
    const status = res.status();
    if (status === 404 || status >= 500) {
      networkIssues.push({
        kind: 'status',
        url,
        detail: `HTTP ${status}`,
      });
    }
  });

  const assertClean = (opts?: { allowPending404?: boolean }) => {
    const hardConsole = consoleIssues.filter(
      (c) =>
        c.type === 'pageerror' ||
        (c.type === 'error' && !/Failed to load resource/i.test(c.text)),
    );

    const hardNetwork = networkIssues.filter((n) => {
      if (opts?.allowPending404 && n.kind === 'status' && n.detail === 'HTTP 404') {
        // Pending modules may probe endpoints that 404 once then get cached as unavailable.
        return !/\/(documents|finance|inventory|item|task|settings|communications)\b/i.test(n.url);
      }
      return true;
    });

    for (const [key, count] of duplicateCounts) {
      if (count >= 5) {
        hardNetwork.push({
          kind: 'duplicate',
          url: key,
          detail: `${count} identical GETs in short window`,
        });
      }
    }

    expect(hardConsole, `Console issues:\n${JSON.stringify(hardConsole, null, 2)}`).toEqual([]);
    expect(hardNetwork, `Network issues:\n${JSON.stringify(hardNetwork, null, 2)}`).toEqual([]);
  };

  return { consoleIssues, networkIssues, assertClean };
}

export async function loginAsE2E(page: Page) {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'PEB CRM' })).toBeVisible();
  await page.getByPlaceholder('you@example.com').fill(E2E_USER.email);
  await page.getByPlaceholder('Enter your password').fill(E2E_USER.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 30_000 });
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 20_000 });
}

/** Ensure an authenticated dashboard shell; re-login if session was dropped. */
export async function ensureAuthenticated(page: Page) {
  await page.goto('/dashboard');
  const signInBtn = page.getByRole('button', { name: 'Sign in' });
  const signOutBtn = page.getByRole('button', { name: 'Sign out' });
  await Promise.race([
    signOutBtn.waitFor({ state: 'visible', timeout: 20_000 }),
    signInBtn.waitFor({ state: 'visible', timeout: 20_000 }),
  ]).catch(() => undefined);

  if (await signInBtn.isVisible().catch(() => false)) {
    await loginAsE2E(page);
  }
  await expect(signOutBtn).toBeVisible({ timeout: 20_000 });
}

export async function expectNoCrash(page: Page) {
  await expect(page.locator('body')).not.toContainText('Internal Server Error');
  await expect(page.locator('body')).not.toContainText('Application error');
  await expect(page.locator('body')).not.toContainText('Unhandled Runtime Error');
}
