# Phase 04 — Reports List & Add Report

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the `/reports` route. Users see a list of saved reports, click "+ Add Report" to open a dialog (pick data source, name + description, configure columns: rename, type override, ignore), and on save the new report is created and the app routes to `/reports/:id` (which 404s until Phase 05). Reports can be deleted with confirm.

**Architecture:** Three child modules under `-reports-page/`: `report-table/` (list), `add-report-dialog/` (modal), and a nested `column-config-table/` inside the add-report dialog. Pre-selected data source via search param when navigated from `/datasources`.

**Tech Stack:** Same as previous phases — shadcn primitives, Zustand stores, TanStack Router search params.

**Reference docs:** Whitepaper §6 (Reports list), §9 (Add Report dialog). Design spec §4 (reports.store actions), §9 (dialogs/forms).

---

## Pre-conditions

- Phase 03 exit criteria pass
- `git tag phase-03-complete` exists

---

## Exit criteria

- [ ] `/reports` renders the list with empty state when no reports exist
- [ ] List columns: Name · Description · Data source · **Last modified** · Actions (search input above table)
- [ ] List sorted by `updatedAt` DESC (most-recently-modified first)
- [ ] Search input filters list in real time by name OR description (case-insensitive substring). "N of M" results count beside the search input
- [ ] Empty description shows `"—"` in the row
- [ ] "+ Add Report" opens the dialog
- [ ] If navigated with `?dataSourceId=<id>` search param, that data source is pre-selected
- [ ] Column config table shows every column from the selected data source with rename input, type select (**Number / Category / Text / Date**), sample value below each Type select, Ignore toggle
- [ ] Ignored columns collapse into "Ignored columns (N)" accordion at bottom, **closed by default**, restorable
- [ ] Save creates a report and routes to `/reports/:id` (will 404 until Phase 05)
- [ ] Each row has a Delete action — clicking it shows the ConfirmDialog; confirming deletes the report
- [ ] Reports persist across reloads
- [ ] All Phase 04 tests pass; `typecheck`, `lint`, `build` green

---

## File structure created in this phase

```
src/
└── routes/
    ├── reports/
    │   └── index.tsx                                # route file (NEW)
    └── -reports-page/
        ├── index.ts
        ├── reports-page.tsx
        ├── reports-page.hook.ts
        ├── reports-page.type.ts
        ├── report-table/
        │   ├── index.ts
        │   ├── report-table.tsx
        │   ├── report-table.hook.ts
        │   └── report-table.type.ts
        └── add-report-dialog/
            ├── index.ts
            ├── add-report-dialog.tsx
            ├── add-report-dialog.hook.ts
            ├── add-report-dialog.type.ts
            ├── add-report-dialog.utils.ts
            └── column-config-table/
                ├── index.ts
                ├── column-config-table.tsx
                ├── column-config-table.hook.ts
                └── column-config-table.type.ts
```

---

## Tasks

### Task 1: `add-report-dialog/column-config-table/` — column editor

**Files:**
- Create: 4 module files + test

- [ ] **Step 1: Write failing test**

```tsx
// column-config-table.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColumnConfigTable } from './column-config-table'

const columns = [
  { name: 'date', inferredType: 'date' as const },
  { name: 'sales', inferredType: 'number' as const },
  { name: 'region', inferredType: 'text' as const },
]

describe('ColumnConfigTable', () => {
  it('renders one row per column', () => {
    render(<ColumnConfigTable columns={columns} value={{}} onChange={vi.fn()} />)
    expect(screen.getByDisplayValue('date')).toBeInTheDocument()
    expect(screen.getByDisplayValue('sales')).toBeInTheDocument()
    expect(screen.getByDisplayValue('region')).toBeInTheDocument()
  })

  it('emits onChange when a name is edited', async () => {
    const onChange = vi.fn()
    render(<ColumnConfigTable columns={columns} value={{}} onChange={onChange} />)
    const dateInput = screen.getByDisplayValue('date')
    await userEvent.clear(dateInput)
    await userEvent.type(dateInput, 'Order Date')
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      date: expect.objectContaining({ label: 'Order Date' }),
    }))
  })

  it('moves a column to the ignored section when toggled', async () => {
    const onChange = vi.fn()
    render(<ColumnConfigTable columns={columns} value={{}} onChange={onChange} />)
    const ignoreButtons = screen.getAllByRole('button', { name: /ignore/i })
    await userEvent.click(ignoreButtons[0])
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({
      date: expect.objectContaining({ ignored: true }),
    }))
  })
})
```

- [ ] **Step 2: Implement the 4 module files**

```ts
// column-config-table.type.ts
import type { ColumnSchema, ColumnType } from '@/types/data-source.type'
import type { ColumnConfigMap, ColumnOverride } from '@/types/report.type'

export type ColumnConfigTableProps = {
  columns: ReadonlyArray<ColumnSchema>
  value: ColumnConfigMap
  onChange: (next: ColumnConfigMap) => void
}

export type UseColumnConfigTableParams = ColumnConfigTableProps

export type EnrichedColumn = {
  name: string
  effectiveType: ColumnType
  effectiveLabel: string
  override: ColumnOverride
}

export type ColumnConfigTableView = {
  active: EnrichedColumn[]
  ignored: EnrichedColumn[]
  isIgnoredOpen: boolean
  handleLabelChange: (column: string, label: string) => void
  handleTypeChange: (column: string, type: ColumnType) => void
  handleToggleIgnore: (column: string) => void
  handleToggleIgnoredSection: () => void
}
```

```ts
// column-config-table.hook.ts
import { useCallback, useMemo, useState } from 'react'
import type { ColumnType } from '@/types/data-source.type'
import type { ColumnOverride } from '@/types/report.type'
import type {
  ColumnConfigTableView,
  EnrichedColumn,
  UseColumnConfigTableParams,
} from './column-config-table.type'

export const useColumnConfigTable = (
  params: UseColumnConfigTableParams
): ColumnConfigTableView => {
  const { columns, value, onChange } = params
  const [isIgnoredOpen, setIgnoredOpen] = useState(false)

  const enriched = useMemo<EnrichedColumn[]>(
    () =>
      columns.map((c) => {
        const override = value[c.name] ?? {}
        return {
          name: c.name,
          effectiveType: override.type ?? c.inferredType,
          effectiveLabel: override.label ?? c.name,
          override,
        }
      }),
    [columns, value]
  )

  const active = useMemo(() => enriched.filter((c) => !c.override.ignored), [enriched])
  const ignored = useMemo(() => enriched.filter((c) => c.override.ignored === true), [enriched])

  const patch = useCallback(
    (column: string, patch: ColumnOverride) => {
      const current = value[column] ?? {}
      onChange({ ...value, [column]: { ...current, ...patch } })
    },
    [value, onChange]
  )

  const handleLabelChange = useCallback((column: string, label: string) => patch(column, { label }), [patch])
  const handleTypeChange = useCallback((column: string, type: ColumnType) => patch(column, { type }), [patch])
  const handleToggleIgnore = useCallback(
    (column: string) => {
      const current = value[column] ?? {}
      patch(column, { ignored: !current.ignored })
    },
    [value, patch]
  )
  const handleToggleIgnoredSection = useCallback(() => setIgnoredOpen((o) => !o), [])

  return { active, ignored, isIgnoredOpen, handleLabelChange, handleTypeChange, handleToggleIgnore, handleToggleIgnoredSection }
}
```

```tsx
// column-config-table.tsx
import type { ChangeEvent } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { EyeOff, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import type { ColumnConfigTableProps, EnrichedColumn } from './column-config-table.type'
import type { ColumnType } from '@/types/data-source.type'
import { useColumnConfigTable } from './column-config-table.hook'

const TYPE_OPTIONS: { value: ColumnType; label: string }[] = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
]

const renderRow = (
  c: EnrichedColumn,
  ignored: boolean,
  onLabel: (n: string, l: string) => void,
  onType: (n: string, t: ColumnType) => void,
  onIgnore: (n: string) => void
) => (
  <TableRow key={c.name}>
    <TableCell>
      <Input
        value={c.effectiveLabel}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onLabel(c.name, e.target.value)}
        aria-label={`Rename ${c.name}`}
      />
    </TableCell>
    <TableCell>
      <Select value={c.effectiveType} onValueChange={(v: string) => onType(c.name, v as ColumnType)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
        </SelectContent>
      </Select>
    </TableCell>
    <TableCell className="text-right">
      <Button variant="ghost" size="sm" onClick={() => onIgnore(c.name)} aria-label={ignored ? `Restore ${c.name}` : `Ignore ${c.name}`}>
        {ignored ? <><Eye className="mr-2 h-4 w-4" />Restore</> : <><EyeOff className="mr-2 h-4 w-4" />Ignore</>}
      </Button>
    </TableCell>
  </TableRow>
)

export const ColumnConfigTable = (props: ColumnConfigTableProps) => {
  const view = useColumnConfigTable(props)
  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {view.active.map((c) =>
            renderRow(c, false, view.handleLabelChange, view.handleTypeChange, view.handleToggleIgnore)
          )}
        </TableBody>
      </Table>

      {view.ignored.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/30">
          <button
            type="button"
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"
            onClick={view.handleToggleIgnoredSection}
          >
            {view.isIgnoredOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Ignored columns ({view.ignored.length})
          </button>
          {view.isIgnoredOpen && (
            <Table>
              <TableBody>
                {view.ignored.map((c) =>
                  renderRow(c, true, view.handleLabelChange, view.handleTypeChange, view.handleToggleIgnore)
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}
```

```ts
// index.ts
export { ColumnConfigTable } from './column-config-table'
export type { ColumnConfigTableProps } from './column-config-table.type'
```

- [ ] **Step 3: Run, verify PASS**

```bash
npm test src/routes/-reports-page/add-report-dialog/column-config-table
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/-reports-page/add-report-dialog/column-config-table
git commit -m "feat(reports): column config table with ignore section"
```

---

### Task 2: `add-report-dialog/` — utils + module

**Files:**
- Create: 4 module files + utils + test

- [ ] **Step 1: Create `add-report-dialog.utils.ts`**

```ts
// add-report-dialog.utils.ts
import type { ColumnConfigMap } from '@/types/report.type'

export const isValidReportInput = (
  dataSourceId: string | null,
  name: string
): boolean => dataSourceId !== null && name.trim() !== ''

export const stripEmptyOverrides = (config: ColumnConfigMap): ColumnConfigMap => {
  const out: ColumnConfigMap = {}
  for (const [k, v] of Object.entries(config)) {
    const cleaned = { ...v }
    if (cleaned.label === '' || cleaned.label === undefined) delete cleaned.label
    if (cleaned.ignored !== true) delete cleaned.ignored
    if (cleaned.type === undefined) delete cleaned.type
    if (Object.keys(cleaned).length > 0) out[k] = cleaned
  }
  return out
}
```

- [ ] **Step 2: Create the 4 main module files**

```ts
// add-report-dialog.type.ts
import type { DataSource, DataSourceId } from '@/types/data-source.type'
import type { ColumnConfigMap } from '@/types/report.type'

export type AddReportDialogProps = {
  open: boolean
  onClose: () => void
  preselectedDataSourceId?: DataSourceId
}

export type UseAddReportDialogParams = AddReportDialogProps

export type AddReportDialogView = {
  availableDataSources: ReadonlyArray<DataSource>
  selectedDataSource: DataSource | null
  selectedDataSourceId: DataSourceId | null
  name: string
  description: string
  columnConfig: ColumnConfigMap
  isEmpty: boolean
  emptyMessage: string
  isSubmitting: boolean
  canSubmit: boolean
  handleDataSourceChange: (id: DataSourceId) => void
  handleNameChange: (value: string) => void
  handleDescriptionChange: (value: string) => void
  handleColumnConfigChange: (next: ColumnConfigMap) => void
  handleSubmit: () => void
  handleClose: () => void
}
```

```ts
// add-report-dialog.hook.ts
import { useCallback, useMemo, useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDataSourcesList, useDataSourceById } from '@/stores/data-sources.store'
import { useReportsStore } from '@/stores/reports.store'
import type { DataSourceId } from '@/types/data-source.type'
import type { ColumnConfigMap } from '@/types/report.type'
import { isValidReportInput, stripEmptyOverrides } from './add-report-dialog.utils'
import type { AddReportDialogView, UseAddReportDialogParams } from './add-report-dialog.type'

export const useAddReportDialog = (params: UseAddReportDialogParams): AddReportDialogView => {
  const { open, onClose, preselectedDataSourceId } = params
  const navigate = useNavigate()
  const list = useDataSourcesList()
  const addReport = useReportsStore((s) => s.add)

  const [selectedDataSourceId, setSelectedDataSourceId] = useState<DataSourceId | null>(
    preselectedDataSourceId ?? null
  )
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [columnConfig, setColumnConfig] = useState<ColumnConfigMap>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync preselection when dialog opens. Justified useEffect: dialog open is external trigger.
  useEffect(() => {
    if (open && preselectedDataSourceId) {
      setSelectedDataSourceId(preselectedDataSourceId)
    }
  }, [open, preselectedDataSourceId])

  const selectedDataSource = useDataSourceById(selectedDataSourceId ?? undefined)

  const handleDataSourceChange = useCallback((id: DataSourceId) => {
    setSelectedDataSourceId(id)
    setColumnConfig({})
  }, [])

  const handleNameChange = useCallback((v: string) => setName(v), [])
  const handleDescriptionChange = useCallback((v: string) => setDescription(v), [])
  const handleColumnConfigChange = useCallback((next: ColumnConfigMap) => setColumnConfig(next), [])

  const handleSubmit = useCallback(() => {
    if (!isValidReportInput(selectedDataSourceId, name) || selectedDataSourceId === null) return
    setIsSubmitting(true)
    try {
      const report = addReport({
        name: name.trim(),
        description: description.trim(),
        dataSourceId: selectedDataSourceId,
        columnConfig: stripEmptyOverrides(columnConfig),
      })
      // Reset
      setName(''); setDescription(''); setColumnConfig({}); setSelectedDataSourceId(null)
      onClose()
      navigate({ to: '/reports/$reportId', params: { reportId: report.id } })
    } finally {
      setIsSubmitting(false)
    }
  }, [selectedDataSourceId, name, description, columnConfig, addReport, onClose, navigate])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setName(''); setDescription(''); setColumnConfig({}); setSelectedDataSourceId(null)
    onClose()
  }, [isSubmitting, onClose])

  const isEmpty = list.length === 0
  const emptyMessage = 'You have no data sources. Add one from the Data Sources page first.'

  return {
    availableDataSources: list,
    selectedDataSource,
    selectedDataSourceId,
    name,
    description,
    columnConfig,
    isEmpty,
    emptyMessage,
    isSubmitting,
    canSubmit: isValidReportInput(selectedDataSourceId, name) && !isSubmitting,
    handleDataSourceChange,
    handleNameChange,
    handleDescriptionChange,
    handleColumnConfigChange,
    handleSubmit,
    handleClose,
  }
}
```

```tsx
// add-report-dialog.tsx
import type { ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ColumnConfigTable } from './column-config-table'
import { useAddReportDialog } from './add-report-dialog.hook'
import type { AddReportDialogProps } from './add-report-dialog.type'
import type { DataSourceId } from '@/types/data-source.type'

export const AddReportDialog = (props: AddReportDialogProps) => {
  const view = useAddReportDialog(props)

  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && view.handleClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Report</DialogTitle>
          <DialogDescription>Pick a data source, name your report, configure columns, then save.</DialogDescription>
        </DialogHeader>

        {view.isEmpty ? (
          <div className="rounded-lg border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {view.emptyMessage}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Data source</Label>
              <Select
                value={view.selectedDataSourceId ?? ''}
                onValueChange={(v: string) => view.handleDataSourceChange(v as DataSourceId)}
              >
                <SelectTrigger><SelectValue placeholder="Choose a data source…" /></SelectTrigger>
                <SelectContent>
                  {view.availableDataSources.map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-name">Name</Label>
              <Input
                id="report-name"
                value={view.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => view.handleNameChange(e.target.value)}
                placeholder="Sales by Region"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">Description <span className="text-muted-foreground">(optional)</span></Label>
              <Textarea
                id="report-description"
                value={view.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => view.handleDescriptionChange(e.target.value)}
                placeholder="What is this report for?"
                rows={2}
              />
            </div>

            {view.selectedDataSource && (
              <div className="space-y-2">
                <Label>Columns</Label>
                <ColumnConfigTable
                  columns={view.selectedDataSource.columns}
                  value={view.columnConfig}
                  onChange={view.handleColumnConfigChange}
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={view.handleClose} disabled={view.isSubmitting}>Cancel</Button>
          <Button onClick={view.handleSubmit} disabled={!view.canSubmit}>
            {view.isSubmitting ? 'Saving…' : 'Save report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

```ts
// index.ts
export { AddReportDialog } from './add-report-dialog'
export type { AddReportDialogProps } from './add-report-dialog.type'
```

- [ ] **Step 3: Verify typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/-reports-page/add-report-dialog
git commit -m "feat(reports): add-report dialog with column config"
```

---

### Task 3: `report-table/` — list view with search · Last modified · delete-confirm

> **Note for reconciled plan:** the table now has a search bar above it (real-time filter on name + description), shows "Last modified" instead of "Created", and sorts by `updatedAt` DESC. Implementation follows the same module pattern as before — adjust the test + hook + tsx to reflect.

**Files:**
- Create: 4 module files + test

- [ ] **Step 1: Write failing test**

```tsx
// report-table.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReportTable } from './report-table'
import { useReportsStore } from '@/stores/reports.store'
import { useDataSourcesStore } from '@/stores/data-sources.store'
import { asDataSourceId } from '@/lib/ids'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

describe('ReportTable', () => {
  beforeEach(() => {
    useReportsStore.setState({ list: [] })
    useDataSourcesStore.setState({ list: [], mostRecentId: null })
  })

  it('shows empty state', () => {
    render(<ReportTable />)
    expect(screen.getByText(/no reports yet/i)).toBeInTheDocument()
  })

  it('renders rows and triggers delete confirm', async () => {
    const ds = useDataSourcesStore.getState().add({
      name: 'DS', filename: 'd.csv', type: 'csv', sizeBytes: 1, columns: [], rows: [],
    })
    useReportsStore.getState().add({ name: 'R1', description: '', dataSourceId: ds.id, columnConfig: {} })
    render(<ReportTable />)
    expect(screen.getByText('R1')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /delete R1/i }))
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Create the 4 module files**

```ts
// report-table.type.ts
import type { Report, ReportId } from '@/types/report.type'

export type ReportTableProps = {}

export type EnrichedReport = Report & {
  dataSourceName: string
  formattedModifiedAt: string
  truncatedDescription: string
}

export type ReportTableView = {
  enrichedItems: EnrichedReport[]
  isEmpty: boolean
  search: string
  matchCount: number
  totalCount: number
  pendingDeleteId: ReportId | null
  pendingDeleteName: string
  handleSearchChange: (value: string) => void
  handleOpenReport: (id: ReportId) => void
  handleStartDelete: (id: ReportId, name: string) => void
  handleConfirmDelete: () => void
  handleCancelDelete: () => void
}
```

```ts
// report-table.hook.ts
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useReportsStore, useReportsList } from '@/stores/reports.store'
import { useDataSourcesList } from '@/stores/data-sources.store'
import { formatRelativeTime } from '@/lib/utils/format'
import type { ReportId } from '@/types/report.type'
import type { EnrichedReport, ReportTableView } from './report-table.type'

export const useReportTable = (): ReportTableView => {
  const list = useReportsList()
  const dataSources = useDataSourcesList()
  const deleteReport = useReportsStore((s) => s.delete)
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<ReportId | null>(null)
  const [pendingDeleteName, setPendingDeleteName] = useState('')

  const dsNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const d of dataSources) map.set(d.id, d.name)
    return map
  }, [dataSources])

  // Sort by updatedAt DESC then enrich
  const allEnriched = useMemo<EnrichedReport[]>(
    () =>
      [...list]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((r) => ({
          ...r,
          dataSourceName: dsNameById.get(r.dataSourceId) ?? '(deleted)',
          formattedModifiedAt: formatRelativeTime(r.updatedAt),
          truncatedDescription: r.description.length > 80 ? r.description.slice(0, 80) + '…' : r.description,
        })),
    [list, dsNameById]
  )

  // Filter by case-insensitive substring on name OR description
  const enrichedItems = useMemo<EnrichedReport[]>(() => {
    const q = search.trim().toLowerCase()
    if (q === '') return allEnriched
    return allEnriched.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    )
  }, [allEnriched, search])

  const handleSearchChange = useCallback((v: string) => setSearch(v), [])

  const handleOpenReport = useCallback(
    (id: ReportId) => navigate({ to: '/reports/$reportId', params: { reportId: id } }),
    [navigate]
  )

  const handleStartDelete = useCallback((id: ReportId, name: string) => {
    setPendingDeleteId(id); setPendingDeleteName(name)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId) deleteReport(pendingDeleteId)
    setPendingDeleteId(null); setPendingDeleteName('')
  }, [pendingDeleteId, deleteReport])

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteId(null); setPendingDeleteName('')
  }, [])

  return {
    enrichedItems,
    isEmpty: allEnriched.length === 0,
    search,
    matchCount: enrichedItems.length,
    totalCount: allEnriched.length,
    pendingDeleteId,
    pendingDeleteName,
    handleSearchChange,
    handleOpenReport,
    handleStartDelete,
    handleConfirmDelete,
    handleCancelDelete,
  }
}
```

> **`report-table.tsx` should render**: a search input + "N of M" count line above the table; table columns Name · Description · Data source · **Last modified** (uses `formattedModifiedAt`) · Actions. Empty description cell shows `"—"`. Empty-results-from-search shows a small "No matches" line above the table area (the persistent empty state only shows when there are truly zero reports). Hook returns `handleSearchChange` for the search input.

```tsx
// report-table.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Trash2, FileText } from 'lucide-react'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useReportTable } from './report-table.hook'
import type { ReportTableProps } from './report-table.type'

export const ReportTable = (_props: ReportTableProps) => {
  const view = useReportTable()

  if (view.isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <FileText className="mb-4 h-10 w-10" aria-hidden />
        <p className="text-base">No reports yet</p>
        <p className="mt-1 text-sm">Click "+ Add Report" to build your first chart.</p>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Data source</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {view.enrichedItems.map((r) => (
            <TableRow key={r.id} className="cursor-pointer hover:bg-muted/30" onClick={() => view.handleOpenReport(r.id)}>
              <TableCell className="font-medium">{r.name}</TableCell>
              <TableCell className="text-muted-foreground">{r.truncatedDescription || '—'}</TableCell>
              <TableCell>{r.dataSourceName}</TableCell>
              <TableCell className="text-muted-foreground">{r.formattedCreatedAt}</TableCell>
              <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={`Delete ${r.name}`}
                  onClick={() => view.handleStartDelete(r.id, r.name)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={view.pendingDeleteId !== null}
        title={`Delete report '${view.pendingDeleteName}'?`}
        description="This cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={view.handleConfirmDelete}
        onCancel={view.handleCancelDelete}
      />
    </>
  )
}
```

```ts
// index.ts
export { ReportTable } from './report-table'
export type { ReportTableProps } from './report-table.type'
```

- [ ] **Step 3: Run, verify PASS**

```bash
npm test src/routes/-reports-page/report-table
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/-reports-page/report-table
git commit -m "feat(reports): report table with delete confirm"
```

---

### Task 4: `-reports-page/` page module + route file

**Files:**
- Create: 4 module files + route file

- [ ] **Step 1: Create page module**

```ts
// reports-page.type.ts
import type { DataSourceId } from '@/types/data-source.type'

export type ReportsPageProps = {
  preselectedDataSourceId?: DataSourceId
}

export type ReportsPageView = {
  isDialogOpen: boolean
  preselectedDataSourceId?: DataSourceId
  totalCount: number
  handleOpenDialog: () => void
  handleCloseDialog: () => void
}
```

```ts
// reports-page.hook.ts
import { useCallback, useState } from 'react'
import { useReportsList } from '@/stores/reports.store'
import type { ReportsPageView, ReportsPageProps } from './reports-page.type'

export const useReportsPage = (props: ReportsPageProps): ReportsPageView => {
  const list = useReportsList()
  const [isDialogOpen, setIsDialogOpen] = useState(Boolean(props.preselectedDataSourceId))

  const handleOpenDialog = useCallback(() => setIsDialogOpen(true), [])
  const handleCloseDialog = useCallback(() => setIsDialogOpen(false), [])

  return {
    isDialogOpen,
    preselectedDataSourceId: props.preselectedDataSourceId,
    totalCount: list.length,
    handleOpenDialog,
    handleCloseDialog,
  }
}
```

```tsx
// reports-page.tsx
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { ReportTable } from './report-table'
import { AddReportDialog } from './add-report-dialog'
import { useReportsPage } from './reports-page.hook'
import type { ReportsPageProps } from './reports-page.type'

export const ReportsPage = (props: ReportsPageProps) => {
  const view = useReportsPage(props)
  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Reports</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view.totalCount} report{view.totalCount === 1 ? '' : 's'}
          </p>
        </div>
        <Button onClick={view.handleOpenDialog}>
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add Report
        </Button>
      </div>
      <ReportTable />
      <AddReportDialog
        open={view.isDialogOpen}
        onClose={view.handleCloseDialog}
        preselectedDataSourceId={view.preselectedDataSourceId}
      />
    </div>
  )
}
```

```ts
// index.ts
export { ReportsPage } from './reports-page'
```

- [ ] **Step 2: Create the route file with search-param validation**

```tsx
// src/routes/reports/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '../-reports-page'
import type { DataSourceId } from '@/types/data-source.type'

type ReportsSearch = { dataSourceId?: string }

const ReportsRouteComponent = () => {
  const { dataSourceId } = Route.useSearch()
  return <ReportsPage preselectedDataSourceId={dataSourceId as DataSourceId | undefined} />
}

export const Route = createFileRoute('/reports/')({
  validateSearch: (s: Record<string, unknown>): ReportsSearch => ({
    dataSourceId: typeof s.dataSourceId === 'string' ? s.dataSourceId : undefined,
  }),
  component: ReportsRouteComponent,
})
```

- [ ] **Step 3: Restart dev server**

```bash
npm run dev
```

Navigate to `/reports`. Expected: empty state. Click "+ Add Report" → dialog opens. Pick the seeded sample data source → name + description fields appear → column config table renders with all Superstore columns → save → routes to `/reports/$reportId` (will 404 in this phase).

- [ ] **Step 4: Commit**

```bash
git add src/routes/-reports-page src/routes/reports src/routeTree.gen.ts
git commit -m "feat(routes): /reports route with list + add dialog"
```

---

### Task 5: Phase 04 verification

- [ ] **Step 1: Run all tests + checks**

```bash
npm test && npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 2: Manual smoke**
  - `/datasources` → Create Report → `/reports?dataSourceId=...` opens with dialog pre-filled with that data source
  - Fill name + description, edit a few columns, mark one as Ignore, save
  - Land on `/reports/<id>` (404 expected — Phase 05)
  - Navigate back to `/reports`, see the report in the list with its name and data source
  - Click Delete on the report, confirm → row removed
  - Refresh → reports persist across reloads

- [ ] **Step 3: Tag**

```bash
git tag phase-04-complete
```

---

## Phase 04 done

Reports list + Add Report ship. Move to `05-report-detail-and-chart-builder.md`.
