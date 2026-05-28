# Phase 07 — Polish & Deploy

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Final polish layer + Playwright E2E happy path + Vercel deploy. After this phase the app is live at a public URL with a README, error boundary, and responsive fallback banner.

**Architecture:** No new app routes. One Error Boundary at `__root.tsx`. One responsive banner module shown below 640px. One Playwright spec exercising the full happy path. Vercel adapter for SPA-routing.

**Tech Stack:** React Error Boundary · Vercel · Playwright.

**Reference docs:** Whitepaper §15 (limitations — responsive). Design spec §10 (error layers) · §13 (responsive) · §14 (testing) · §15 (open items).

---

## Pre-conditions

- Phase 06 exit criteria pass · `git tag phase-06-complete` exists
- Vercel account exists (or another static-host of equivalent capability)

---

## Exit criteria

- [ ] Uncaught render errors caught by Error Boundary · friendly fallback screen with "Reload" button
- [ ] Viewport < 640px shows a non-blocking banner once per session: *"InsightFlow is designed for larger screens. Best experience on a laptop or desktop."* — dismissable, dismissal stored in `sessionStorage`
- [ ] Playwright E2E spec passes locally: Upload → Create report → Build chart → Save → Verify chart on `/reports/:id`
- [ ] Vercel `vercel.json` configured for SPA routing (all unknown paths → `index.html`)
- [ ] App deployed to a public Vercel URL
- [ ] `README.md` updated: live URL · screenshots · how to run locally · architecture summary · evaluation criteria mapping
- [ ] Final test/typecheck/lint/build pass · `git tag v1.0.0`

---

## File structure created in this phase

```
src/
├── components/shared/
│   └── error-boundary/                       # NEW: React ErrorBoundary wrapper
│       └── error-boundary.{tsx,type.ts}
└── shell/
    └── responsive-banner/                    # NEW: <640px nudge banner
        └── responsive-banner.{tsx,hook.ts,type.ts}

e2e/
└── happy-path.spec.ts                        # NEW: Playwright E2E

vercel.json                                   # NEW: SPA routing config
README.md                                     # UPDATED
```

---

## Tasks

### Task 1: Error Boundary

React's class-based ErrorBoundary still required for catching render errors. Single primitive wraps the entire app from `__root.tsx`.

**Files:**
- Create: `src/components/shared/error-boundary/error-boundary.tsx` (+ index.ts + type.ts)

- [ ] **Step 1: Implement**

```tsx
// error-boundary.tsx
import { Component, type ErrorInfo, type ReactNode } from 'react'

export type ErrorBoundaryProps = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('[error-boundary]', error, info) }

  handleReload = () => { this.setState({ error: null }); window.location.reload() }

  render() {
    if (this.state.error === null) return this.props.children
    return (
      <div className="grid min-h-screen place-items-center bg-background p-8 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="font-serif text-2xl font-semibold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">An unexpected error occurred. Reload the page to try again.</p>
          <button onClick={this.handleReload} className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">Reload</button>
        </div>
      </div>
    )
  }
}
```

```ts
// index.ts
export { ErrorBoundary } from './error-boundary'
```

- [ ] **Step 2: Wrap the app**

Modify `src/main.tsx`:

```tsx
import { ErrorBoundary } from '@/components/shared/error-boundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
)
```

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/error-boundary src/main.tsx
git commit -m "feat(error-boundary): top-level fallback for uncaught render errors"
```

---

### Task 2: Responsive banner

Shows below 640px viewport once per session. Mount in `shell.tsx` so it appears on every non-Home page when viewport is small.

**Files:**
- Create: `src/shell/responsive-banner/responsive-banner.{tsx,hook.ts,type.ts}` (+ index.ts)

- [ ] **Step 1: Implement hook**

```ts
// responsive-banner.hook.ts
import { useCallback, useSyncExternalStore, useState } from 'react'
import type { ResponsiveBannerView } from './responsive-banner.type'

const DISMISS_KEY = 'insightflow:responsive-banner-dismissed'
const MOBILE_MEDIA = '(max-width: 640px)'

const subscribe = (notify: () => void) => {
  const mql = matchMedia(MOBILE_MEDIA)
  mql.addEventListener('change', notify)
  return () => mql.removeEventListener('change', notify)
}
const getSnapshot = () => matchMedia(MOBILE_MEDIA).matches

export const useResponsiveBanner = (): ResponsiveBannerView => {
  const isMobile = useSyncExternalStore(subscribe, getSnapshot, () => false)
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1')
  const handleDismiss = useCallback(() => {
    sessionStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }, [])
  return { isVisible: isMobile && !dismissed, handleDismiss }
}
```

```ts
// responsive-banner.type.ts
export type ResponsiveBannerView = { isVisible: boolean; handleDismiss: () => void }
```

```tsx
// responsive-banner.tsx
import { X } from 'lucide-react'
import { useResponsiveBanner } from './responsive-banner.hook'

export const ResponsiveBanner = () => {
  const view = useResponsiveBanner()
  if (!view.isVisible) return null
  return (
    <div className="flex items-start gap-2 border-b border-warning/30 bg-warning/10 px-4 py-2 text-xs text-foreground">
      <span className="flex-1">InsightFlow is designed for larger screens. Best experience on a laptop or desktop.</span>
      <button onClick={view.handleDismiss} aria-label="Dismiss"><X className="h-3.5 w-3.5" /></button>
    </div>
  )
}
```

- [ ] **Step 2: Mount in `shell.tsx`**

```tsx
// inside <Shell>
<div className="flex min-h-screen flex-col bg-background text-foreground">
  <ResponsiveBanner />
  <div className="flex flex-1">
    <Sidebar />
    <main className="flex-1 overflow-y-auto" id="main">{children}<ToastHost /></main>
  </div>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/shell
git commit -m "feat(shell): responsive banner for <640px viewport"
```

---

### Task 3: Playwright E2E happy path

Single spec that runs the full user journey.

**Files:**
- Create: `e2e/happy-path.spec.ts`

- [ ] **Step 1: Sample CSV path: confirm `public/sample/superstore.csv` exists** (from Phase 01)

- [ ] **Step 2: Write the spec**

```ts
// e2e/happy-path.spec.ts
import { test, expect } from '@playwright/test'

test('build a chart end-to-end', async ({ page }) => {
  // 1. Land on Home
  await page.goto('/')
  await expect(page.getByText('Charts your team can actually build')).toBeVisible()

  // 2. Click "Try with sample data" — seeds Superstore + routes to /datasources
  await page.getByRole('button', { name: /Try with sample data/i }).click()
  await page.waitForURL('**/datasources')
  await expect(page.getByText('Sample — Superstore')).toBeVisible()

  // 3. Click Create Report on the row
  await page.getByRole('button', { name: /Create Report/i }).click()
  await page.waitForURL('**/reports**')

  // 4. Add Report dialog should be open with data source pre-selected
  await expect(page.getByText('Add Report')).toBeVisible()
  await page.getByLabel('Name').fill('Sales by Region')
  await page.getByRole('button', { name: /Save report/i }).click()
  await page.waitForURL('**/reports/**')

  // 5. Report Detail — Add Widget
  await page.getByRole('button', { name: /Add Widget/i }).click()
  await expect(page.getByText('Create Chart')).toBeVisible()

  // 6. Step 1 — Bar chart
  await page.getByRole('button', { name: /Bar chart/i }).click()

  // 7. Step 2 — measure + group
  await page.getByLabel('What do you want to measure?').click()
  await page.getByRole('option', { name: /Sales/ }).click()
  await page.getByLabel('How do you want to group it?').click()
  await page.getByRole('option', { name: /Region/ }).click()

  // 8. Save
  await page.getByRole('button', { name: /Save Chart/i }).click()

  // 9. Verify chart on report detail
  await expect(page.getByText(/Sum of Sales by Region/i)).toBeVisible()
})
```

- [ ] **Step 3: Run locally**

```bash
npm run build && npx playwright install --with-deps && npm run test:e2e
```

Expected: spec passes.

- [ ] **Step 4: Commit**

```bash
git add e2e
git commit -m "feat(e2e): happy-path Playwright spec"
```

---

### Task 4: Vercel configuration

SPA routing — Vercel must serve `index.html` for unknown paths.

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/sample/(.*)", "destination": "/sample/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Verify build works locally as Vercel will run it**

```bash
npm run build
npm run preview
```

Browse to `http://localhost:4173`. Click around. Refresh on `/datasources` and `/reports/:id` — confirm both still load (SPA routing test).

- [ ] **Step 3: Commit**

```bash
git add vercel.json
git commit -m "chore: Vercel SPA routing config"
```

---

### Task 5: Deploy to Vercel

**Manual steps — agent should pause and ask user to run these locally** (Vercel auth is interactive).

- [ ] **Step 1: First-time Vercel setup (skip if already linked)**

User runs:

```bash
npm install -g vercel
vercel login
vercel link
```

- [ ] **Step 2: Deploy**

```bash
vercel --prod
```

Vercel prints the public URL. Copy it.

- [ ] **Step 3: Smoke test the live URL**

  - Open the URL in a browser
  - Click "Try with sample data" → confirm it lands on `/datasources` with the sample
  - Build a report end-to-end
  - Refresh on `/reports/:id` → confirm it loads (SPA rewrite works)
  - Toggle dark mode → confirm persists across reload

- [ ] **Step 4: Commit the live URL into the README in Task 6**

---

### Task 6: README

**Files:**
- Modify: `README.md` (replace the Phase 01 stub)

- [ ] **Step 1: Write the README**

```markdown
# InsightFlow

A guided BI chart builder for non-technical business users.

**Live:** https://<your-vercel-url>.vercel.app

---

## What it is

Upload a CSV or Excel file. Pick what you want to see. InsightFlow guides you through every step — no dropdowns to decode, no chart-builder jargon — and produces accurate Plotly charts a business user can actually build.

Three chart types: bar · pie · line. Four data types: Number · Category · Text · Date. One workspace per browser (localStorage). No server, no login.

---

## Stack

- **Framework:** React 19 + Vite
- **Routing:** TanStack Router (file-based, auto code-splitting)
- **Charts:** Plotly.js (lazy-loaded)
- **File parsing:** PapaParse (CSV) + SheetJS (Excel) — both browser-only, dynamic-imported
- **State:** Zustand (4 split stores) · persisted to localStorage with schema versioning
- **UI:** shadcn/ui · Tailwind CSS v4 · Lucide icons
- **Theme:** Warm Editorial palette · light + dark with system preference detection · no-flash inline script
- **Testing:** Vitest + RTL + Playwright (1 E2E happy path)
- **Deploy:** Vercel

See `docs/superpowers/specs/2026-05-28-insightflow-design.md` for the architecture.

---

## Run locally

```bash
npm install
npm run dev          # dev server at http://localhost:5173
npm run test         # Vitest
npm run test:e2e     # Playwright (requires `npx playwright install`)
npm run build        # production bundle to dist/
npm run preview      # preview the production build
```

---

## Documentation

- `docs/InsightFlow_Whitepaper_v3.md` — product spec
- `docs/StyleGuide.md` — visual design system
- `docs/CodeStyleGuide.md` — code conventions
- `docs/ScreenSpecs.md` — per-screen anatomy
- `docs/superpowers/specs/` — design spec
- `docs/superpowers/plans/` — implementation plans (7 phases)
- `docs/mockups/` — confirmed visual mockups

---

## Evaluation criteria mapping

| Brief criterion | Where it shows |
|---|---|
| **UX thinking** | Multi-document model + guided 4-step chart builder + 4-type system that drives compatibility |
| **Visual craft** | Style Guide route at `/styleguide` renders every token live · Warm Editorial palette in both modes |
| **Architecture** | 4 split Zustand stores · TanStack Router auto code-splitting · pure-FP `lib/` · documented in spec |
| **Scope judgment** | One chart per report · 4 user types · no AI in V1 (documented as V2) · concise V1 feature set |
| **AI fluency** | Used Claude Code throughout for design discussion, spec writing, plan generation, and implementation review. See `docs/superpowers/` for the artifact trail |

---

## What's next (V2)

See `InsightFlow_Whitepaper_v3.md §13`.
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README with live URL + architecture + evaluation mapping"
```

---

### Task 7: Final verification

- [ ] `npm test && npm run typecheck && npm run lint && npm run build`
- [ ] `npm run test:e2e`
- [ ] Open live URL · verify happy path + dark mode + refresh-on-route
- [ ] Tag the release:

```bash
git tag v1.0.0
git log --oneline -10
```

---

## Phase 07 done

InsightFlow is live. README points at the URL. Project complete.
