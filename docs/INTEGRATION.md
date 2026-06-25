# Integration Guide

This document is for engineers embedding the calculator into an existing website or backend.

## Architecture

```
public/                 # Static UI (Phase 1 layout + Yntraa category breakdown)
src/
  engine/               # Pure TypeScript calculation modules (no I/O)
    phase1.ts           # Current production UI logic
    calculator.ts       # Full workbook engine (billing, VAS, monitoring, etc.)
  config/rate-cards.ts  # Rate tables (single source of truth for percentages)
  api/
    createApp.ts        # Express app factory — use for embedding
    routes/calculator.ts
    normalize.ts        # Request normalization for API payloads
  types/                # Shared input/output contracts
tests/                  # Vitest coverage for engine modules
```

**Rule:** UI never implements pricing logic. All numbers come from `src/engine/*` via HTTP or direct import.

## Integration options

### Option A — Mount the Express app (recommended)

```typescript
import express from "express";
import { createApp } from "cloud-management-calculator/dist/api/createApp.js";

const host = express();

// Your existing routes...
host.use("/tools/ms-calculator", createApp({
  apiMountPath: "/tools/ms-calculator/api",
  publicDir: "/path/to/calculator/public",
}));

host.listen(8080);
```

Set the UI API base before loading the script:

```html
<script>
  window.CALCULATOR_API_BASE = "/tools/ms-calculator/api";
</script>
<script type="module" src="/tools/ms-calculator/js/app.js"></script>
```

### Option B — Static UI + existing API gateway

1. Copy `public/` into your CDN or static asset pipeline.
2. Proxy these routes to a Node service running `createApp({ serveStatic: false })`:
   - `GET  /api/health`
   - `GET  /api/rate-card`
   - `POST /api/phase1/calculate` — **current UI**
   - `POST /api/calculate` — full workbook engine

### Option C — Import engine only (no Express)

```typescript
import { calculatePhase1 } from "./dist/engine/phase1.js";
import { calculate } from "./dist/engine/calculator.js";
import { RATE_CARD } from "./dist/config/rate-cards.js";
```

Build first: `npm run build`

## API contracts

### `POST /api/phase1/calculate` (production UI)

**Request** (Yntraa example):

```json
{
  "cloudType": "yntraa",
  "serviceSpends": {
    "computeServices": 5000,
    "storageServices": 2000,
    "backupServices": 200000,
    "networkServices": 50000,
    "databaseServices": 12000,
    "containerServices": 5000
  },
  "plan": "priority",
  "doaApplicable": true,
  "securitySpend": 274000,
  "advancedSpend": 12000,
  "contractTermYears": 3,
  "paymentTerm": "full_upfront",
  "customerName": "Acme Corp"
}
```

**Request** (AWS / Azure):

```json
{
  "cloudType": "aws",
  "monthlyCloudSpend": 2000000,
  "plan": "prime",
  "doaApplicable": false,
  "contractTermYears": 1,
  "paymentTerm": "annual_advance",
  "cloudCalculatorUrl": "https://calculator.aws/"
}
```

`cloudType`, `plan`, and `paymentTerm` accept human-readable labels (`"Yntraa"`, `"Prime"`, `"Annual Advance"`) — normalized server-side.

**Response:** `Phase1Result` — see `src/types/phase1.ts`.

### `POST /api/calculate` (workbook / future UI)

Full workbook calculator with billing management, NewEdge block, monitoring, and value-added services. See README for payload examples.

## UI customization

| File | Purpose |
|------|---------|
| `public/index.html` | Markup structure |
| `public/css/styles.css` | Yotta theme + Yntraa configurator styles |
| `public/js/constants.js` | Service field order, API base URL |
| `public/js/form.js` | Form state → API payload |
| `public/js/results.js` | API response → DOM |

### Yntraa-specific behaviour

- Category inputs sum to **Monthly Cloud Spend**.
- **Security Services Monthly Spend** auto-syncs from that total (user can override).
- **Container Services** is listed last (after Database Services).

## Development

```bash
npm install
npm test          # engine unit tests
npm run build     # compile TypeScript → dist/
npm run dev       # http://localhost:3001
```

## Deployment checklist

- [ ] Run `npm run build` and deploy `dist/` + `public/`
- [ ] Set `PORT` (or mount via `createApp` in existing process)
- [ ] Configure `window.CALCULATOR_API_BASE` if not served from `/api`
- [ ] Verify `POST /api/phase1/calculate` from the host environment
- [ ] Run `npm test` in CI

## Future workbook UI

The workbook engine (`calculate()` in `src/engine/calculator.ts`) is implemented and tested but not exposed in the current Phase 1 UI. To enable billing / VAS / monitoring sections, wire form fields to `POST /api/calculate` using types in `src/types/index.ts`.
