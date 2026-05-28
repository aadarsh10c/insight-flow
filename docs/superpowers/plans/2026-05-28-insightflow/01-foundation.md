# Phase 01 — Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bootstrap the project with Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + TanStack Router. Implement all pure-logic modules under `lib/`, all Zustand stores, the persistence adapter, and the no-flash theme system. No UI routes yet — but every module is unit-tested.

**Architecture:** Foundation-first build. Pure modules (no React deps) get full TDD. Stores get TDD on actions + selectors. Theme system uses an inline `<script>` in `index.html` + Zustand subscription for runtime updates.

**Tech Stack:** React 19 · TypeScript 5 (strict) · Vite 5 · TanStack Router · Tailwind CSS v4 · shadcn/ui (CLI) · Lucide · Zustand · Vitest · @testing-library/react.

**Reference docs:** `docs/StyleGuide.md` (tokens), `docs/CodeStyleGuide.md` (module pattern), `docs/superpowers/specs/2026-05-28-insightflow-design.md` (sections 1, 2, 4, 5, 6).

---

## Pre-conditions

- Working directory: `D:/insight-flow/`
- Already contains: `docs/` (whitepaper v3, style guide, code style guide, design spec, plans)
- Already contains: `Sample - Superstore.csv` in `docs/` (needs to be copied into `public/sample/`)
- Node.js 20+ installed
- Empty `.git` — initialize a fresh repo as Task 0

---

## Exit criteria (must all pass before Phase 02)

- [ ] `npm run dev` starts a Vite dev server
- [ ] `npm run build` produces a production bundle without errors
- [ ] `npm test` runs all unit tests, all pass
- [ ] `npm run typecheck` passes (`tsc --noEmit`)
- [ ] `npm run lint` passes (ESLint flat config)
- [ ] Theme `.dark` class applied to `<html>` before first paint based on `localStorage` + `prefers-color-scheme`
- [ ] All four stores (`data-sources`, `reports`, `theme`, `toast`) implemented and unit-tested
- [ ] `lib/storage.ts`, `lib/parsers/detect-types.ts`, `lib/time-buckets.ts`, `lib/plotly-theme.ts`, `lib/ids.ts` all implemented and unit-tested
- [ ] Sample CSV exists at `public/sample/superstore.csv`
- [ ] `confirm-dialog/` shared component scaffolded
- [ ] Phase 01 final commit on `main`

---

## File structure created in this phase

```
.gitignore
package.json
tsconfig.json
tsconfig.node.json
vite.config.ts
vitest.config.ts
eslint.config.js
prettier.config.js
playwright.config.ts                      # config only; tests in Phase 07
index.html
postcss.config.js                         # if needed for Tailwind v4
public/
└── sample/
    └── superstore.csv
src/
├── main.tsx
├── styles/
│   └── globals.css
├── types/
│   ├── data-source.type.ts
│   ├── report.type.ts
│   ├── chart.type.ts
│   └── theme.type.ts
├── lib/
│   ├── ids.ts                            # + ids.test.ts
│   ├── storage.ts                        # + storage.test.ts
│   ├── time-buckets.ts                   # + time-buckets.test.ts
│   ├── plotly-theme.ts                   # + plotly-theme.test.ts
│   ├── parsers/
│   │   └── detect-types.ts               # + detect-types.test.ts
│   └── utils/
│       └── format.ts                     # + format.test.ts
├── stores/
│   ├── data-sources.store.ts             # + data-sources.store.test.ts
│   ├── reports.store.ts                  # + reports.store.test.ts
│   ├── theme.store.ts                    # + theme.store.test.ts
│   └── toast.store.ts                    # + toast.store.test.ts
└── components/
    ├── ui/                               # populated by shadcn CLI later
    └── shared/
        └── confirm-dialog/
            ├── index.ts
            ├── confirm-dialog.tsx
            ├── confirm-dialog.hook.ts
            └── confirm-dialog.type.ts
```

---

## Tasks

### Task 0: Initialize git and project structure

**Files:**
- Create: `.gitignore`
- Create: `README.md` (stub)

- [ ] **Step 1: Initialize git**

```bash
cd D:/insight-flow
git init
git branch -m main
```

- [ ] **Step 2: Create `.gitignore`**

```
node_modules/
dist/
.vite/
.vercel/
coverage/
*.local
.DS_Store
.env
.env.*
!.env.example
.superpowers/
```

- [ ] **Step 3: Stub `README.md`**

```markdown
# InsightFlow

A guided BI chart builder for non-technical business users.

See `docs/InsightFlow_Whitepaper_v3.md` for the product spec.
See `docs/superpowers/plans/2026-05-28-insightflow/00-overview.md` for the build plan.
```

- [ ] **Step 4: Initial commit**

```bash
git add .gitignore README.md docs/
git commit -m "chore: initial repo + docs"
```

---

### Task 1: Scaffold Vite + React 19 + TypeScript

**Files:**
- Create: `package.json` · `tsconfig.json` · `tsconfig.node.json` · `vite.config.ts` · `index.html` · `src/main.tsx`

- [ ] **Step 1: Initialize npm**

```bash
npm init -y
```

- [ ] **Step 2: Install React 19 + Vite + TS**

```bash
npm install react@19 react-dom@19
npm install -D @types/react@19 @types/react-dom@19 typescript@~5.6 vite@^5 @vitejs/plugin-react
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "useDefineForClassFields": true,
    "allowImportingTsExtensions": false,
    "verbatimModuleSyntax": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  },
  "include": ["src", "vite.config.ts", "vitest.config.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true
  },
  "include": ["vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 5: Create `vite.config.ts` (TanStack Router added in Task 4)**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 },
})
```

- [ ] **Step 6: Create `index.html`** (theme inline script added in Task 5)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InsightFlow</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 7: Create `src/main.tsx` (router added in Task 4)**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>InsightFlow scaffold</div>
  </StrictMode>
)
```

- [ ] **Step 8: Add `scripts` to `package.json`**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit"
  }
}
```

- [ ] **Step 9: Run dev server, verify "InsightFlow scaffold" renders at http://localhost:5173**

```bash
npm run dev
```

Expected: dev server starts; placeholder text visible in browser.

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "feat(foundation): Vite + React 19 + TS scaffold"
```

---

### Task 2: Install Vitest + RTL + Playwright config

**Files:**
- Create: `vitest.config.ts`
- Create: `src/test/setup.ts`
- Create: `playwright.config.ts` (config only — tests come in Phase 07)
- Modify: `package.json` (add test scripts)

- [ ] **Step 1: Install test deps**

```bash
npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: { reporter: ['text', 'html'], include: ['src/**/*.{ts,tsx}'], exclude: ['src/**/*.type.ts', 'src/**/*.test.ts', 'src/test/**'] },
  },
})
```

- [ ] **Step 3: Create `src/test/setup.ts`**

```ts
import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => cleanup())

// localStorage mock fresh per test
beforeEach(() => {
  localStorage.clear()
})
```

- [ ] **Step 4: Create `playwright.config.ts` (stub for Phase 07)**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  webServer: { command: 'npm run preview', port: 4173, reuseExistingServer: !process.env.CI },
  use: { baseURL: 'http://localhost:4173' },
})
```

- [ ] **Step 5: Add test scripts to `package.json`**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 6: Verify Vitest runs (no tests yet, exit 0)**

```bash
npm test
```

Expected: "No test files found" — exit code 0 OK.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore(foundation): Vitest + RTL + Playwright config"
```

---

### Task 3: Install + configure Tailwind v4 with full token set

**Files:**
- Create: `src/styles/globals.css`
- Modify: `src/main.tsx` (import globals)
- Modify: `package.json` (deps)

- [ ] **Step 1: Install Tailwind v4**

```bash
npm install -D tailwindcss@^4 @tailwindcss/vite
```

- [ ] **Step 2: Add Tailwind Vite plugin to `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 },
})
```

- [ ] **Step 3: Create `src/styles/globals.css` with full token set**

```css
@import "tailwindcss";

:root {
  --background: #fdfbf7;
  --foreground: #1c1917;
  --surface: #ffffff;
  --surface-2: #fafaf9;
  --muted: #f5f5f4;
  --muted-foreground: #78716c;
  --border: #e7e5e4;
  --input: #e7e5e4;
  --ring: rgba(194, 65, 12, 0.5);
  --accent: #c2410c;
  --accent-foreground: #ffffff;
  --success: #15803d;
  --warning: #a16207;
  --destructive: #b91c1c;
}

.dark {
  --background: #1c1917;
  --foreground: #f5f5f4;
  --surface: #292524;
  --surface-2: #363130;
  --muted: #363130;
  --muted-foreground: #a8a29e;
  --border: #44403c;
  --input: #44403c;
  --ring: rgba(251, 146, 60, 0.5);
  --accent: #ea580c;
  --accent-foreground: #ffffff;
  --success: #22c55e;
  --warning: #eab308;
  --destructive: #ef4444;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-destructive: var(--destructive);

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;

  --font-sans: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
  --font-serif: "Iowan Old Style", Georgia, "Times New Roman", serif;
  --font-mono: ui-monospace, "Cascadia Code", "Fira Code", monospace;
}

html, body { background: var(--background); color: var(--foreground); font-family: var(--font-sans); }

@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after { animation: none !important; transition: none !important; }
}
```

- [ ] **Step 4: Import globals in `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="p-4 text-2xl font-serif">InsightFlow scaffold</div>
  </StrictMode>
)
```

- [ ] **Step 5: Run dev server, verify warm cream background + serif heading**

```bash
npm run dev
```

Expected: `#fdfbf7` background, dark text, serif font for the placeholder.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(foundation): Tailwind v4 with full token system"
```

---

### Task 4: Install + configure TanStack Router with autoCodeSplitting

**Files:**
- Create: `src/routes/__root.tsx`
- Create: `src/routes/index.tsx`
- Modify: `vite.config.ts`
- Modify: `src/main.tsx`

- [ ] **Step 1: Install TanStack Router + Vite plugin**

```bash
npm install @tanstack/react-router
npm install -D @tanstack/router-plugin @tanstack/router-devtools
```

- [ ] **Step 2: Update `vite.config.ts`**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [
    tanstackRouter({ autoCodeSplitting: true, target: 'react', routesDirectory: 'src/routes', generatedRouteTree: 'src/routeTree.gen.ts' }),
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: { port: 5173 },
})
```

- [ ] **Step 3: Create `src/routes/__root.tsx`**

```tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'

const RootComponent = () => <Outlet />

export const Route = createRootRoute({ component: RootComponent })
```

- [ ] **Step 4: Create `src/routes/index.tsx`**

```tsx
import { createFileRoute } from '@tanstack/react-router'

const IndexComponent = () => <div className="p-8 text-3xl font-serif">Home placeholder</div>

export const Route = createFileRoute('/')({ component: IndexComponent })
```

- [ ] **Step 5: Update `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import './styles/globals.css'

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
```

- [ ] **Step 6: Run dev server, verify route tree generates + index route renders**

```bash
npm run dev
```

Expected: `src/routeTree.gen.ts` auto-generated; "Home placeholder" renders at `/`.

- [ ] **Step 7: Add `src/routeTree.gen.ts` to `.gitignore` exceptions (commit it — required for builds)**

Leave it tracked. No `.gitignore` change needed.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(foundation): TanStack Router with autoCodeSplitting"
```

---

### Task 5: Theme no-flash inline script in `index.html`

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add the inline script before `</head>`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>InsightFlow</title>
    <script>
      (function () {
        try {
          var stored = localStorage.getItem('insightflow:theme');
          var mode = stored ? (JSON.parse(stored).state || {}).mode : 'system';
          var resolved = mode === 'system'
            ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
            : mode;
          document.documentElement.classList.toggle('dark', resolved === 'dark');
        } catch (e) { /* fall through to light */ }
      })();
    </script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify no FOUC manually**

Open DevTools → Application → Local Storage → set `insightflow:theme` to `{"state":{"mode":"dark"}}` → refresh page.

Expected: page is dark on first paint (no flash from light to dark).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat(foundation): no-flash theme inline script"
```

---

### Task 6: ESLint + Prettier

**Files:**
- Create: `eslint.config.js`
- Create: `prettier.config.js`
- Modify: `package.json`

- [ ] **Step 1: Install lint deps**

```bash
npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals prettier eslint-config-prettier
```

- [ ] **Step 2: Create `eslint.config.js`**

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'
import globals from 'globals'

export default tseslint.config(
  { ignores: ['dist', 'src/routeTree.gen.ts', 'coverage'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettier],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  }
)
```

- [ ] **Step 3: Create `prettier.config.js`**

```js
export default {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5',
  printWidth: 100,
  arrowParens: 'always',
}
```

- [ ] **Step 4: Add scripts to `package.json`**

```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\""
  }
}
```

- [ ] **Step 5: Run lint, fix any errors**

```bash
npm run lint
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "chore(foundation): ESLint + Prettier"
```

---

### Task 7: Cross-cutting types

**Files:**
- Create: `src/types/data-source.type.ts`
- Create: `src/types/report.type.ts`
- Create: `src/types/chart.type.ts`
- Create: `src/types/theme.type.ts`

- [ ] **Step 1: Create `src/types/data-source.type.ts`**

```ts
export type DataSourceId = string & { readonly __brand: 'DataSourceId' }

export type ColumnType = 'number' | 'category' | 'text' | 'date'

export type ColumnSchema = {
  name: string
  inferredType: ColumnType
}

export type RowData = Record<string, unknown>

export type DataSource = {
  id: DataSourceId
  name: string
  filename: string
  type: 'csv' | 'xlsx'
  sizeBytes: number
  uploadedAt: number
  columns: ColumnSchema[]
  rows: RowData[]
}
```

- [ ] **Step 2: Create `src/types/report.type.ts`**

```ts
import type { ColumnType, DataSourceId } from './data-source.type'
import type { ChartConfig } from './chart.type'

export type ReportId = string & { readonly __brand: 'ReportId' }

export type ColumnOverride = {
  label?: string
  type?: ColumnType
  ignored?: boolean
}

export type ColumnConfigMap = Record<string, ColumnOverride>

export type Report = {
  id: ReportId
  name: string
  description: string
  dataSourceId: DataSourceId
  columnConfig: ColumnConfigMap
  chart?: ChartConfig
  createdAt: number
  updatedAt: number
}
```

- [ ] **Step 3: Create `src/types/chart.type.ts`**

```ts
export type ChartType = 'bar' | 'pie' | 'line'

export type TimeBucket = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type FilterClause = {
  id: string
  column: string
  values: unknown[]
}

export type ChartStyle = {
  title?: string
  color?: string
  legend?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}

export type BarConfig = { type: 'bar'; measureColumn: string; groupColumn: string }
export type PieConfig = { type: 'pie'; measureColumn: string; splitColumn: string }
export type LineConfig = { type: 'line'; measureColumn: string; dateColumn: string; bucket: TimeBucket }

export type ChartConfig = {
  config: BarConfig | PieConfig | LineConfig
  filters: FilterClause[]
  style: ChartStyle
}
```

- [ ] **Step 4: Create `src/types/theme.type.ts`**

```ts
export type ThemeMode = 'system' | 'light' | 'dark'
export type ResolvedTheme = 'light' | 'dark'
```

- [ ] **Step 5: Verify typecheck passes**

```bash
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 6: Commit**

```bash
git add src/types
git commit -m "feat(foundation): cross-cutting types"
```

---

### Task 8: `lib/ids.ts` — uuid helper

**Files:**
- Create: `src/lib/ids.ts`
- Create: `src/lib/ids.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/lib/ids.test.ts
import { describe, it, expect } from 'vitest'
import { newId, asDataSourceId, asReportId } from './ids'

describe('lib/ids', () => {
  it('newId returns a unique string each call', () => {
    const a = newId()
    const b = newId()
    expect(typeof a).toBe('string')
    expect(a).not.toBe(b)
    expect(a.length).toBeGreaterThan(8)
  })

  it('brand helpers narrow the type at compile time', () => {
    const ds = asDataSourceId(newId())
    const rp = asReportId(newId())
    expect(typeof ds).toBe('string')
    expect(typeof rp).toBe('string')
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/lib/ids.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/ids.ts
import type { DataSourceId } from '@/types/data-source.type'
import type { ReportId } from '@/types/report.type'

export const newId = (): string => crypto.randomUUID()

export const asDataSourceId = (id: string): DataSourceId => id as DataSourceId
export const asReportId = (id: string): ReportId => id as ReportId
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/lib/ids.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ids.ts src/lib/ids.test.ts
git commit -m "feat(lib): ids helper"
```

---

### Task 9: `lib/storage.ts` — generic localStorage adapter

**Files:**
- Create: `src/lib/storage.ts`
- Create: `src/lib/storage.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/storage.test.ts
import { describe, it, expect, vi } from 'vitest'
import { createStorage } from './storage'

type V1 = { count: number }
type V2 = { count: number; label: string }

describe('lib/storage', () => {
  it('load returns null when key is missing', () => {
    const s = createStorage<V1>('test-empty', 1)
    expect(s.load()).toBeNull()
  })

  it('save and load roundtrip', () => {
    const s = createStorage<V1>('test-rt', 1)
    s.save({ count: 5 })
    expect(s.load()).toEqual({ count: 5 })
  })

  it('clear removes the key', () => {
    const s = createStorage<V1>('test-clear', 1)
    s.save({ count: 5 })
    s.clear()
    expect(s.load()).toBeNull()
  })

  it('wipes data when version differs and no migrate provided', () => {
    localStorage.setItem('test-bump', JSON.stringify({ version: 1, data: { count: 5 } }))
    const s = createStorage<V1>('test-bump', 2)
    expect(s.load()).toBeNull()
  })

  it('runs migrate when version differs', () => {
    localStorage.setItem('test-mig', JSON.stringify({ version: 1, data: { count: 5 } }))
    const s = createStorage<V2>('test-mig', 2, (old, oldVersion) => {
      if (oldVersion === 1) return { ...(old as V1), label: 'legacy' }
      return null
    })
    expect(s.load()).toEqual({ count: 5, label: 'legacy' })
  })

  it('returns null and logs when stored JSON is malformed', () => {
    localStorage.setItem('test-bad', 'not json')
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const s = createStorage<V1>('test-bad', 1)
    expect(s.load()).toBeNull()
    spy.mockRestore()
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/lib/storage.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/storage.ts
type Envelope<T> = { version: number; data: T }

export type StorageAdapter<T> = {
  load: () => T | null
  save: (value: T) => void
  clear: () => void
}

export type MigrateFn<T> = (old: unknown, oldVersion: number) => T | null

export const createStorage = <T>(
  key: string,
  version: number,
  migrate?: MigrateFn<T>
): StorageAdapter<T> => {
  const load = (): T | null => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return null
      const parsed = JSON.parse(raw) as Envelope<T>
      if (parsed.version === version) return parsed.data
      if (migrate) {
        const migrated = migrate(parsed.data, parsed.version)
        if (migrated !== null) {
          save(migrated)
          return migrated
        }
      }
      // version mismatch and no migration -> clear
      localStorage.removeItem(key)
      return null
    } catch (err) {
      console.error(`[storage] failed to load ${key}:`, err)
      try { localStorage.removeItem(key) } catch { /* ignore */ }
      return null
    }
  }

  const save = (value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify({ version, data: value } satisfies Envelope<T>))
    } catch (err) {
      console.error(`[storage] failed to save ${key}:`, err)
    }
  }

  const clear = (): void => {
    try { localStorage.removeItem(key) } catch (err) { console.error(`[storage] failed to clear ${key}:`, err) }
  }

  return { load, save, clear }
}
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/lib/storage.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat(lib): storage adapter with schema versioning"
```

---

### Task 10: `lib/parsers/detect-types.ts` — type detection (4 types)

**Four types in this codebase:** `number` (NUMERIC) · `category` (CATEGORICAL, low cardinality) · `text` (TEXTUAL, high cardinality) · `date` (TEMPORAL).

**Files:**
- Create: `src/lib/parsers/detect-types.ts`
- Create: `src/lib/parsers/detect-types.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/parsers/detect-types.test.ts
import { describe, it, expect } from 'vitest'
import { detectColumnTypes, inferColumnType, CATEGORY_MAX_UNIQUE, CATEGORY_MAX_RATIO } from './detect-types'

describe('inferColumnType', () => {
  it('returns "date" for ISO date strings (80%+ match)', () => {
    expect(inferColumnType(['2024-01-01', '2024-02-15', '2024-03-30', 'invalid', '2024-04-10'])).toBe('date')
  })

  it('returns "date" for year-only values', () => {
    expect(inferColumnType(['2020', '2021', '2022', '2023', '2024'])).toBe('date')
  })

  it('returns "date" for quarter format', () => {
    expect(inferColumnType(['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'])).toBe('date')
  })

  it('returns "number" when 90%+ parse as numbers after stripping $/,/%', () => {
    expect(inferColumnType(['$1,234', '$5,678', '$9,012', '$3,456', 'N/A'])).toBe('number')
  })

  it('returns "category" for low-cardinality strings (small + ratio < 0.5)', () => {
    // 4 unique values across 12 rows: ratio = 0.33, count = 4 → category
    expect(inferColumnType(['West', 'East', 'South', 'North', 'West', 'East', 'South', 'North', 'West', 'East', 'South', 'North'])).toBe('category')
  })

  it('returns "text" for high-cardinality strings (every value unique)', () => {
    expect(inferColumnType(['Alice Smith', 'Bob Jones', 'Carol Liu', 'Dan Park', 'Eve Cohen'])).toBe('text')
  })

  it('returns "category" when unique count is at threshold', () => {
    const values = Array.from({ length: 200 }, (_, i) => `cat-${i % CATEGORY_MAX_UNIQUE}`)
    expect(inferColumnType(values)).toBe('category')
  })

  it('returns "text" when unique count exceeds threshold even at low ratio', () => {
    const values = Array.from({ length: 200 }, (_, i) => `id-${i}`)
    // 200 unique / 200 total = ratio 1.0 → text (also count exceeds threshold)
    expect(inferColumnType(values)).toBe('text')
  })

  it('ignores empty strings when computing percentages', () => {
    expect(inferColumnType(['1', '2', '3', '', ''])).toBe('number')
  })
})

describe('detectColumnTypes', () => {
  it('returns ColumnSchema[] one per column with the 4-type system', () => {
    const rows = [
      { date: '2024-01-01', sales: '$100', region: 'West', customer: 'Alice Smith' },
      { date: '2024-02-01', sales: '$200', region: 'East', customer: 'Bob Jones' },
      { date: '2024-03-01', sales: '$300', region: 'West', customer: 'Carol Liu' },
    ]
    expect(detectColumnTypes(rows)).toEqual([
      { name: 'date', inferredType: 'date' },
      { name: 'sales', inferredType: 'number' },
      { name: 'region', inferredType: 'category' },
      { name: 'customer', inferredType: 'text' },
    ])
  })

  it('returns empty array for empty rows', () => {
    expect(detectColumnTypes([])).toEqual([])
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/lib/parsers/detect-types.test.ts
```

Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

```ts
// src/lib/parsers/detect-types.ts
import type { ColumnSchema, ColumnType, RowData } from '@/types/data-source.type'

const DATE_PATTERNS: RegExp[] = [
  /^\d{4}-\d{2}-\d{2}/,                       // YYYY-MM-DD
  /^\d{2}\/\d{2}\/\d{4}/,                     // DD/MM/YYYY or MM/DD/YYYY
  /^\d{2}-\d{2}-\d{4}/,                       // MM-DD-YYYY
  /^\d{4}$/,                                  // Year only
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i, // Month-Year
  /^Q[1-4]\s+\d{4}$/i,                        // Quarter
]

const isDateLike = (value: string): boolean => DATE_PATTERNS.some((re) => re.test(value.trim()))

const isNumberLike = (value: string): boolean => {
  const stripped = value.replace(/[$,%\s]/g, '')
  if (stripped === '') return false
  return !Number.isNaN(Number(stripped))
}

// Category vs Text thresholds — exported so tests + implementation share them
export const CATEGORY_MAX_UNIQUE = 50
export const CATEGORY_MAX_RATIO = 0.5

export const inferColumnType = (values: ReadonlyArray<unknown>): ColumnType => {
  const nonEmpty = values
    .map((v) => (v == null ? '' : String(v)))
    .filter((s) => s.trim() !== '')

  if (nonEmpty.length === 0) return 'text'

  const dateMatches = nonEmpty.filter(isDateLike).length
  if (dateMatches / nonEmpty.length >= 0.8) return 'date'

  const numberMatches = nonEmpty.filter(isNumberLike).length
  if (numberMatches / nonEmpty.length >= 0.9) return 'number'

  // Category vs Text: low-cardinality string columns are Category
  const uniqueCount = new Set(nonEmpty).size
  const uniqueRatio = uniqueCount / nonEmpty.length
  if (uniqueCount <= CATEGORY_MAX_UNIQUE && uniqueRatio < CATEGORY_MAX_RATIO) return 'category'

  return 'text'
}

export const detectColumnTypes = (rows: ReadonlyArray<RowData>): ColumnSchema[] => {
  if (rows.length === 0) return []
  const columnNames = Object.keys(rows[0])
  return columnNames.map((name) => ({
    name,
    inferredType: inferColumnType(rows.map((r) => r[name])),
  }))
}
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/lib/parsers/detect-types.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/parsers
git commit -m "feat(lib): column type detection"
```

---

### Task 11: `lib/time-buckets.ts` — smart bucket filter

**Files:**
- Create: `src/lib/time-buckets.ts`
- Create: `src/lib/time-buckets.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/time-buckets.test.ts
import { describe, it, expect } from 'vitest'
import { getValidBuckets, pickDefaultBucket } from './time-buckets'

describe('getValidBuckets', () => {
  it('30 unique dates -> daily, weekly only', () => {
    const dates = Array.from({ length: 30 }, (_, i) => new Date(2024, 0, i + 1).toISOString())
    expect(getValidBuckets(dates)).toEqual(['daily', 'weekly'])
  })

  it('1.5 years of daily data -> weekly, monthly, quarterly', () => {
    const dates = Array.from({ length: 500 }, (_, i) => new Date(2024, 0, i + 1).toISOString())
    const buckets = getValidBuckets(dates)
    expect(buckets).toContain('monthly')
    expect(buckets).not.toContain('daily') // 500 points too many
  })

  it('10 years of daily data -> monthly, quarterly, yearly', () => {
    const dates = Array.from({ length: 3650 }, (_, i) => new Date(2014, 0, i + 1).toISOString())
    expect(getValidBuckets(dates)).toEqual(['monthly', 'quarterly', 'yearly'])
  })

  it('hides buckets producing < 2 points', () => {
    const dates = ['2024-01-01', '2024-01-02']
    expect(getValidBuckets(dates)).not.toContain('yearly')
  })

  it('returns empty array for empty input', () => {
    expect(getValidBuckets([])).toEqual([])
  })
})

describe('pickDefaultBucket', () => {
  it('picks the bucket yielding closest to 30 points', () => {
    const dates = Array.from({ length: 500 }, (_, i) => new Date(2024, 0, i + 1).toISOString())
    expect(pickDefaultBucket(dates)).toBe('monthly')
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/lib/time-buckets.test.ts
```

Expected: FAIL.

- [ ] **Step 3: Implement**

```ts
// src/lib/time-buckets.ts
import type { TimeBucket } from '@/types/chart.type'

const ALL_BUCKETS: TimeBucket[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']

const MIN_POINTS = 2
const MAX_POINTS = 500
const IDEAL_POINTS = 30

const countBuckets = (dates: ReadonlyArray<string>, bucket: TimeBucket): number => {
  const keys = new Set<string>()
  for (const iso of dates) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) continue
    switch (bucket) {
      case 'daily':
        keys.add(d.toISOString().slice(0, 10))
        break
      case 'weekly': {
        const onejan = new Date(d.getFullYear(), 0, 1)
        const week = Math.ceil(((d.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7)
        keys.add(`${d.getFullYear()}-W${week}`)
        break
      }
      case 'monthly':
        keys.add(`${d.getFullYear()}-${d.getMonth()}`)
        break
      case 'quarterly':
        keys.add(`${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3)}`)
        break
      case 'yearly':
        keys.add(String(d.getFullYear()))
        break
    }
  }
  return keys.size
}

export const getValidBuckets = (dates: ReadonlyArray<string>): TimeBucket[] => {
  if (dates.length === 0) return []
  return ALL_BUCKETS.filter((b) => {
    const n = countBuckets(dates, b)
    return n >= MIN_POINTS && n <= MAX_POINTS
  })
}

export const pickDefaultBucket = (dates: ReadonlyArray<string>): TimeBucket | null => {
  const valid = getValidBuckets(dates)
  if (valid.length === 0) return null
  return valid.reduce<{ bucket: TimeBucket; distance: number } | null>((best, b) => {
    const distance = Math.abs(countBuckets(dates, b) - IDEAL_POINTS)
    if (best === null || distance < best.distance) return { bucket: b, distance }
    return best
  }, null)!.bucket
}
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/lib/time-buckets.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/time-buckets.ts src/lib/time-buckets.test.ts
git commit -m "feat(lib): time bucket smart filter"
```

---

### Task 12: `lib/plotly-theme.ts` — token → Plotly layout mapper

**Files:**
- Create: `src/lib/plotly-theme.ts`
- Create: `src/lib/plotly-theme.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/plotly-theme.test.ts
import { describe, it, expect } from 'vitest'
import { getPlotlyLayout, getCategoricalPalette } from './plotly-theme'

describe('getPlotlyLayout', () => {
  it('returns light-mode colors when mode is light', () => {
    const layout = getPlotlyLayout('light')
    expect(layout.paper_bgcolor).toBe('#fdfbf7')
    expect(layout.plot_bgcolor).toBe('#ffffff')
    expect(layout.font?.color).toBe('#1c1917')
  })

  it('returns dark-mode colors when mode is dark', () => {
    const layout = getPlotlyLayout('dark')
    expect(layout.paper_bgcolor).toBe('#1c1917')
    expect(layout.plot_bgcolor).toBe('#292524')
    expect(layout.font?.color).toBe('#f5f5f4')
  })
})

describe('getCategoricalPalette', () => {
  it('returns 6 distinct hex colors', () => {
    const p = getCategoricalPalette()
    expect(p).toHaveLength(6)
    expect(new Set(p).size).toBe(6)
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/lib/plotly-theme.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/lib/plotly-theme.ts
import type { ResolvedTheme } from '@/types/theme.type'

const TOKENS = {
  light: {
    background: '#fdfbf7',
    surface: '#ffffff',
    foreground: '#1c1917',
    muted: '#78716c',
    border: '#e7e5e4',
  },
  dark: {
    background: '#1c1917',
    surface: '#292524',
    foreground: '#f5f5f4',
    muted: '#a8a29e',
    border: '#44403c',
  },
} as const

const CATEGORICAL: ReadonlyArray<string> = ['#c2410c', '#0e7490', '#15803d', '#6d28d9', '#a16207', '#be185d']

export type PlotlyLayout = {
  paper_bgcolor: string
  plot_bgcolor: string
  font?: { family?: string; color?: string }
  xaxis?: { gridcolor?: string; linecolor?: string }
  yaxis?: { gridcolor?: string; linecolor?: string }
  margin?: { l: number; r: number; t: number; b: number }
  colorway?: ReadonlyArray<string>
}

export const getPlotlyLayout = (mode: ResolvedTheme): PlotlyLayout => {
  const t = TOKENS[mode]
  return {
    paper_bgcolor: t.background,
    plot_bgcolor: t.surface,
    font: { family: 'Inter, ui-sans-serif, system-ui, sans-serif', color: t.foreground },
    xaxis: { gridcolor: t.border, linecolor: t.border },
    yaxis: { gridcolor: t.border, linecolor: t.border },
    margin: { l: 56, r: 24, t: 24, b: 48 },
    colorway: CATEGORICAL,
  }
}

export const getCategoricalPalette = (): ReadonlyArray<string> => CATEGORICAL
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/lib/plotly-theme.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/plotly-theme.ts src/lib/plotly-theme.test.ts
git commit -m "feat(lib): Plotly theme mapper"
```

---

### Task 13: `lib/utils/format.ts` — small formatters

**Files:**
- Create: `src/lib/utils/format.ts`
- Create: `src/lib/utils/format.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatBytes, formatRelativeTime } from './format'

describe('formatBytes', () => {
  it('returns "1 KB" for 1024', () => { expect(formatBytes(1024)).toBe('1 KB') })
  it('returns "1.5 MB" for 1.5 * 1024 * 1024', () => { expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB') })
  it('returns "847 B" for 847', () => { expect(formatBytes(847)).toBe('847 B') })
})

describe('formatRelativeTime', () => {
  it('returns "Just now" for under 60s', () => {
    expect(formatRelativeTime(Date.now() - 5_000)).toBe('Just now')
  })
  it('returns "2 days ago" for ~48h ago', () => {
    expect(formatRelativeTime(Date.now() - 48 * 60 * 60 * 1000)).toBe('2 days ago')
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/lib/utils/format.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/lib/utils/format.ts
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export const formatRelativeTime = (epoch: number): string => {
  const diff = Date.now() - epoch
  const min = 60_000
  const hr = 60 * min
  const day = 24 * hr
  if (diff < min) return 'Just now'
  if (diff < hr) return `${Math.floor(diff / min)} minutes ago`
  if (diff < day) return `${Math.floor(diff / hr)} hours ago`
  if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`
  if (diff < 30 * day) return 'Last week'
  return new Date(epoch).toLocaleDateString()
}
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/lib/utils/format.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/utils
git commit -m "feat(lib): format helpers"
```

---

### Task 14: Install Zustand + create `theme.store.ts`

**Files:**
- Modify: `package.json` (add zustand)
- Create: `src/stores/theme.store.ts`
- Create: `src/stores/theme.store.test.ts`

- [ ] **Step 1: Install Zustand**

```bash
npm install zustand
```

- [ ] **Step 2: Write failing tests**

```ts
// src/stores/theme.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useThemeStore } from './theme.store'

describe('theme.store', () => {
  beforeEach(() => {
    useThemeStore.setState({ mode: 'system', resolved: 'light' })
  })

  it('setMode("dark") updates mode and resolved', () => {
    useThemeStore.getState().setMode('dark')
    const s = useThemeStore.getState()
    expect(s.mode).toBe('dark')
    expect(s.resolved).toBe('dark')
  })

  it('setMode("light") updates both to light', () => {
    useThemeStore.getState().setMode('light')
    expect(useThemeStore.getState().resolved).toBe('light')
  })

  it('setMode("system") resolves based on prefers-color-scheme', () => {
    useThemeStore.getState().setMode('system')
    const expected = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    expect(useThemeStore.getState().resolved).toBe(expected)
  })
})
```

- [ ] **Step 3: Run, verify FAIL**

```bash
npm test src/stores/theme.store.test.ts
```

- [ ] **Step 4: Implement**

```ts
// src/stores/theme.store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ThemeMode, ResolvedTheme } from '@/types/theme.type'

type ThemeState = {
  mode: ThemeMode
  resolved: ResolvedTheme
}

type ThemeActions = {
  setMode: (mode: ThemeMode) => void
  _recomputeFromSystem: () => void
}

const resolveMode = (mode: ThemeMode): ResolvedTheme => {
  if (mode === 'system') {
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolved: typeof matchMedia !== 'undefined' ? resolveMode('system') : 'light',
      setMode: (mode) => set({ mode, resolved: resolveMode(mode) }),
      _recomputeFromSystem: () => {
        if (get().mode === 'system') set({ resolved: resolveMode('system') })
      },
    }),
    {
      name: 'insightflow:theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ mode: s.mode }),
      onRehydrateStorage: () => (state) => {
        if (state) state.resolved = resolveMode(state.mode)
      },
    }
  )
)

// DOM sync — fires on every change to `resolved`. NOT a useEffect.
useThemeStore.subscribe((state, prev) => {
  if (state.resolved !== prev.resolved) {
    document.documentElement.classList.toggle('dark', state.resolved === 'dark')
  }
})

// System preference listener — fires when OS theme changes
if (typeof matchMedia !== 'undefined') {
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    useThemeStore.getState()._recomputeFromSystem()
  })
}
```

- [ ] **Step 5: Run, verify PASS**

```bash
npm test src/stores/theme.store.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/stores/theme.store.ts src/stores/theme.store.test.ts package.json package-lock.json
git commit -m "feat(stores): theme store with no-flash subscription"
```

---

### Task 15: `data-sources.store.ts`

**Files:**
- Create: `src/stores/data-sources.store.ts`
- Create: `src/stores/data-sources.store.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/stores/data-sources.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useDataSourcesStore } from './data-sources.store'

describe('data-sources.store', () => {
  beforeEach(() => {
    useDataSourcesStore.setState({ list: [], mostRecentId: null })
  })

  it('add() appends a new data source and sets mostRecentId', () => {
    const created = useDataSourcesStore.getState().add({
      name: 'Test',
      filename: 'test.csv',
      type: 'csv',
      sizeBytes: 100,
      columns: [],
      rows: [],
    })
    const s = useDataSourcesStore.getState()
    expect(s.list).toHaveLength(1)
    expect(s.mostRecentId).toBe(created.id)
    expect(created.uploadedAt).toBeGreaterThan(0)
  })

  it('add() called twice updates mostRecentId to the newest', () => {
    const a = useDataSourcesStore.getState().add({ name: 'A', filename: 'a.csv', type: 'csv', sizeBytes: 1, columns: [], rows: [] })
    const b = useDataSourcesStore.getState().add({ name: 'B', filename: 'b.csv', type: 'csv', sizeBytes: 1, columns: [], rows: [] })
    expect(useDataSourcesStore.getState().mostRecentId).toBe(b.id)
    expect(useDataSourcesStore.getState().mostRecentId).not.toBe(a.id)
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/stores/data-sources.store.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/stores/data-sources.store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DataSource, DataSourceId, ColumnSchema, RowData } from '@/types/data-source.type'
import { asDataSourceId, newId } from '@/lib/ids'

type AddInput = {
  name: string
  filename: string
  type: 'csv' | 'xlsx'
  sizeBytes: number
  columns: ColumnSchema[]
  rows: RowData[]
}

type DataSourcesState = {
  list: DataSource[]
  mostRecentId: DataSourceId | null
}

type DataSourcesActions = {
  add: (input: AddInput) => DataSource
}

export const useDataSourcesStore = create<DataSourcesState & DataSourcesActions>()(
  persist(
    (set, get) => ({
      list: [],
      mostRecentId: null,
      add: (input) => {
        const ds: DataSource = {
          id: asDataSourceId(newId()),
          ...input,
          uploadedAt: Date.now(),
        }
        set({ list: [...get().list, ds], mostRecentId: ds.id })
        return ds
      },
    }),
    {
      name: 'insightflow:dataSources',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export const useDataSourcesList = () => useDataSourcesStore((s) => s.list)
export const useDataSourceById = (id: DataSourceId | undefined) =>
  useDataSourcesStore((s) => (id ? s.list.find((d) => d.id === id) ?? null : null))
export const useMostRecentDataSourceId = () => useDataSourcesStore((s) => s.mostRecentId)
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/stores/data-sources.store.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/stores/data-sources.store.ts src/stores/data-sources.store.test.ts
git commit -m "feat(stores): data-sources store"
```

---

### Task 16: `reports.store.ts`

**Files:**
- Create: `src/stores/reports.store.ts`
- Create: `src/stores/reports.store.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/stores/reports.store.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useReportsStore } from './reports.store'
import { asDataSourceId } from '@/lib/ids'

describe('reports.store', () => {
  beforeEach(() => useReportsStore.setState({ list: [] }))

  it('add() appends a new report', () => {
    const r = useReportsStore.getState().add({
      name: 'R1', description: 'desc', dataSourceId: asDataSourceId('ds-1'), columnConfig: {},
    })
    const s = useReportsStore.getState()
    expect(s.list).toHaveLength(1)
    expect(r.createdAt).toBeGreaterThan(0)
    expect(r.updatedAt).toBe(r.createdAt)
  })

  it('update() patches name and bumps updatedAt', async () => {
    const r = useReportsStore.getState().add({ name: 'R1', description: '', dataSourceId: asDataSourceId('ds-1'), columnConfig: {} })
    await new Promise((res) => setTimeout(res, 5))
    useReportsStore.getState().update(r.id, { name: 'R1 renamed' })
    const updated = useReportsStore.getState().list[0]
    expect(updated.name).toBe('R1 renamed')
    expect(updated.updatedAt).toBeGreaterThan(r.updatedAt)
  })

  it('delete() removes a report by id', () => {
    const r = useReportsStore.getState().add({ name: 'R1', description: '', dataSourceId: asDataSourceId('ds-1'), columnConfig: {} })
    useReportsStore.getState().delete(r.id)
    expect(useReportsStore.getState().list).toHaveLength(0)
  })

  it('setChart() attaches a chart config', () => {
    const r = useReportsStore.getState().add({ name: 'R1', description: '', dataSourceId: asDataSourceId('ds-1'), columnConfig: {} })
    useReportsStore.getState().setChart(r.id, {
      config: { type: 'bar', measureColumn: 'sales', groupColumn: 'region' },
      filters: [],
      style: {},
    })
    expect(useReportsStore.getState().list[0].chart?.config.type).toBe('bar')
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/stores/reports.store.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/stores/reports.store.ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Report, ReportId, ColumnConfigMap } from '@/types/report.type'
import type { DataSourceId } from '@/types/data-source.type'
import type { ChartConfig } from '@/types/chart.type'
import { asReportId, newId } from '@/lib/ids'

type AddInput = {
  name: string
  description: string
  dataSourceId: DataSourceId
  columnConfig: ColumnConfigMap
}

type ReportsState = { list: Report[] }

type ReportsActions = {
  add: (input: AddInput) => Report
  update: (id: ReportId, patch: Partial<Pick<Report, 'name' | 'description' | 'columnConfig'>>) => void
  delete: (id: ReportId) => void
  setChart: (id: ReportId, chart: ChartConfig) => void
  clearChart: (id: ReportId) => void
}

const touch = (r: Report): Report => ({ ...r, updatedAt: Date.now() })

export const useReportsStore = create<ReportsState & ReportsActions>()(
  persist(
    (set, get) => ({
      list: [],
      add: (input) => {
        const now = Date.now()
        const r: Report = {
          id: asReportId(newId()),
          name: input.name,
          description: input.description,
          dataSourceId: input.dataSourceId,
          columnConfig: input.columnConfig,
          createdAt: now,
          updatedAt: now,
        }
        set({ list: [...get().list, r] })
        return r
      },
      update: (id, patch) =>
        set({
          list: get().list.map((r) => (r.id === id ? touch({ ...r, ...patch }) : r)),
        }),
      delete: (id) => set({ list: get().list.filter((r) => r.id !== id) }),
      setChart: (id, chart) =>
        set({ list: get().list.map((r) => (r.id === id ? touch({ ...r, chart }) : r)) }),
      clearChart: (id) =>
        set({ list: get().list.map((r) => (r.id === id ? touch({ ...r, chart: undefined }) : r)) }),
    }),
    { name: 'insightflow:reports', storage: createJSONStorage(() => localStorage) }
  )
)

export const useReportsList = () => useReportsStore((s) => s.list)
export const useReportById = (id: ReportId | undefined) =>
  useReportsStore((s) => (id ? s.list.find((r) => r.id === id) ?? null : null))
export const useReportsByDataSourceId = (dsId: DataSourceId | undefined) =>
  useReportsStore((s) => (dsId ? s.list.filter((r) => r.dataSourceId === dsId) : []))
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/stores/reports.store.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/stores/reports.store.ts src/stores/reports.store.test.ts
git commit -m "feat(stores): reports store"
```

---

### Task 17: `toast.store.ts`

**Files:**
- Create: `src/stores/toast.store.ts`
- Create: `src/stores/toast.store.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/stores/toast.store.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToastStore } from './toast.store'

describe('toast.store', () => {
  beforeEach(() => useToastStore.setState({ toasts: [] }))

  it('show() adds a toast and returns its id', () => {
    const id = useToastStore.getState().show({ variant: 'default', title: 'Hello' })
    expect(useToastStore.getState().toasts).toHaveLength(1)
    expect(useToastStore.getState().toasts[0].id).toBe(id)
  })

  it('dismiss() removes a toast by id', () => {
    const id = useToastStore.getState().show({ variant: 'default', title: 'X' })
    useToastStore.getState().dismiss(id)
    expect(useToastStore.getState().toasts).toHaveLength(0)
  })

  it('auto-dismisses after durationMs', async () => {
    vi.useFakeTimers()
    useToastStore.getState().show({ variant: 'default', title: 'Y', durationMs: 1000 })
    vi.advanceTimersByTime(1100)
    expect(useToastStore.getState().toasts).toHaveLength(0)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/stores/toast.store.test.ts
```

- [ ] **Step 3: Implement**

```ts
// src/stores/toast.store.ts
import { create } from 'zustand'
import { newId } from '@/lib/ids'

export type ToastVariant = 'default' | 'success' | 'destructive'

export type ToastAction = { label: string; handler: () => void }

export type Toast = {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  action?: ToastAction
}

type ShowInput = Omit<Toast, 'id'> & { durationMs?: number }

type ToastState = { toasts: Toast[] }

type ToastActions = {
  show: (input: ShowInput) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION = 4000

export const useToastStore = create<ToastState & ToastActions>((set, get) => ({
  toasts: [],
  show: ({ durationMs = DEFAULT_DURATION, ...rest }) => {
    const id = newId()
    const toast: Toast = { id, ...rest }
    set({ toasts: [...get().toasts, toast] })
    if (durationMs > 0) {
      setTimeout(() => get().dismiss(id), durationMs)
    }
    return id
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/stores/toast.store.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add src/stores/toast.store.ts src/stores/toast.store.test.ts
git commit -m "feat(stores): toast store with auto-dismiss"
```

---

### Task 18: Install shadcn/ui + add base components

**Files:**
- Modify: `package.json`
- Create: `components.json`
- Create: `src/components/ui/*` via shadcn CLI

- [ ] **Step 1: Install shadcn dependencies for v4**

```bash
npm install class-variance-authority clsx tailwind-merge lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tooltip @radix-ui/react-toast
```

- [ ] **Step 2: Add `cn` helper at `src/lib/utils/cn.ts`**

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))
```

- [ ] **Step 3: Create `components.json` for shadcn CLI**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "stone",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils/cn",
    "ui": "@/components/ui"
  }
}
```

- [ ] **Step 4: Add the components we'll need (use shadcn CLI)**

```bash
npx shadcn@latest add button input textarea label dialog dropdown-menu select table toast tooltip badge
```

- [ ] **Step 5: Verify imports build cleanly**

```bash
npm run typecheck && npm run build
```

Expected: both exit 0.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(foundation): shadcn/ui + base components"
```

---

### Task 19: `confirm-dialog/` shared module

**Files:**
- Create: `src/components/shared/confirm-dialog/index.ts`
- Create: `src/components/shared/confirm-dialog/confirm-dialog.tsx`
- Create: `src/components/shared/confirm-dialog/confirm-dialog.hook.ts`
- Create: `src/components/shared/confirm-dialog/confirm-dialog.type.ts`
- Create: `src/components/shared/confirm-dialog/confirm-dialog.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/components/shared/confirm-dialog/confirm-dialog.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './confirm-dialog'

describe('ConfirmDialog', () => {
  it('calls onConfirm when the confirm button is clicked', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Delete?"
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
    )
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('calls onCancel when cancel is clicked', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog open title="X" description="Y" confirmLabel="OK" cancelLabel="No" onConfirm={onConfirm} onCancel={onCancel} />
    )
    await userEvent.click(screen.getByRole('button', { name: 'No' }))
    expect(onCancel).toHaveBeenCalledTimes(1)
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

```bash
npm test src/components/shared/confirm-dialog
```

- [ ] **Step 3: Create the 4 module files**

```ts
// src/components/shared/confirm-dialog/confirm-dialog.type.ts
export type ConfirmDialogVariant = 'default' | 'destructive'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  variant?: ConfirmDialogVariant
  onConfirm: () => void
  onCancel: () => void
}

export type UseConfirmDialogParams = ConfirmDialogProps

export type ConfirmDialogView = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  isDestructive: boolean
  handleConfirm: () => void
  handleCancel: () => void
  handleOpenChange: (open: boolean) => void
}
```

```ts
// src/components/shared/confirm-dialog/confirm-dialog.hook.ts
import { useCallback } from 'react'
import type { UseConfirmDialogParams, ConfirmDialogView } from './confirm-dialog.type'

export const useConfirmDialog = (params: UseConfirmDialogParams): ConfirmDialogView => {
  const { open, title, description, confirmLabel, cancelLabel, variant = 'default', onConfirm, onCancel } = params

  const handleConfirm = useCallback(() => onConfirm(), [onConfirm])
  const handleCancel = useCallback(() => onCancel(), [onCancel])
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) onCancel()
    },
    [onCancel]
  )

  return {
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    isDestructive: variant === 'destructive',
    handleConfirm,
    handleCancel,
    handleOpenChange,
  }
}
```

```tsx
// src/components/shared/confirm-dialog/confirm-dialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useConfirmDialog } from './confirm-dialog.hook'
import type { ConfirmDialogProps } from './confirm-dialog.type'

export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const view = useConfirmDialog(props)
  return (
    <Dialog open={view.open} onOpenChange={view.handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{view.title}</DialogTitle>
          <DialogDescription>{view.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={view.handleCancel}>{view.cancelLabel}</Button>
          <Button variant={view.isDestructive ? 'destructive' : 'default'} onClick={view.handleConfirm}>
            {view.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

```ts
// src/components/shared/confirm-dialog/index.ts
export { ConfirmDialog } from './confirm-dialog'
export type { ConfirmDialogProps } from './confirm-dialog.type'
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/components/shared/confirm-dialog
```

- [ ] **Step 5: Commit**

```bash
git add src/components/shared/confirm-dialog
git commit -m "feat(shared): ConfirmDialog component"
```

---

### Task 20: Copy sample Superstore CSV to `public/sample/`

**Files:**
- Create: `public/sample/superstore.csv`

- [ ] **Step 1: Copy the existing sample file**

```bash
mkdir -p public/sample
cp "docs/Sample - Superstore.csv" public/sample/superstore.csv
```

- [ ] **Step 2: Verify the file is accessible via dev server**

```bash
npm run dev
```

Open `http://localhost:5173/sample/superstore.csv` in browser. Expected: file downloads/displays.

- [ ] **Step 3: Commit**

```bash
git add public/sample/superstore.csv
git commit -m "chore: bundle Superstore sample CSV"
```

---

### Task 21: Final foundation check

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: all PASS, no failures.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: exit 0.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: exit 0.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: exit 0; `dist/` contains `index.html` + assets.

- [ ] **Step 5: Tag the foundation commit**

```bash
git tag phase-01-complete
git log --oneline -5
```

---

## Phase 01 done

Every exit criterion at the top of this file is now checked. Move to `02-shell-and-home.md`.
