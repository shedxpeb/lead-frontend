#!/usr/bin/env node
/**
 * Static production readiness checks (env, secrets exposure, localhost leaks).
 * Exit 0 = pass, 1 = fail.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const feRoot = path.resolve(__dirname, '..');
const beRoot = path.resolve(feRoot, '../backend');
const failures = [];
const notes = [];

function read(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch {
    return null;
  }
}

function check(name, ok, detail) {
  if (ok) notes.push(`PASS  ${name}${detail ? ` — ${detail}` : ''}`);
  else failures.push(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
}

// Frontend production env
const feProd = read(path.join(feRoot, '.env.production'));
check('.env.production exists', !!feProd);
if (feProd) {
  check(
    'NEXT_PUBLIC_API_URL set',
    /NEXT_PUBLIC_API_URL=/.test(feProd),
    feProd.match(/NEXT_PUBLIC_API_URL=(.*)/)?.[1]?.trim(),
  );
  check(
    'BACKEND_URL not localhost in production file',
    !/BACKEND_URL=https?:\/\/(localhost|127\.0\.0\.1)/i.test(feProd),
    feProd.match(/BACKEND_URL=(.*)/)?.[1]?.trim(),
  );
  check(
    'No client-exposed secrets in NEXT_PUBLIC_',
    !/NEXT_PUBLIC_(JWT|SECRET|PASSWORD|DATABASE|COOKIE)/i.test(feProd),
  );
}

// Frontend source: no localhost API fallback
const apiIndex = read(path.join(feRoot, 'src/core/api/index.ts')) || '';
check(
  'API client requires NEXT_PUBLIC_API_URL (no localhost fallback)',
  apiIndex.includes('Missing required environment variable: NEXT_PUBLIC_API_URL') &&
    !/localhost:8000/.test(apiIndex),
);

// Scan frontend src for hard-coded localhost API hosts (allow comments in tests/scripts)
function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === 'node_modules' || ent.name === '.next') continue;
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|js|jsx)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

const srcFiles = walk(path.join(feRoot, 'src'));
const localhostHits = [];
for (const f of srcFiles) {
  const text = read(f) || '';
  if (/https?:\/\/(localhost|127\.0\.0\.1):\d+/.test(text)) {
    localhostHits.push(path.relative(feRoot, f));
  }
}
check('No hard-coded localhost URLs in frontend/src', localhostHits.length === 0, localhostHits.slice(0, 8).join(', '));

// Backend production guards
const envVal = read(path.join(beRoot, 'src/config/env.validation.ts')) || '';
check('Production rejects weak JWT_SECRET', /JWT_SECRET must be a strong secret/.test(envVal));
check('Production requires COOKIE_SECURE=true', /COOKIE_SECURE must be true/.test(envVal));
check('Production rejects localhost FRONTEND_URL', /FRONTEND_URL/.test(envVal) && /localhost/.test(envVal));

const mainTs = read(path.join(beRoot, 'src/main.ts')) || '';
check('Helmet registered', /helmet/.test(mainTs));
check('CORS requires FRONTEND_URL (no localhost default)', !/localhost:3000/.test(mainTs) || /FRONTEND_URL/.test(mainTs));

const appMod = read(path.join(beRoot, 'src/app.module.ts')) || '';
check('Throttler / rate limiting enabled', /ThrottlerModule/.test(appMod) && /ThrottlerGuard/.test(appMod));

const cookie = read(path.join(beRoot, 'src/auth/cookie.interceptor.ts')) || '';
check('Refresh cookie is httpOnly', /httpOnly:\s*true/.test(cookie));

console.log('\n=== Production static audit ===\n');
for (const n of notes) console.log(n);
for (const f of failures) console.log(f);
console.log(`\nResult: ${failures.length ? 'FAILED' : 'PASSED'} (${notes.length} pass, ${failures.length} fail)\n`);
process.exit(failures.length ? 1 : 0);
