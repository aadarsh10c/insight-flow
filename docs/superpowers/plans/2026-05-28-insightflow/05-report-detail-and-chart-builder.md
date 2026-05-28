# Phase 05 — Report Detail & Chart Builder

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship `/reports/:id` with inline-editable name + description, single-chart canvas, applied-filter chips. Ship the Chart Builder dialog with **all 4 steps always visible** (locked/active/complete state machine), live Plotly preview, **period dropdown in preview header** (line only), **type-driven filter rows** (Category → dropdown, Text → input, all AND-ed), Reset Undo, and edit-with-auto-restore for ignored columns.

**Architecture:** Stepper state machine via `useReducer` (cascade rules in whitepaper §15). Plotly dynamic-imported in `chart-preview.hook.ts`. **One generic `<StepCard>` primitive** powers the 4 step containers. **One generic `<FilterRow>` primitive** renders the right value input based on the column's type. **One generic `<TypeBadge>` and `<AppliedFilterChips>` primitive** reused between Chart Builder preview and Report Detail card. Aim: as little code as possible.

**Tech Stack:** React 19 · TypeScript · Plotly.js (lazy) · shadcn primitives · reducer.

**Reference docs:** Whitepaper §7 (Report Detail), §10 (Chart Builder), §11 (4 data types · filter UX), §15 (stepper). ScreenSpecs §6, §7. Design spec §4 (reducer), §8 (Chart Builder details), §11 (Toast undo).

---

## Pre-conditions

- Phase 04 exit criteria pass · `git tag phase-04-complete` exists
- `lib/parsers/detect-types.ts` returns 4 types (`number` · `category` · `text` · `date`)

---

## Exit criteria

- [ ] `/reports/:id` renders header (editable name + description) + data-source tag + applied-filter chips + canvas
- [ ] Empty description shows muted placeholder *"No description — click to add"*
- [ ] Empty canvas: "No chart yet" + "Add Widget" CTA
- [ ] Chart present: chart card shows title + filter chips below + Plotly chart; primary button label flips to "Edit Widget"
- [ ] Chart Builder dialog: **all 4 step cards always visible**; locked steps show padlock + hidden body; active step expanded; complete steps show one-line summary
- [ ] Step 1 chart-type cards with disabled state + plain-English hint for unavailable types
- [ ] Step 2 (bar) shows compatible Number measure + Category group selects
- [ ] Step 2 (pie) shows Number measure + Category split (≤20 unique values · "Top 6 + Other" note for 7–20)
- [ ] Step 2 (line) shows Number measure + Date column · **no time-bucket control here**
- [ ] Line chart: **period dropdown in preview-card header (top-right)**, smart-filtered to valid buckets
- [ ] Step 3 filter: "+ Add filter" button, multiple rows AND-ed, **column type drives value input** (Category=dropdown · Text=input · Number/Date=input)
- [ ] Step 4 style: title input · 12-swatch picker (3 rows) · legend toggle
- [ ] Live preview re-renders on every change · empty placeholder when not yet valid
- [ ] **Applied-filter chips** render below preview title (Chart Builder) AND below saved chart title (Report Detail)
- [ ] Reset All → emits 5-second undo toast (no confirm dialog)
- [ ] Edit Widget loads existing chart config into the stepper · auto-restores ignored columns if any are referenced by the chart, with dismissable note
- [ ] Plotly only loads when Chart Builder dialog opens (Network tab verification)
- [ ] Phase 05 tests pass; `typecheck`, `lint`, `build` green

---

## File structure created in this phase

```
src/
├── components/shared/
│   ├── type-badge/                          # NEW: 4-type chip (CATEGORY, TEXT, NUMBER, DATE)
│   ├── applied-filter-chips/                # NEW: shared chips component (preview + report-detail)
│   ├── step-card/                           # NEW: locked/active/complete primitive
│   └── filter-row/                          # NEW: type-driven value input
└── routes/
    ├── reports/
    │   └── $reportId.tsx                    # route file
    └── -report-detail-page/
        ├── index.ts
        ├── report-detail-page.{tsx,hook.ts,type.ts}
        └── chart-builder-dialog/
            ├── index.ts
            ├── chart-builder-dialog.{tsx,hook.ts,type.ts,utils.ts}
            ├── chart-builder-reducer.ts     # + .test.ts (TDD)
            ├── chart-preview/
            │   └── chart-preview.{tsx,hook.ts,type.ts}
            ├── step-1-chart-type/
            ├── step-2-data/
            ├── step-3-filter/
            └── step-4-style/
```

---

## Tasks

### Task 1: Shared primitives (write once, reuse many)

**Files:** 4 new modules under `src/components/shared/`. Each follows the standard 4-file pattern.

#### 1.1 — `type-badge/`

Pure component. Renders a tiny uppercase label given a `ColumnType`.

```ts
// type-badge.type.ts
import type { ColumnType } from '@/types/data-source.type'
export type TypeBadgeProps = { type: ColumnType }
```

```tsx
// type-badge.tsx
import type { TypeBadgeProps } from './type-badge.type'

const LABELS = { number: 'NUMBER', category: 'CATEGORY', text: 'TEXT', date: 'DATE' } as const

export const TypeBadge = ({ type }: TypeBadgeProps) => (
  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{LABELS[type]}</span>
)
```

No hook needed — single prop, no logic.

#### 1.2 — `applied-filter-chips/`

Renders the chip group used in BOTH Chart Builder preview header AND Report Detail chart card.

```ts
// applied-filter-chips.type.ts
import type { FilterClause } from '@/types/chart.type'
import type { ColumnConfigMap } from '@/types/report.type'

export type AppliedFilterChipsProps = {
  filters: ReadonlyArray<FilterClause>
  columnConfig: ColumnConfigMap   // for renamed labels
}
```

```tsx
// applied-filter-chips.tsx
import { Filter } from 'lucide-react'
import type { AppliedFilterChipsProps } from './applied-filter-chips.type'

const labelOf = (col: string, cfg: AppliedFilterChipsProps['columnConfig']) => cfg[col]?.label ?? col

export const AppliedFilterChips = ({ filters, columnConfig }: AppliedFilterChipsProps) => {
  if (filters.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Filter className="h-3 w-3" aria-hidden />
        Filtered:
      </span>
      {filters.map((f) => (
        <span key={f.id} className="rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
          {labelOf(f.column, columnConfig)} {f.predicate === 'contains' ? 'contains' : '='} {formatValue(f)}
        </span>
      ))}
    </div>
  )
}

const formatValue = (f: AppliedFilterChipsProps['filters'][number]): string =>
  f.predicate === 'contains' ? `"${f.values[0]}"` : String(f.values[0])
```

#### 1.3 — `step-card/`

Generic locked/active/complete container used by all 4 Chart Builder steps.

```ts
// step-card.type.ts
import type { ReactNode } from 'react'
export type StepCardStatus = 'locked' | 'active' | 'complete' | 'reset'
export type StepCardProps = {
  status: StepCardStatus
  stepNumber: 1 | 2 | 3 | 4
  title: string
  optional?: boolean
  summary?: string          // shown when complete
  resetReason?: string      // shown when reset
  onExpand?: () => void     // re-enter editing for a complete step
  children?: ReactNode      // step body — rendered only when active or reset
}
```

```tsx
// step-card.tsx
import { Lock, Check, Circle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { StepCardProps } from './step-card.type'

export const StepCard = (props: StepCardProps) => {
  const { status, stepNumber, title, optional, summary, resetReason, onExpand, children } = props
  const isBodyVisible = status === 'active' || status === 'reset'
  return (
    <div className={cn(
      'rounded-lg border bg-surface',
      status === 'locked' && 'opacity-55',
      status === 'active' && 'border-accent ring-2 ring-accent/15',
      status === 'complete' && 'border-border',
      status === 'reset' && 'border-warning/50'
    )}>
      <button
        type="button"
        onClick={status === 'complete' ? onExpand : undefined}
        disabled={status === 'locked' || status === 'active'}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left"
      >
        <StatusDot status={status} />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step {stepNumber}{status === 'locked' && ' · Locked'}{status === 'complete' && ' · Complete'}
            {optional && <span className="ml-1.5 font-normal text-[10px] text-muted-foreground/70">optional</span>}
          </div>
          <div className="text-sm font-semibold">{title}</div>
        </div>
      </button>
      {status === 'complete' && summary && (
        <div className="px-3.5 pb-2.5 pl-[42px] text-xs text-muted-foreground">{summary}</div>
      )}
      {status === 'reset' && resetReason && (
        <div className="px-3.5 pb-2.5 pl-[42px] text-[11px] italic text-warning">Reset — {resetReason}</div>
      )}
      {isBodyVisible && <div className="border-t border-border/60 p-3.5">{children}</div>}
    </div>
  )
}

const StatusDot = ({ status }: { status: StepCardProps['status'] }) => {
  if (status === 'locked') return <div className="grid h-5 w-5 place-items-center text-muted-foreground"><Lock className="h-3 w-3" /></div>
  if (status === 'complete') return <div className="grid h-5 w-5 place-items-center rounded-full bg-success text-white"><Check className="h-3 w-3" /></div>
  return <div className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white"><Circle className="h-2.5 w-2.5 fill-current" /></div>
}
```

#### 1.4 — `filter-row/`

The polymorphic value input. Column type drives the second control.

```ts
// filter-row.type.ts
import type { ColumnType, RowData } from '@/types/data-source.type'
import type { FilterClause } from '@/types/chart.type'

export type FilterableColumn = { name: string; type: ColumnType }

export type FilterRowProps = {
  filter: FilterClause
  availableColumns: ReadonlyArray<FilterableColumn>
  rows: ReadonlyArray<RowData>      // needed for Category dropdown values
  labelOf: (column: string) => string
  onChange: (next: FilterClause) => void
  onRemove: () => void
}
```

```tsx
// filter-row.tsx
import { X } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { TypeBadge } from '../type-badge'
import { useFilterRow } from './filter-row.hook'
import type { FilterRowProps } from './filter-row.type'

export const FilterRow = (props: FilterRowProps) => {
  const view = useFilterRow(props)
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5 rounded-md border border-border bg-muted/30 p-1.5">
      <Select value={view.columnName} onValueChange={view.handleColumnChange}>
        <SelectTrigger className="h-8"><SelectValue placeholder="Column…" /></SelectTrigger>
        <SelectContent>
          {view.availableColumns.map((c) => (
            <SelectItem key={c.name} value={c.name}>
              <span className="flex items-center gap-2">{view.labelOf(c.name)} <TypeBadge type={c.type} /></span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {view.valueInput === 'dropdown' ? (
        <Select value={String(view.value)} onValueChange={view.handleValueChange}>
          <SelectTrigger className="h-8"><SelectValue placeholder="Value…" /></SelectTrigger>
          <SelectContent>
            {view.dropdownOptions.map((v) => <SelectItem key={String(v)} value={String(v)}>{String(v)}</SelectItem>)}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={String(view.value ?? '')}
          placeholder={view.valueInput === 'text' ? 'contains…' : 'value…'}
          onChange={view.handleTextValueChange}
          className="h-8"
        />
      )}

      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={view.handleRemove}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
```

```ts
// filter-row.hook.ts
import { useCallback, useMemo } from 'react'
import { uniqueValuesOf } from '@/routes/-report-detail-page/chart-builder-dialog/chart-builder-dialog.utils'
import type { FilterRowProps } from './filter-row.type'
import type { ChangeEvent } from 'react'

export const useFilterRow = (props: FilterRowProps) => {
  const { filter, availableColumns, rows, labelOf, onChange, onRemove } = props
  const selectedColumn = useMemo(
    () => availableColumns.find((c) => c.name === filter.column) ?? null,
    [availableColumns, filter.column]
  )

  const valueInput: 'dropdown' | 'text' | 'number' = useMemo(() => {
    if (!selectedColumn) return 'text'
    if (selectedColumn.type === 'category') return 'dropdown'
    return 'text'    // text · number · date all use a text input in V1
  }, [selectedColumn])

  const dropdownOptions = useMemo(
    () => (valueInput === 'dropdown' && selectedColumn ? uniqueValuesOf(rows, selectedColumn.name) : []),
    [valueInput, selectedColumn, rows]
  )

  const handleColumnChange = useCallback((columnName: string) => {
    const col = availableColumns.find((c) => c.name === columnName)
    const predicate = col?.type === 'text' ? 'contains' : 'equals'
    onChange({ ...filter, column: columnName, values: [], predicate })
  }, [availableColumns, filter, onChange])

  const handleValueChange = useCallback((value: string) => {
    onChange({ ...filter, values: [value] })
  }, [filter, onChange])

  const handleTextValueChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filter, values: [e.target.value] })
  }, [filter, onChange])

  return {
    columnName: filter.column,
    availableColumns,
    labelOf,
    value: filter.values[0],
    valueInput,
    dropdownOptions,
    handleColumnChange,
    handleValueChange,
    handleTextValueChange,
    handleRemove: onRemove,
  }
}
```

- [ ] **Steps:** scaffold each of the 4 modules with `index.ts`, `.tsx`, `.hook.ts` (where needed), `.type.ts`. Write smoke tests (1–2 each). Commit one module per commit.

```bash
git commit -m "feat(shared): type-badge primitive"
git commit -m "feat(shared): applied-filter-chips primitive"
git commit -m "feat(shared): step-card locked/active/complete primitive"
git commit -m "feat(shared): filter-row with type-driven value input"
```

---

### Task 2: Update `report.type.ts` and `chart.type.ts` for the locked filter spec

Add a `predicate` field to `FilterClause` so Text filters can be `'contains'` and others `'equals'`:

```ts
// types/chart.type.ts — add to FilterClause
export type FilterClause = {
  id: string
  column: string
  predicate: 'equals' | 'contains'
  values: unknown[]
}
```

- [ ] **Step 1: Update the type · run typecheck · fix call sites that referenced the old shape**

```bash
npm run typecheck
```

- [ ] **Step 2: Commit**

```bash
git add src/types/chart.type.ts
git commit -m "feat(types): FilterClause adds predicate (equals/contains)"
```

---

### Task 3: `chart-builder-reducer.ts` — pure state machine (TDD)

Same reducer as the v1 design — state machine with cascade resets. Action types · initial state · reducer all per design spec §4. See whitepaper §15 for cascade rules.

> **Implementation note:** keep the reducer **pure** — no dependencies on stores, no DOM, no `Date.now()`. Snapshot for undo is a deep clone of the previous state stored on the state object itself.

- [ ] Write the full TDD test suite (initialState, SET_CHART_TYPE cascade, SET_DATA cascade, SET_FILTER no-cascade, SET_STYLE no-cascade, RESET_ALL captures snapshot, RESTORE_FROM_SNAPSHOT replays, LOAD_FROM_CHART_CONFIG hydrates a complete state). See the v1 of this plan committed at `phase-04-complete` for the test list — port verbatim.
- [ ] Implement the reducer to make tests pass.
- [ ] Commit:

```bash
git commit -m "feat(chart-builder): pure reducer state machine"
```

---

### Task 4: `chart-builder-dialog.utils.ts` — partition + aggregation (TDD)

Same pure helpers as v1 plus the 4-type-aware partition:

```ts
// partitionColumns now returns numeric, category, text, temporal arrays
// (Text is partitioned separately from Category — used by filter, not by chart selectors)
export type PartitionedColumns = {
  numeric: string[]
  category: string[]
  text: string[]
  temporal: string[]
}
```

- [ ] Update tests: ensure Category and Text are split correctly via the inferred type or override.
- [ ] Implement: read `effectiveType` (override ?? inferred), push into the right bucket, skip ignored.
- [ ] Other utilities (`aggregateForBar`, `aggregateForLine`, `topNWithOther`, `uniqueValuesOf`, `bucketKey`) carry over unchanged. Tests per v1 of this plan.
- [ ] Commit:

```bash
git commit -m "feat(chart-builder): aggregation + 4-type partition utils"
```

---

### Task 5: `chart-preview/` — lazy Plotly + applied-filter chips header

**Critical changes from v1:**
- Header now has 3 zones: title (left) · applied-filter chips below title · **period dropdown top-right (line chart only)**
- Plotly still dynamic-imported

```tsx
// chart-preview.tsx (sketch)
export const ChartPreview = (props: ChartPreviewProps) => {
  const view = useChartPreview(props)
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <div className="font-serif text-base font-semibold">{view.title}</div>
          <AppliedFilterChips filters={view.filters} columnConfig={view.columnConfig} />
        </div>
        {view.periodDropdown && (
          <Select value={view.periodDropdown.value} onValueChange={view.periodDropdown.onChange}>
            <SelectTrigger className="h-8 w-fit"><SelectValue /></SelectTrigger>
            <SelectContent>
              {view.periodDropdown.options.map((o) => (
                <SelectItem key={o.value} value={o.value} disabled={!o.valid}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      {view.isReady ? <Suspense fallback={null}><Plot {...view.plotProps} /></Suspense> : <EmptyPlaceholder />}
    </div>
  )
}
```

- [ ] **Steps:** Build the 4 module files. Hook computes `plotData`/`plotLayout` via `getPlotlyLayout(resolvedTheme)` + the right aggregation util. For line charts, the hook exposes `periodDropdown: { value, options, onChange }` where `options` is the full 5-bucket list with `valid` flags from `getValidBuckets()`. For non-line, `periodDropdown` is `null`.
- [ ] Reuse `AppliedFilterChips` from Task 1 — do not re-implement.
- [ ] Commit:

```bash
git commit -m "feat(chart-preview): lazy Plotly + applied-filter chips + period dropdown header"
```

---

### Task 6: `step-1-chart-type/` — disabled cards with hints

Reuses `StepCard` from Task 1 for the outer container. Inner content: the 3 chart-type cards (Bar / Pie / Line) — disabled state derived from `partitioned`.

- [ ] Hook: `useStep1ChartType` computes `cards: ChartTypeCard[]` where each has `disabled` + `disabledHint` strings.
- [ ] Component: pure JSX rendering the cards (no `StepCard` wrapper here — the parent `ChartBuilderDialog` wraps with `StepCard`).
- [ ] Commit:

```bash
git commit -m "feat(chart-builder): step 1 chart-type cards"
```

---

### Task 7: `step-2-data/` — data field selectors (period moved out)

Compatible columns per chart type:
- **Bar:** measure = `partitioned.numeric` · group = `partitioned.category`
- **Pie:** measure = `partitioned.numeric` · split = `partitioned.category` filtered to `uniqueValuesOf(rows, col).length <= 20` (+ note for 7-20: "Top 6 + Other")
- **Line:** measure = `partitioned.numeric` · date = `partitioned.temporal`. **No bucket selector here.**

> **Default bucket** when line + date column picked: `pickDefaultBucket(dateValues) ?? 'monthly'`. Stored on the LineConfig immediately so the preview's period dropdown can swap it later.

- [ ] Hook returns `measureColumns`, `groupOrSplitColumns`, `temporalColumns`, `splitColumnNote` (string | null), handlers per field.
- [ ] No segmented control here.
- [ ] Commit:

```bash
git commit -m "feat(chart-builder): step 2 data — 4-type aware compatibility"
```

---

### Task 8: `step-3-filter/` — Add filter button · AND-ed rows · type-driven

Reuses `FilterRow` from Task 1. Step is optional — empty rows means no filter applied.

```ts
// step-3-filter.hook.ts (sketch)
export const useStep3Filter = (props) => {
  const filterableColumns = useMemo(() => [
    ...partitioned.category.map((n) => ({ name: n, type: 'category' as const })),
    ...partitioned.text.map((n) => ({ name: n, type: 'text' as const })),
    ...partitioned.numeric.map((n) => ({ name: n, type: 'number' as const })),
    ...partitioned.temporal.map((n) => ({ name: n, type: 'date' as const })),
  ], [partitioned])

  const handleAdd = useCallback(() => {
    onChange([...value, { id: newId(), column: '', predicate: 'equals', values: [] }])
  }, [value, onChange])

  // ... handleUpdate(id, next), handleRemove(id)
}
```

```tsx
// step-3-filter.tsx (sketch)
export const Step3Filter = (props) => {
  const view = useStep3Filter(props)
  return (
    <div className="space-y-2">
      {view.filters.map((f, i) => (
        <Fragment key={f.id}>
          {i > 0 && <div className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AND</div>}
          <FilterRow filter={f} availableColumns={view.filterableColumns} rows={view.rows} labelOf={view.labelOf} onChange={(next) => view.handleUpdate(f.id, next)} onRemove={() => view.handleRemove(f.id)} />
        </Fragment>
      ))}
      <Button variant="outline" size="sm" onClick={view.handleAdd} className="border-dashed border-accent text-accent">
        <Plus className="mr-1 h-3.5 w-3.5" /> Add filter
      </Button>
    </div>
  )
}
```

- [ ] Commit:

```bash
git commit -m "feat(chart-builder): step 3 filter — AND rows w/ type-driven inputs"
```

---

### Task 9: `step-4-style/` — title + 12-swatch picker + legend

Carries over from v1 unchanged. 12 swatches in 3 rows (Warm / Cool / Neutral). Sample handler in the existing v1 plan covers this.

- [ ] Commit:

```bash
git commit -m "feat(chart-builder): step 4 style"
```

---

### Task 10: `chart-builder-dialog/` — wire everything up with StepCard

**Key change from v1:** all 4 step cards always rendered using the shared `StepCard` primitive. The reducer's `state.steps[N].status` drives the `status` prop.

```tsx
// chart-builder-dialog.tsx (sketch — config column only)
<div className="space-y-3">
  <StepCard status={view.state.steps[1].status} stepNumber={1} title="Chart type" onExpand={view.handleExpand(1)} summary={view.summaries.step1}>
    <Step1ChartType {...view.step1Props} />
  </StepCard>
  <StepCard status={view.state.steps[2].status} stepNumber={2} title="Data" onExpand={view.handleExpand(2)} summary={view.summaries.step2} resetReason={view.state.steps[2].status === 'reset' ? 'chart type changed' : undefined}>
    <Step2Data {...view.step2Props} />
  </StepCard>
  <StepCard status={view.state.steps[3].status} stepNumber={3} title="Filter" optional onExpand={view.handleExpand(3)} summary={view.summaries.step3}>
    <Step3Filter {...view.step3Props} />
  </StepCard>
  <StepCard status={view.state.steps[4].status} stepNumber={4} title="Style" optional onExpand={view.handleExpand(4)} summary={view.summaries.step4}>
    <Step4Style {...view.step4Props} />
  </StepCard>
</div>
```

- [ ] Hook owns: `state` (reducer), `partitioned`, `summaries: { step1?, step2?, step3?, step4? }` (computed via small util `buildSummary` in `chart-builder-dialog.utils.ts`), `step1Props` / `step2Props` / `step3Props` / `step4Props`.
- [ ] Reset All emits toast w/ Undo action; Save commits to `reports.store.setChart()` then closes.
- [ ] Load existing chart on `open && report.chart`: dispatch `LOAD_FROM_CHART_CONFIG`.
- [ ] Commit:

```bash
git commit -m "feat(chart-builder): dialog wiring all 4 steps + preview"
```

---

### Task 11: `-report-detail-page/` + route

- Header: editable Name + editable Description with placeholder `"No description — click to add"` + data-source tag + Last-modified timestamp
- Canvas: empty state OR `<ChartPreview />` rendering the saved chart (reuses the same Plotly component as the builder preview, with `AppliedFilterChips` underneath title)
- Add Widget / Edit Widget button (label flips based on `report.chart`)
- Auto-restore ignored columns referenced by the chart on dialog open

- [ ] Build the 4 page module files
- [ ] Build `routes/reports/$reportId.tsx`
- [ ] Commit:

```bash
git commit -m "feat(routes): /reports/:id w/ inline editable header + saved chart + filter chips"
```

---

### Task 12: Toast host renders in shell

The toast store exists from Phase 01. Phase 02 added the shell. Now the shell mounts `<ToastHost />` so toasts (including Reset Undo) actually appear.

- [ ] Build `src/shell/toast-host/` module per design spec §11
- [ ] Mount in `shell.tsx`
- [ ] Verify Reset Undo manually
- [ ] Commit:

```bash
git commit -m "feat(shell): mount ToastHost for Reset Undo + parse errors"
```

---

### Task 13: Phase 05 verification

- [ ] `npm test && npm run typecheck && npm run lint && npm run build`
- [ ] Manual smoke: build a Bar chart with 1 Category + 1 Text filter, confirm chips render in preview AND on saved report
- [ ] Build a Line chart, confirm period dropdown lives in preview header (not Step 2)
- [ ] Reset All → undo toast → click Undo → state restores
- [ ] Open DevTools Network · navigate to a report's detail page · confirm Plotly chunk loads only when Add Widget clicked
- [ ] Edit an existing chart that references an ignored column → see auto-restore note
- [ ] Tag:

```bash
git tag phase-05-complete
```

---

## Phase 05 done

Chart Builder ships with the 4-step always-visible UI, type-driven filters, period dropdown in preview, and applied-filter chips everywhere. The product is functionally complete. Move to `06-styleguide-route.md`.
