# Cloud Management Service Calculator

Production-ready calculator for Yotta managed services pricing. Rebuilds the Phase 1 [CloudAssure calculator](https://sskhan-cloud.github.io/CloudAssure/) with a **Yntraa workbook category breakdown**, plus a full workbook calculation engine for future use.

## What's in this repo

| Component | Description |
|-----------|-------------|
| **Phase 1 UI** | `public/` — two-column layout, internal/customer views, print |
| **Phase 1 engine** | `src/engine/phase1.ts` — powers the current UI |
| **Workbook engine** | `src/engine/calculator.ts` — billing, NewEdge, monitoring, VAS |
| **HTTP API** | `src/api/createApp.ts` — mountable Express app |
| **Rate cards** | `src/config/rate-cards.ts` — all slab tables and discounts |

## Quick start

```bash
npm install
npm test
npm run build
npm run dev     # http://localhost:3001
```

Copy `.env.example` to `.env` to override `PORT` (default `3001`).

## Integration

See **[docs/INTEGRATION.md](docs/INTEGRATION.md)** for embedding into an existing website:

- Mount `createApp()` under a sub-path
- Copy static assets and proxy API routes
- Import `calculatePhase1` / `calculate` directly in Node

## API summary

| Endpoint | Used by | Purpose |
|----------|---------|---------|
| `GET /health` | Ops | Liveness check |
| `GET /api/rate-card` | Integrations | Slab tables and rates |
| `POST /api/phase1/calculate` | **Current UI** | Phase 1 managed services pricing |
| `POST /api/calculate` | Future / workbook | Full workbook pricing |

## Phase 1 UI behaviour

- **Yntraa:** per-category spend inputs → monthly total; security auto-fills from total
- **AWS / Azure:** single monthly cloud spend + calculator URL
- Plans: Foundation (0%), Prime, Priority — with optional DOA reduced slabs
- Contract term discounts: 1 yr → 1%, 3 yr → 3%
- Payment term discounts: Annual Advance → 1%, Full Upfront → 3%
- Advanced services (Yntraa): 7% of advanced spend, discounted with MS bundle

## Project layout

```
public/                 # Static UI
src/
  api/                  # Express factory + routes
  config/rate-cards.ts
  engine/               # Calculation modules (pure functions)
  types/                # TypeScript contracts
tests/                  # Vitest
docs/INTEGRATION.md     # Handover guide for senior engineers
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` with declarations |
| `npm start` | Run compiled server (`node dist/api/server.js`) |
| `npm test` | Run all engine tests |

## Workbook engine (not in current UI)

The workbook module supports billing management slabs, NewEdge, monitoring (₹300 × workloads), and value-added services. It is available via `POST /api/calculate` and covered by `tests/calculator.test.ts`. See INTEGRATION.md to wire a future UI.

## Reference files (local only, gitignored)

- `reference-phase1.html` — original Phase 1 UI reference
- `workbook-dump.txt` / `workbook-formulas.txt` — Excel workbook extraction
