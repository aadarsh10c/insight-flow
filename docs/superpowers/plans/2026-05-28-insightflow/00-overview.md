# InsightFlow — Implementation Plan · Overview

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement each phase task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Phases are **strictly sequential** — each phase's exit criteria must pass before the next phase begins.

**Goal:** Ship a guided BI chart builder for non-technical business users — multi-document edition — deployed to Vercel, by following 7 sequential phases.

**Architecture:** React 19 + Vite SPA. TanStack Router file-based with `autoCodeSplitting`. Zustand stores persisted to `localStorage` via a schema-versioned adapter. shadcn/ui + Tailwind v4. Plotly for charts (lazy-loaded). Theme system with no-flash inline script.

**Tech Stack:** React 19 · TypeScript (strict) · Vite · TanStack Router · Tailwind CSS v4 · shadcn/ui · Lucide · Plotly.js · PapaParse · SheetJS · Zustand · Vitest · React Testing Library · Playwright · Vercel.

---

## Reference docs (read before each phase)

| Doc | Purpose |
|---|---|
| `docs/InsightFlow_Whitepaper_v3.md` | Product spec — what we're building, for whom, why |
| `docs/StyleGuide.md` | Visual design system — tokens, scales, components |
| `docs/CodeStyleGuide.md` | Code conventions — module pattern, FP, types |
| `docs/superpowers/specs/2026-05-28-insightflow-design.md` | Technical contract — architecture, state, persistence, theme |

**Non-negotiables (from CodeStyleGuide):**
1. Module pattern: every folder has `index.ts` + `.tsx` (pure JSX, zero inline logic) + `.hook.ts` + `.type.ts` + optional `.utils.ts`
2. Children at module root — NO `sub-components/` wrapper
3. `useEffect` is a code smell — justify every one
4. No inline arrow handlers, ternaries computing text, or `useState` in `.tsx` files
5. Types in `.type.ts` only — never inline `interface Props {}`
6. kebab-case files · PascalCase types · `handle*` event handlers · `is/has/should` booleans
7. No `any`. Discriminated unions. Branded types for IDs.
8. **FP + abstract + minimal code.** Aim to write as little code as possible. The second time a pattern appears (search/filter list, type-driven form field, stepper card, etc.), extract it into a primitive in `components/shared/` or `lib/`. Prefer composition over inheritance. Pure functions over methods. `reduce` / `flatMap` / `map` over imperative loops. If two modules share a hook shape, lift it.

---

## CONSTRAINTS — these override anything in individual phase files

When the rules below contradict task wording in any phase plan, **the rules here win.** Phase files weren't updated when new constraints emerged — they're authoritative on *what* to build; this section is authoritative on *how* and *what to skip*.

| # | Rule | Implication for plan tasks |
|---|---|---|
| C1 | **Tests only for the data-trust layer.** Test parsers + chart logic. Skip tests everywhere else. | The plans contain TDD steps for many files — only follow them for the files in the **TESTED ALLOWLIST** below. For all other files, collapse "Write test → Run fail → Implement → Run pass → Commit" into just "Implement → Commit". |
| C2 | **Vitest only — no React Testing Library, no Playwright.** | Install `vitest` + `@vitest/ui`. Do **not** install `@testing-library/*`, `jsdom`, `@playwright/test`. Skip `src/test/setup.ts` and the RTL `cleanup()` afterEach hook. No `playwright.config.ts`. Phase 07's Playwright task is **skipped entirely**. |
| C3 | **`vitest.config.ts` is `node` env**, not `jsdom`. | Allowlist modules are pure Node — no DOM needed. Use `environment: 'node'` in `vitest.config.ts`. |
| C4 | **`npm test` runs Vitest** and IS a gate for the allowlist files only. | Exit criteria: `typecheck` + `lint` + `build` + `test` (Vitest, allowlist coverage). Phase 07 E2E exit criterion is removed. |
| C5 | **FP + abstract + minimal.** | Restated from rule 8. |
| C6 | **Fluid sizing.** | Never hardcode `px` widths/heights for content (see `ScreenSpecs.md` Global Layout Principles). Use `fr` / `%` / `flex-1` / `auto` / `fit-content`. The only fixed widths are sidebar (220px), borders, icon sizes, gaps, focus rings. |
| C7 | **4 data types are locked.** | `ColumnType = 'number' \| 'category' \| 'text' \| 'date'`. Filter UX is type-driven (Category→dropdown, Text/Number/Date→input). |
| C8 | **For non-tested files**, collapse TDD task steps. | If a plan task is "Step 1: Write test → Step 2: Run, verify FAIL → Step 3: Implement → Step 4: Run, verify PASS → Step 5: Commit" and the file is NOT in the TESTED ALLOWLIST, do just: "Step 1: Implement → Step 2: Commit". |
| C9 | **Whenever a new constraint emerges**, add it here. Do not update every phase file. The phase files describe modules and code shape; this section describes global rules. |
| C10 | **Local only — no GitHub, no Vercel.** | Project stays on the laptop. Skip the entire Phase 07 deploy task (Task 5 in `07-polish-and-deploy.md`). Skip the README "Live URL" line and "Vercel" mentions. Skip `vercel.json` creation (Task 4). Keep error-boundary + responsive-banner + README (without live URL). `Done = all of these` exit criterion "App deployed to Vercel with a public URL" is removed. |

### TESTED ALLOWLIST — modules that MUST have Vitest tests

These are the trust-critical pieces. Bugs here = wrong data + wrong charts = product fails.

**Parsers** (Phase 01 + Phase 02 + Phase 03):
- `src/lib/parsers/detect-types.ts` — 4-type detection, threshold logic
- `src/lib/parsers/csv.ts` — PapaParse wrapper · returns `{rows, errors}`
- `src/lib/parsers/xlsx.ts` — SheetJS wrapper · returns `{rows, errors}`

**Chart logic** (Phase 01 + Phase 05):
- `src/lib/time-buckets.ts` — `getValidBuckets`, `pickDefaultBucket`, bucket boundaries
- `src/lib/plotly-theme.ts` — `getPlotlyLayout(mode)`, `getCategoricalPalette()` shape
- `src/routes/-report-detail-page/chart-builder-dialog/chart-builder-reducer.ts` — every action, every cascade rule, snapshot/undo
- `src/routes/-report-detail-page/chart-builder-dialog/chart-builder-dialog.utils.ts` — `partitionColumns`, `aggregateForBar`, `aggregateForLine`, `topNWithOther`, `bucketKey`, `uniqueValuesOf`

### EXPLICITLY NOT TESTED

These have NO tests in V1 — skip every TDD step in the plan for them:
- Stores (`src/stores/*.store.ts`)
- All page modules (`-home-page`, `-data-sources-page`, `-reports-page`, `-report-detail-page`, `-styleguide-page`)
- All dialog modules (`upload-data-source-dialog`, `add-report-dialog`, `chart-builder-dialog` orchestration · the dialog itself, not the reducer/utils)
- All step modules inside chart-builder (`step-1-chart-type` through `step-4-style`)
- All shared primitives (`type-badge`, `applied-filter-chips`, `step-card`, `filter-row`, `confirm-dialog`)
- Shell modules (`shell`, `sidebar`, `toast-host`, `responsive-banner`, `error-boundary`)
- `lib/sample-data/seed.ts`
- `lib/storage.ts` — although tempting, the localStorage shape is verified by usage; skipping per scope
- `lib/utils/*` — small helpers
- `lib/ids.ts`

---

## Phase sequence

Each phase is its own file. **Execute in order — do not start a phase until the previous phase's exit criteria pass.**

| # | File | Phase | Outcome |
|---|---|---|---|
| 01 | [`01-foundation.md`](./01-foundation.md) | Project bootstrap | Vite + TS + Tailwind v4 + shadcn + TanStack Router scaffolded; `lib/` pure modules + stores + persistence adapter unit-tested; theme system live with no-flash; sample CSV in `public/`. |
| 02 | [`02-shell-and-home.md`](./02-shell-and-home.md) | Shell & Home route | Sidebar shell renders; Home route renders fullscreen with branded layout + "Try sample data" lazy-loading; root layout splits Home vs Shell+Outlet correctly. |
| 03 | [`03-data-sources.md`](./03-data-sources.md) | Data Sources flow | `/datasources` route lists data sources with persistent tick on most recent; Upload dialog parses CSV/XLSX with limits + errors; "Create Report" row action wired. |
| 04 | [`04-reports-list.md`](./04-reports-list.md) | Reports list & Add Report | `/reports` route lists reports with delete-confirm; Add Report dialog with column-config table (rename, type override, ignore) creates a report and routes to its detail page. |
| 05 | [`05-report-detail-and-chart-builder.md`](./05-report-detail-and-chart-builder.md) | Report Detail + Chart Builder | `/reports/:id` shows report + Add Widget; Chart Builder full-screen dialog with 4-step stepper, live Plotly preview, time-bucket toggle, 12-swatch color picker, Reset Undo toast. |
| 06 | [`06-styleguide-route.md`](./06-styleguide-route.md) | `/styleguide` route | Read-only route renders every token, scale, component example live — mirrors `StyleGuide.md` at runtime. |
| 07 | [`07-polish-and-deploy.md`](./07-polish-and-deploy.md) | Polish & deploy | Responsive banner, error boundary, Playwright E2E happy path, Vercel config, README. |

---

## Execution rules

1. **Sequential only.** Phase N requires Phase N-1's exit criteria to pass. No parallel phases.
2. **Within a phase, tasks are also sequential** unless explicitly marked parallelizable.
3. **TDD throughout.** Every feature task starts with a failing test. Every implementation step is the minimum code to pass that test.
4. **Commit per task.** Each task ends with a `git commit`. No "big bang" commits.
5. **Don't skip the checkbox.** Update `[ ]` → `[x]` as you complete each step. The plan file is the progress tracker.
6. **Pull the latest plan file before starting a phase.** Plans may have been refined; commits may have updated the checkboxes.

---

## Done = all of these

- [ ] All 7 phase plan files written and committed
- [ ] All 7 phases executed with every checkbox checked
- [ ] All unit + integration + E2E tests pass on `main`
- [ ] App deployed to Vercel with a public URL
- [ ] README in repo root with: live URL, screenshots, architecture summary, how to run locally

---

## Why split into phases?

Each phase produces **independently testable** output. After Phase 01, the project builds and the foundation tests pass — even though no UI exists yet. After Phase 02, the Home route works in a browser. After Phase 03, the Data Sources route works. And so on. This makes review checkpoints natural and avoids merge-everything-at-end risk.
