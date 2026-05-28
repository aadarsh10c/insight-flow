# InsightFlow — Implementation Design Spec

**Date:** 2026-05-28
**Status:** approved · ready for plan
**Companion docs:**
- `docs/InsightFlow_Whitepaper_v3.md` — product spec (what we're building, for whom)
- `docs/StyleGuide.md` — visual design system (tokens, scales, components)
- `docs/CodeStyleGuide.md` — code conventions (module pattern, FP, types)

This document defines **how** we build InsightFlow. It is the technical contract that complements the product whitepaper. Every section below is locked unless explicitly revised.

---

## 1. Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | React 19 + Vite | Brief mandates React |
| Language | TypeScript `strict: true` | No `any` |
| Routing | **TanStack Router** (file-based) | With `autoCodeSplitting: true` |
| Charts | Plotly.js | Brief mandates Plotly; dynamic-imported |
| File parsing | PapaParse (CSV) + SheetJS (Excel) | Both dynamic-imported per-route |
| State (runtime) | Zustand | 4 split stores |
| State (persistent) | `localStorage` via `lib/storage.ts` adapter | Schema-versioned |
| Component primitives | shadcn/ui (Radix-backed) | Copy-paste registry |
| Icons | Lucide React | One library, `currentColor` only |
| Styling | Tailwind CSS v4 (`@theme inline` directive) | CSS-first config |
| Theme system | CSS custom properties in `:root` / `.dark` | Set pre-mount via inline script |
| Testing | Vitest + RTL + Playwright | Pragmatic coverage, no snapshots |
| Build / deploy | Vite → Vercel | Single-command deploy |

---

## 2. Code organization

```
src/
├── routes/                              # TanStack Router file-based
│   ├── __root.tsx                       # root: branches Home (fullscreen) vs shell+outlet
│   ├── index.tsx                        # /  → -home-page/
│   ├── datasources.tsx                  # /datasources → -data-sources-page/
│   ├── reports/
│   │   ├── index.tsx                    # /reports → -reports-page/
│   │   └── $reportId.tsx                # /reports/:id → -report-detail-page/
│   ├── styleguide.tsx
│   │
│   ├── -home-page/
│   ├── -data-sources-page/
│   │   ├── data-source-table/
│   │   └── upload-data-source-dialog/
│   ├── -reports-page/
│   │   ├── report-table/
│   │   └── add-report-dialog/
│   │       └── column-config-table/
│   ├── -report-detail-page/
│   │   └── chart-builder-dialog/
│   │       ├── chart-preview/
│   │       ├── step-1-chart-type/
│   │       ├── step-2-data/
│   │       ├── step-3-filter/
│   │       └── step-4-style/
│   └── -styleguide-page/
│
├── shell/                               # shared app chrome
│   ├── shell.{tsx,hook.ts,type.ts}
│   └── sidebar/
│       └── sidebar.{tsx,hook.ts,type.ts}
│
├── stores/
│   ├── data-sources.store.ts
│   ├── reports.store.ts
│   ├── theme.store.ts
│   └── toast.store.ts
│
├── lib/                                 # pure logic, no React
│   ├── parsers/
│   │   ├── csv.ts
│   │   ├── xlsx.ts
│   │   └── detect-types.ts
│   ├── plotly-theme.ts
│   ├── storage.ts                       # generic adapter + schema versioning
│   ├── time-buckets.ts                  # line-chart smart filter
│   ├── ids.ts                           # uuid helper
│   ├── sample-data/
│   │   └── seed.ts                      # lazy-loaded sample seed
│   └── utils/
│       └── format.ts
│
├── types/                               # cross-cutting types
│   ├── data-source.type.ts
│   ├── report.type.ts
│   └── chart.type.ts
│
├── components/
│   ├── ui/                              # shadcn primitives — never edited
│   └── shared/
│       └── confirm-dialog/              # generic confirm (delete, clear-all)
│
└── styles/
    └── globals.css                      # @theme tokens, dark-mode rules
```

Every module folder follows `CodeStyleGuide.md` §2 — `index.ts` + `<name>.tsx` + `<name>.hook.ts` + `<name>.type.ts` + optional `.utils.ts`. Children at module root, no `sub-components/`.

Route files contain only the TanStack `createFileRoute(...)` registration + a one-line render of the matching `-page/` module. **Route property handlers are NOT exported** (required for `autoCodeSplitting` to work).

---

## 3. Routing & code-splitting

### File-based routing

```tsx
// routes/datasources.tsx
import { createFileRoute } from '@tanstack/react-router'
import { DataSourcesPage } from './-data-sources-page'

const DataSourcesRouteComponent = () => <DataSourcesPage />   // NOT exported

export const Route = createFileRoute('/datasources')({
  component: DataSourcesRouteComponent,
})
```

### Automatic code splitting

```ts
// vite.config.ts
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true }),
    react(),
  ],
})
```

Static code analysis splits each route's `component`, `errorComponent`, `notFoundComponent` into separate chunks at build time. **No manual `.lazy.tsx` files required.**

### What goes in the initial bundle vs lazy chunks

| Initial bundle | Lazy (per-route) |
|---|---|
| React + ReactDOM | Per-route components (TanStack auto-splits) |
| TanStack Router runtime | PapaParse + SheetJS (in `/datasources` chunk) |
| Zustand + 4 stores | **Plotly.js** (in `/reports/:id` chunk — the big one) |
| Theme inline script | shadcn primitives only as referenced |
| `-home-page/` module | Sample-data seed module (loaded on button click) |
| Shell + Sidebar | |

### Root layout split

```tsx
// routes/__root.tsx
const RootComponent = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return isHome ? <Outlet /> : <Shell><Outlet /></Shell>
}
```

Home renders fullscreen. Every other route renders inside `<Shell>` (sidebar + main outlet).

### Navigation handlers

Always exposed by hooks, never inline in `.tsx`:

```ts
// data-sources-page.hook.ts
const navigate = useNavigate()
const handleCreateReportFromDataSource = useCallback(
  (id: DataSourceId) => navigate({ to: '/reports', search: { dataSourceId: id }}),
  [navigate]
)
```

---

## 4. State management

### Four split Zustand stores

Each store file exports its hook plus selector helpers. Cross-store reads are explicit (composing two stores' hooks in a feature hook is fine; one store calling another is not).

#### `data-sources.store.ts`

```ts
type DataSourcesState = {
  list: DataSource[]
  mostRecentId: DataSourceId | null
}

type DataSourcesActions = {
  add: (input: { name: string; filename: string; type: 'csv' | 'xlsx'; sizeBytes: number; columns: ColumnSchema[]; rows: RowData[] }) => DataSource
}
```

No delete in V1. No rename in V1.

**Selectors:** `useDataSourcesList()` · `useDataSourceById(id)` · `useMostRecentDataSourceId()`

#### `reports.store.ts`

```ts
type ReportsState = {
  list: Report[]
}

type ReportsActions = {
  add: (input: { name: string; description: string; dataSourceId: DataSourceId; columnConfig: ColumnConfigMap }) => Report
  update: (id: ReportId, patch: Partial<Pick<Report, 'name' | 'description' | 'columnConfig'>>) => void
  delete: (id: ReportId) => void
  setChart: (reportId: ReportId, chart: ChartConfig) => void
  clearChart: (reportId: ReportId) => void
}
```

**Selectors:** `useReportsList()` · `useReportById(id)` · `useReportsByDataSourceId(id)`

#### `theme.store.ts`

```ts
type ThemeMode = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

type ThemeState = {
  mode: ThemeMode
  resolved: ResolvedTheme
}

type ThemeActions = {
  setMode: (mode: ThemeMode) => void
  _recomputeFromSystem: () => void   // called by matchMedia listener
}
```

#### `toast.store.ts`

```ts
type Toast = {
  id: string
  variant: 'default' | 'success' | 'destructive'
  title: string
  description?: string
  action?: { label: string; handler: () => void }   // for undo
  expiresAt: number
}

type ToastActions = {
  show: (input: Omit<Toast, 'id' | 'expiresAt'> & { durationMs?: number }) => string
  dismiss: (id: string) => void
}
```

In-memory only; auto-dismiss via internal timer queue, not `useEffect`.

### Chart Builder stepper — `useReducer`, not a store

The stepper state machine lives in `chart-builder-dialog.hook.ts` as a `useReducer`. Action types mirror whitepaper §19 cascade rules:

- `SET_CHART_TYPE` → resets steps 2, 3, 4
- `SET_DATA_FIELD` → resets steps 3, 4
- `SET_FILTER` → no reset
- `SET_STYLE` → no reset
- `RESET_ALL` → resets all + stashes snapshot for undo
- `RESTORE_FROM_SNAPSHOT` → applies the stash (toast undo)
- `LOAD_FROM_CHART_CONFIG` → loads an existing chart for edit

On save, the resulting `ChartConfig` is committed via `reports.store.setChart()`. Stepper state never enters the global store.

---

## 5. Persistence layer

### `lib/storage.ts` — generic adapter

```ts
type StorageAdapter<T> = {
  load: () => T | null
  save: (value: T) => void
  clear: () => void
}

type MigrateFn<TFrom, TTo> = (old: TFrom) => TTo

const createStorage = <T>(
  key: string,
  version: number,
  migrate?: (old: unknown, oldVersion: number) => T | null
): StorageAdapter<T> => { /* ... */ }
```

Handles:
- JSON serialization
- Schema versioning per key
- Quota-exceeded errors → toast + console.error
- Parse failures → clear + log + toast

### Wiring to stores

Each persisted store uses Zustand's `persist` middleware with our adapter as the storage:

```ts
// data-sources.store.ts
const storage = createStorage<DataSourcesState>('insightflow:dataSources', 1)

export const useDataSourcesStore = create<DataSourcesState & DataSourcesActions>()(
  persist(
    (set) => ({ /* ... */ }),
    { name: 'insightflow:dataSources', storage: zustandStorageFromAdapter(storage) }
  )
)
```

### Storage keys

| Key | Version | Owner |
|---|---|---|
| `insightflow:dataSources` | 1 | data-sources.store |
| `insightflow:reports` | 1 | reports.store |
| `insightflow:theme` | 1 | theme.store |

Toast state is not persisted.

### Clear-all-data action

Lives in Settings (or a dedicated affordance). Strong confirm via `ConfirmDialog`, then calls `clear()` on every adapter.

---

## 6. Theme system

### No-flash initial paint

Inline script in `index.html`, runs BEFORE React mounts:

```html
<script>
  (function() {
    try {
      const stored = localStorage.getItem('insightflow:theme')
      const mode = stored ? JSON.parse(stored).state?.mode : 'system'
      const resolved = mode === 'system'
        ? matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        : mode
      document.documentElement.classList.toggle('dark', resolved === 'dark')
    } catch (e) { /* fall through to light */ }
  })()
</script>
```

### Runtime updates — zero `useEffect`

```ts
// theme.store.ts (at module scope, NOT in a component)
useThemeStore.subscribe(
  (state) => state.resolved,
  (resolved) => {
    document.documentElement.classList.toggle('dark', resolved === 'dark')
  }
)

matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  useThemeStore.getState()._recomputeFromSystem()
})
```

The `.dark` class write is the **only** DOM imperative call in the entire codebase. It lives in the store module — never in a component.

### Tailwind v4 wiring

`styles/globals.css`:

```css
@import "tailwindcss";

:root {
  --background: #fdfbf7;
  --foreground: #1c1917;
  /* ... see StyleGuide.md §3 */
}

.dark {
  --background: #1c1917;
  --foreground: #f5f5f4;
  /* ... */
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... */
}
```

---

## 7. Sample-data lazy loading

The "Try with sample data" button on `/` triggers a dynamic import — none of the sample-related code or the CSV ships in the home bundle.

```ts
// home-page.hook.ts
const handleTrySampleData = useCallback(async () => {
  const { seedSampleDataSource } = await import('@/lib/sample-data/seed')
  await seedSampleDataSource()
  navigate({ to: '/datasources' })
}, [navigate])
```

```ts
// lib/sample-data/seed.ts
export const seedSampleDataSource = async () => {
  const [{ parseCSV }, response] = await Promise.all([
    import('@/lib/parsers/csv'),
    fetch('/sample/superstore.csv'),
  ])
  const text = await response.text()
  const parsed = await parseCSV(text)
  useDataSourcesStore.getState().add({
    name: 'Sample — Superstore',
    filename: 'superstore.csv',
    type: 'csv',
    sizeBytes: text.length,
    columns: detectColumnTypes(parsed.data),
    rows: parsed.data,
  })
}
```

CSV lives at `public/sample/superstore.csv` — served as a static file, never bundled.

PapaParse is itself dynamic-imported inside `parsers/csv.ts`, so the regular `/datasources` upload flow and the sample seed share the same chunk (Rollup dedupes).

---

## 8. Chart Builder dialog details

### State machine

Reducer-driven (see §4). Every action emits the new state; the reducer wipes downstream steps per the cascade rules. The hook exposes:

- `currentStep` · `steps` (4 entries with status + value) · `canSave`
- `handleSelectChartType(type)`
- `handleSetDataField(field, value)`
- `handleAddFilter(filter)` · `handleRemoveFilter(id)`
- `handleSetStyle(patch)`
- `handleResetAll()` — also calls `toast.store.show()` with undo action
- `handleUndoReset()`
- `handleSave()` — calls `reports.store.setChart()`
- `handleClose()`

### Live preview

`chart-preview/` is its own module. Its hook subscribes to the stepper reducer state, computes the Plotly `data` + `layout`, and the `.tsx` renders `<Plot />` (dynamic-imported Plotly). On placeholder state (e.g., chart type chosen but data not yet), renders a friendly empty illustration in the canvas area.

### Color picker

12-swatch curated palette per `StyleGuide.md` §12b. Click swatch → updates style state → preview re-renders. No free hex input.

### Time bucket toggle (line charts only)

`step-2-data.hook.ts` calls `lib/time-buckets.ts → getValidBuckets(uniqueDates, range)` to compute the set of valid buckets. The segmented control disables invalid options. Default = whichever bucket yields between 8 and 60 points.

---

## 9. Dialogs & forms

- All dialogs use shadcn `Dialog` (Radix-backed — focus trap, escape, scroll-lock free).
- Each dialog's open state is **local** to the parent page hook (no global dialog store — every dialog has exactly one trigger point).
- The Chart Builder is full-screen via shadcn `Dialog` with `max-w-[90vw] h-[90vh]` or `Sheet` — final choice deferred to implementation.
- **Form validation:** no `react-hook-form` in V1. Our forms are 2-3 fields each — local state in the hook + simple validation (e.g., `nameError = name.trim() === '' ? 'Name is required' : null`).

---

## 10. Error handling — three layers

1. **Boundary:** one React Error Boundary at `__root.tsx` catches uncaught renders. Shows a fallback "Something went wrong. Reload?" screen. Logs to console.
2. **Toast:** recoverable errors via `toast.store.show({ variant: 'destructive' })`. Examples: parse failures, storage quota, file over size cap.
3. **Inline validation:** form fields show inline errors next to the field.

---

## 11. Toast / undo wiring

- `toast.store.ts` keeps a stack with auto-dismiss timers handled internally.
- shadcn `Toast` primitive renders the stack.
- **Action toasts** (e.g., Reset Undo) carry an `action` field with `label` + `handler`. The Reset All flow:
  1. Reducer stashes `previousState` on `RESET_ALL`
  2. Hook calls `toast.store.show({ action: { label: 'Undo', handler: () => dispatch({ type: 'RESTORE_FROM_SNAPSHOT' }) }, durationMs: 5000 })`
  3. After 5s the toast dismisses and the snapshot is dropped

---

## 12. Accessibility

Inherited free from Radix (via shadcn): focus management, ARIA, keyboard nav.

We add:
- Focus rings per `StyleGuide.md` §10 — `focus-visible:` only
- Skip-to-main link in `Shell`
- Lucide icons: `aria-hidden` when decorative, `aria-label` when interactive
- `prefers-reduced-motion` honored via Tailwind utilities

---

## 13. Responsive behavior

Desktop-first (≥ 1024px). Below 1024px: layouts degrade but remain usable. Below 640px: a non-blocking banner appears once per session — *"InsightFlow is designed for larger screens. Best experience on a laptop or desktop."*

Banner dismissable; dismissal stored in `sessionStorage` (not persistent across reloads).

---

## 14. Testing

| Layer | Tool | Coverage | Tests |
|---|---|---|---|
| `lib/` (pure logic) | Vitest | ~80% | Type detection, time buckets, parsers, storage adapter, plotly-theme mapping |
| `stores/` | Vitest | ~70% | Actions transform state correctly; selectors return expected shapes |
| Hooks | Vitest + RTL | Key flows only | Stepper state machine transitions, Add Report column-config |
| Components | RTL | Smoke + critical flows | Dialogs open/close, form validation surfaces, sidebar nav fires |
| E2E | Playwright | 1 happy path | Upload → create report → build chart → save → see it on `/reports/:id` |

No snapshot tests. No visual regression — the `/styleguide` route covers that manually.

---

## 15. Open items (intentionally not pre-decided)

These are left for implementation-time judgment, not design-time decisions:

- Exact prop signatures of internal components
- shadcn theme customization details (radius, ring offset specifics)
- Whether Chart Builder is a `Dialog` or `Sheet` from shadcn (test both quickly during implementation)
- Exact Plotly `layout` defaults beyond what `plotly-theme.ts` returns
- Whether `lib/utils/format.ts` grows large enough to split

---

## 16. What this design deliberately does not address

- Multi-user, real-time, server-side: out of scope (V1 is single-user, browser-only)
- i18n: out of scope V1
- Telemetry / analytics: out of scope V1
- SEO / SSR: out of scope (single-page app, no public-facing content beyond Home)
- Mobile-first responsive design: see §13 — V2

---

## 17. Acceptance criteria for "design done"

- [x] Whitepaper v3 written and approved
- [x] Style Guide written and approved
- [x] Code Style Guide written
- [x] This design spec written and approved
- [ ] User has read the spec and signed off
- [ ] Implementation plan written (next deliverable: `docs/superpowers/plans/2026-05-28-insightflow-plan.md`)
