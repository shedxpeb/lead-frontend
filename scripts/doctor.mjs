#!/usr/bin/env node
/**
 * PEB CRM - Environment Doctor
 * Read-only health check for the local development environment.
 * Usage: npm run doctor
 *
 * Exit code: 0 if no CRITICAL checks, 1 if any CRITICAL check fails.
 * This script only READS state. It never kills processes or edits files.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import os from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');

const C = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', gray: '\x1b[90m', bold: '\x1b[1m',
};

const results = [];
function add(status, label, detail, fix) {
  results.push({ status, label, detail, fix });
}

function sh(cmd) {
  try {
    return execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function semverMajor(v) {
  const m = String(v).replace(/^[^\d]*/, '').match(/^(\d+)/);
  return m ? Number(m[1]) : NaN;
}

const isWindows = process.platform === 'win32';

// --- 1. Node version ---
const nodeMajor = semverMajor(process.version);
if (nodeMajor >= 20 && nodeMajor <= 22) {
  add('OK', 'Node version', `${process.version} (LTS-compatible)`);
} else if (nodeMajor > 22) {
  add('WARN', 'Node version', `${process.version} is non-LTS / newer than recommended`,
    'Next 16 targets Node 20 or 22 LTS. Non-LTS Node can trigger Turbopack/Tokio panics. Install Node 22 (see .nvmrc).');
} else {
  add('CRITICAL', 'Node version', `${process.version} is too old for Next 16`,
    'Upgrade to Node 22 LTS.');
}

// --- 2. npm version ---
const npmV = sh('npm -v');
if (npmV) {
  add(semverMajor(npmV) >= 10 ? 'OK' : 'WARN', 'npm version', npmV,
    semverMajor(npmV) >= 10 ? undefined : 'Upgrade npm to v10+.');
} else {
  add('WARN', 'npm version', 'could not detect npm');
}

// --- 3. Dependency versions (React / Next / TypeScript) ---
const pkg = readJson(join(projectRoot, 'package.json'));
function depVersion(name) {
  const lockPath = join(projectRoot, 'package-lock.json');
  const installed = join(projectRoot, 'node_modules', name, 'package.json');
  if (existsSync(installed)) {
    const p = readJson(installed);
    if (p?.version) return p.version;
  }
  if (pkg) return pkg.dependencies?.[name] || pkg.devDependencies?.[name] || '(not found)';
  void lockPath;
  return '(unknown)';
}
add('OK', 'Next.js', depVersion('next'));
add('OK', 'React', depVersion('react'));
add('OK', 'TypeScript', depVersion('typescript'));

// --- 4. engines field present ---
if (pkg?.engines?.node) {
  add('OK', 'engines.node', pkg.engines.node);
} else {
  add('WARN', 'engines.node', 'not set', 'Add an engines field to flag wrong Node versions.');
}

// --- 5. Available RAM ---
const totalGB = os.totalmem() / 1024 ** 3;
const freeGB = os.freemem() / 1024 ** 3;
const usedPct = ((totalGB - freeGB) / totalGB) * 100;
const ramDetail = `${freeGB.toFixed(1)}GB free / ${totalGB.toFixed(1)}GB total (${usedPct.toFixed(0)}% used)`;
if (usedPct < 75) add('OK', 'RAM headroom', ramDetail);
else if (usedPct < 90) add('WARN', 'RAM headroom', ramDetail, 'Close extra Chrome tabs / stray dev servers. Consider 16GB RAM.');
else add('CRITICAL', 'RAM headroom', ramDetail, 'Run cleanup (scripts/clean-node-workers.ps1), close apps, restart dev server.');

// --- 6. CPU cores ---
const cores = os.cpus()?.length || 0;
add(cores >= 8 ? 'OK' : 'WARN', 'CPU cores', `${cores} logical`,
  cores >= 8 ? undefined : 'Few cores for Turbopack; avoid running multiple builds at once.');

// --- 7. Port availability (3000 dev) ---
if (isWindows) {
  const net = sh('netstat -ano -p tcp');
  const lines = net.split(/\r?\n/).filter((l) => /:3000\s/.test(l) && /LISTENING/i.test(l));
  if (lines.length === 0) {
    add('OK', 'Port 3000', 'free');
  } else {
    const pid = lines[0].trim().split(/\s+/).pop();
    add('WARN', 'Port 3000', `in use by PID ${pid}`,
      'A dev server is already running. Reuse it or stop it before starting another.');
  }
}

// --- 8. Stray Next/PostCSS workers ---
if (isWindows) {
  const raw = sh('powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"Name=\'node.exe\'\\" | Where-Object { $_.CommandLine -match \'postcss.js\' }).Count"');
  const count = Number(raw) || 0;
  if (count === 0) add('OK', 'Stray PostCSS workers', '0');
  else if (count < 20) add('WARN', 'Stray PostCSS workers', String(count), 'Run scripts/clean-node-workers.ps1');
  else add('CRITICAL', 'Stray PostCSS workers', String(count), 'Worker leak. Run scripts/clean-node-workers.ps1 now.');
}

// --- 9. Turbopack / Next cache ---
const nextDir = join(projectRoot, '.next');
add(existsSync(nextDir) ? 'OK' : 'OK', '.next cache', existsSync(nextDir) ? 'present' : 'clean (none)');

// --- 10. Cursor watcher excludes ---
const vscodeSettings = readJson(join(projectRoot, '..', '..', '.vscode', 'settings.json'));
if (vscodeSettings?.['files.watcherExclude']) {
  add('OK', 'Cursor watcher excludes', 'configured');
} else {
  add('WARN', 'Cursor watcher excludes', 'not found at workspace root',
    'Add .vscode/settings.json with files.watcherExclude for node_modules/.next.');
}

// --- 11. Git autofetch ---
if (vscodeSettings && vscodeSettings['git.autofetch'] === false) {
  add('OK', 'Git autofetch', 'disabled');
} else {
  add('WARN', 'Git autofetch', 'not disabled', 'Set "git.autofetch": false to reduce background network/CPU.');
}

// --- 12. Disk space (project drive) ---
if (isWindows) {
  const free = sh('powershell -NoProfile -Command "[math]::Round((Get-PSDrive C).Free/1GB,1)"');
  if (free) {
    const g = Number(free);
    if (g > 10) add('OK', 'Disk free (C:)', `${g}GB`);
    else if (g > 3) add('WARN', 'Disk free (C:)', `${g}GB`, 'Low disk can corrupt Turbopack cache. Clean TEMP.');
    else add('CRITICAL', 'Disk free (C:)', `${g}GB`, 'Very low disk. Free space before building.');
  }
}

// --- 13. MCP config ---
const mcpPath = join(os.homedir(), '.cursor', 'mcp.json');
const mcp = readJson(mcpPath);
if (mcp?.mcpServers) {
  const names = Object.keys(mcp.mcpServers);
  const plaintextKey = JSON.stringify(mcp).match(/sk-[A-Za-z0-9_-]{20,}/);
  add(plaintextKey ? 'WARN' : 'OK', 'MCP servers', names.join(', ') || 'none',
    plaintextKey ? 'An API key is stored in plaintext in mcp.json. Rotate it and use env vars.' : undefined);
} else {
  add('OK', 'MCP servers', 'none configured');
}

// --- Render ---
const icon = { OK: `${C.green}HEALTHY ${C.reset}`, WARN: `${C.yellow}WARNING ${C.reset}`, CRITICAL: `${C.red}CRITICAL${C.reset}` };
console.log(`\n${C.bold}${C.cyan}PEB CRM - Environment Doctor${C.reset}\n${C.gray}${new Date().toLocaleString()}${C.reset}\n`);
for (const r of results) {
  console.log(`  ${icon[r.status]}  ${C.bold}${r.label}${C.reset}: ${r.detail}`);
  if (r.fix && r.status !== 'OK') console.log(`            ${C.gray}-> ${r.fix}${C.reset}`);
}

const counts = results.reduce((a, r) => ((a[r.status] = (a[r.status] || 0) + 1), a), {});
console.log(`\n  ${C.green}${counts.OK || 0} healthy${C.reset}  |  ${C.yellow}${counts.WARN || 0} warning${C.reset}  |  ${C.red}${counts.CRITICAL || 0} critical${C.reset}\n`);

process.exit((counts.CRITICAL || 0) > 0 ? 1 : 0);
