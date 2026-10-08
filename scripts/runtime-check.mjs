const API = process.env.API_URL || 'http://localhost:8000';
const WEB = process.env.WEB_URL || 'http://localhost:3000';

async function check(name, fn) {
  try {
    await fn();
    console.log(`PASS ${name}`);
    return true;
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message}`);
    return false;
  }
}

const results = [];

results.push(await check('backend health', async () => {
  const res = await fetch(`${API}/health`);
  if (!res.ok) throw new Error(`status ${res.status}`);
  const json = await res.json();
  const dbStatus =
    json.data?.details?.database?.status ??
    json.details?.database?.status ??
    json.info?.database?.status;
  if (dbStatus !== 'up') throw new Error('database down');
}));

results.push(await check('frontend login page', async () => {
  const res = await fetch(`${WEB}/login`);
  if (!res.ok) throw new Error(`status ${res.status}`);
}));

results.push(await check('frontend proxy health', async () => {
  const res = await fetch(`${WEB}/api/health`);
  if (!res.ok) throw new Error(`status ${res.status}`);
}));

results.push(await check('auth register', async () => {
  const suffix = Date.now();
  const email = `check.${suffix}@test.com`;
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email,
      password: 'Test1234',
      confirmPassword: 'Test1234',
      name: 'Check User',
      companyName: `Check Co ${suffix}`,
    }),
  });
  if (!res.ok) throw new Error(`status ${res.status}`);
}));

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} checks passed`);
process.exit(passed === results.length ? 0 : 1);
