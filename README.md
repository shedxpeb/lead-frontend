# PEB-CRM Frontend

## Supported Runtime

- Node.js `22.x` LTS
- npm `10+`

Use the repo root `.nvmrc` when possible:

```bash
nvm use
```

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build Strategy

This app intentionally uses webpack for both dev and build:

```bash
npm run dev
npm run build
```

Those scripts map to:

```bash
next dev --webpack
next build --webpack
```

This avoids the native SWC path during normal project use on Windows machines where security software blocks `.node` binaries.

## If Windows Blocks `next-swc.win32-x64-msvc.node`

If you see `Application Control policy has blocked this file`, the root cause is outside the application code: WDAC, AppLocker, Defender, antivirus, or other endpoint controls are blocking native modules.

Code-side mitigation in this repo:

- webpack is forced for dev and build
- Node 22 LTS is the supported runtime

Recommended local recovery steps:

```bash
rimraf node_modules .next package-lock.json
npm install
```

If the device is company-managed, IT may still need to allow the blocked native module.
