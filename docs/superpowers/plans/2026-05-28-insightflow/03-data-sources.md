# Phase 03 — Data Sources

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the `/datasources` route. Users see a list with persistent tick on the most recent, upload new files via a dialog, and click "Create Report" on any row to begin a report flow (which routes to `/reports?dataSourceId=<id>` — Phase 04 picks it up).

**Architecture:** XLSX parser added (dynamic-imported). The `-data-sources-page/` page has two child modules: `data-source-table/` (list view) and `upload-data-source-dialog/` (modal). Page hook reads/writes `data-sources.store`.

**Tech Stack:** SheetJS (xlsx), PapaParse (from Phase 02), shadcn Dialog/Table/Button/Input.

**Reference docs:** Whitepaper §5 (Data Sources), §8 (Upload dialog), §11 (Type detection). Design spec §2, §4, §10.

---

## Pre-conditions

- Phase 02 exit criteria pass
- `git tag phase-02-complete` exists

---

## Exit criteria

- [ ] `/datasources` renders the list, even when empty (empty state visible)
- [ ] "+ Add data source" opens the upload dialog
- [ ] CSV upload parses, infers types, adds to store, closes dialog, shows tick beside new row
- [ ] XLSX upload parses, infers types, adds to store, closes dialog
- [ ] Files over 10 MB or 50,000 rows are rejected with the friendly error
- [ ] Empty files (< 1 row) rejected with friendly error
- [ ] Corrupt files rejected with toast + retry available
- [ ] Persistent tick beside the most-recently-uploaded data source — survives refresh
- [ ] "Create Report" row action navigates to `/reports?dataSourceId=<id>`
- [ ] All Phase 03 tests pass; `typecheck`, `lint`, `build` all green

---

## File structure created in this phase

```
src/
├── lib/
│   └── parsers/
│       └── xlsx.ts                          # + xlsx.test.ts
└── routes/
    ├── datasources.tsx                      # route file (NEW)
    └── -data-sources-page/
        ├── index.ts
        ├── data-sources-page.tsx
        ├── data-sources-page.hook.ts
        ├── data-sources-page.type.ts
        ├── data-source-table/
        │   ├── index.ts
        │   ├── data-source-table.tsx
        │   ├── data-source-table.hook.ts
        │   └── data-source-table.type.ts
        └── upload-data-source-dialog/
            ├── index.ts
            ├── upload-data-source-dialog.tsx
            ├── upload-data-source-dialog.hook.ts
            ├── upload-data-source-dialog.type.ts
            └── upload-data-source-dialog.utils.ts
```

---

## Tasks

### Task 1: `lib/parsers/xlsx.ts` — dynamic-importable XLSX parser

**Files:**
- Modify: `package.json` (add xlsx)
- Create: `src/lib/parsers/xlsx.ts`
- Create: `src/lib/parsers/xlsx.test.ts`

- [ ] **Step 1: Install SheetJS**

```bash
npm install xlsx
```

- [ ] **Step 2: Write failing test**

```ts
// src/lib/parsers/xlsx.test.ts
import { describe, it, expect } from 'vitest'
import { parseXLSX } from './xlsx'
import * as XLSX from 'xlsx'

const makeXlsxBuffer = (rows: Record<string, unknown>[]): ArrayBuffer => {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

describe('parseXLSX', () => {
  it('parses first sheet into rows of objects', async () => {
    const buf = makeXlsxBuffer([{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }])
    const result = await parseXLSX(buf)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ name: 'Alice', age: 30 })
  })

  it('returns empty rows for empty workbook', async () => {
    const buf = makeXlsxBuffer([])
    const result = await parseXLSX(buf)
    expect(result.rows).toEqual([])
  })
})
```

- [ ] **Step 3: Run, verify FAIL**

```bash
npm test src/lib/parsers/xlsx.test.ts
```

- [ ] **Step 4: Implement**

```ts
// src/lib/parsers/xlsx.ts
import type { ParseResult } from './csv'
import type { RowData } from '@/types/data-source.type'

export const parseXLSX = async (buffer: ArrayBuffer): Promise<ParseResult> => {
  const XLSX = await import('xlsx')
  try {
    const wb = XLSX.read(buffer, { type: 'array' })
    const firstSheetName = wb.SheetNames[0]
    if (!firstSheetName) return { rows: [], errors: ['No sheets found'] }
    const ws = wb.Sheets[firstSheetName]
    const rows = XLSX.utils.sheet_to_json<RowData>(ws, { defval: null })
    return { rows, errors: [] }
  } catch (err) {
    return { rows: [], errors: [(err as Error).message] }
  }
}
```

- [ ] **Step 5: Run, verify PASS**

- [ ] **Step 6: Commit**

```bash
git add src/lib/parsers package.json package-lock.json
git commit -m "feat(lib): XLSX parser with dynamic SheetJS import"
```

---

### Task 2: `upload-data-source-dialog/` — utils for limits & filename

**Files:**
- Create: `src/routes/-data-sources-page/upload-data-source-dialog/upload-data-source-dialog.utils.ts`
- Create: `src/routes/-data-sources-page/upload-data-source-dialog/upload-data-source-dialog.utils.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// upload-data-source-dialog.utils.test.ts
import { describe, it, expect } from 'vitest'
import { stripExtension, getFileTypeOrNull, checkSizeLimit, MAX_FILE_SIZE_BYTES, MAX_ROW_COUNT } from './upload-data-source-dialog.utils'

describe('stripExtension', () => {
  it('removes .csv', () => { expect(stripExtension('orders.csv')).toBe('orders') })
  it('removes .xlsx', () => { expect(stripExtension('Q3 Sales.xlsx')).toBe('Q3 Sales') })
  it('leaves files with no extension', () => { expect(stripExtension('readme')).toBe('readme') })
})

describe('getFileTypeOrNull', () => {
  it('returns "csv" for .csv', () => { expect(getFileTypeOrNull('a.csv')).toBe('csv') })
  it('returns "xlsx" for .xlsx', () => { expect(getFileTypeOrNull('a.xlsx')).toBe('xlsx') })
  it('returns null for unsupported', () => { expect(getFileTypeOrNull('a.pdf')).toBeNull() })
})

describe('checkSizeLimit', () => {
  it('returns null when under limits', () => {
    expect(checkSizeLimit(1000, 100)).toBeNull()
  })
  it('returns error when over byte cap', () => {
    expect(checkSizeLimit(MAX_FILE_SIZE_BYTES + 1, 1)).toContain('too large')
  })
  it('returns error when over row cap', () => {
    expect(checkSizeLimit(1, MAX_ROW_COUNT + 1)).toContain('too large')
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Implement**

```ts
// upload-data-source-dialog.utils.ts
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024   // 10 MB
export const MAX_ROW_COUNT = 50_000

export const stripExtension = (filename: string): string => filename.replace(/\.(csv|xlsx)$/i, '')

export const getFileTypeOrNull = (filename: string): 'csv' | 'xlsx' | null => {
  if (/\.csv$/i.test(filename)) return 'csv'
  if (/\.xlsx$/i.test(filename)) return 'xlsx'
  return null
}

export const checkSizeLimit = (sizeBytes: number, rowCount: number): string | null => {
  if (sizeBytes > MAX_FILE_SIZE_BYTES || rowCount > MAX_ROW_COUNT) {
    return 'This file is too large for browser processing. Try a sample of up to 50,000 rows.'
  }
  return null
}
```

- [ ] **Step 4: Run, verify PASS**

- [ ] **Step 5: Commit**

```bash
git add src/routes/-data-sources-page/upload-data-source-dialog
git commit -m "feat(upload-dialog): utils for limits + filename"
```

---

### Task 3: `upload-data-source-dialog/` — full module

**Files:**
- Create: `src/routes/-data-sources-page/upload-data-source-dialog/upload-data-source-dialog.type.ts`
- Create: `src/routes/-data-sources-page/upload-data-source-dialog/upload-data-source-dialog.hook.ts`
- Create: `src/routes/-data-sources-page/upload-data-source-dialog/upload-data-source-dialog.tsx`
- Create: `src/routes/-data-sources-page/upload-data-source-dialog/index.ts`
- Create: `src/routes/-data-sources-page/upload-data-source-dialog/upload-data-source-dialog.hook.test.ts`

- [ ] **Step 1: Write failing hook test**

```ts
// upload-data-source-dialog.hook.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useUploadDataSourceDialog } from './upload-data-source-dialog.hook'
import { useDataSourcesStore } from '@/stores/data-sources.store'

describe('useUploadDataSourceDialog', () => {
  beforeEach(() => useDataSourcesStore.setState({ list: [], mostRecentId: null }))

  it('initializes empty', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useUploadDataSourceDialog({ open: true, onClose }))
    expect(result.current.file).toBeNull()
    expect(result.current.name).toBe('')
    expect(result.current.canSubmit).toBe(false)
  })

  it('pre-fills name when a CSV is picked', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useUploadDataSourceDialog({ open: true, onClose }))
    const file = new File(['col\n1\n2'], 'orders.csv', { type: 'text/csv' })
    act(() => result.current.handleFileChange(file))
    expect(result.current.name).toBe('orders')
  })

  it('rejects unsupported file types', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useUploadDataSourceDialog({ open: true, onClose }))
    const file = new File(['x'], 'a.pdf', { type: 'application/pdf' })
    act(() => result.current.handleFileChange(file))
    expect(result.current.fileError).toContain('CSV or Excel')
  })

  it('handleSubmit creates a data source for valid CSV', async () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useUploadDataSourceDialog({ open: true, onClose }))
    const file = new File(['a,b\n1,2'], 'x.csv', { type: 'text/csv' })
    act(() => result.current.handleFileChange(file))
    await act(async () => { await result.current.handleSubmit() })
    await waitFor(() => expect(useDataSourcesStore.getState().list).toHaveLength(1))
    expect(onClose).toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Create the module files**

```ts
// upload-data-source-dialog.type.ts
export type UploadDataSourceDialogProps = {
  open: boolean
  onClose: () => void
}

export type UseUploadDataSourceDialogParams = UploadDataSourceDialogProps

export type UploadDataSourceDialogView = {
  file: File | null
  name: string
  nameError: string | null
  fileError: string | null
  isSubmitting: boolean
  canSubmit: boolean
  handleFileChange: (file: File | null) => void
  handleNameChange: (value: string) => void
  handleSubmit: () => Promise<void>
  handleClose: () => void
}
```

```ts
// upload-data-source-dialog.hook.ts
import { useCallback, useState } from 'react'
import { useDataSourcesStore } from '@/stores/data-sources.store'
import { useToastStore } from '@/stores/toast.store'
import { detectColumnTypes } from '@/lib/parsers/detect-types'
import {
  checkSizeLimit,
  getFileTypeOrNull,
  stripExtension,
} from './upload-data-source-dialog.utils'
import type {
  UploadDataSourceDialogView,
  UseUploadDataSourceDialogParams,
} from './upload-data-source-dialog.type'

export const useUploadDataSourceDialog = (
  params: UseUploadDataSourceDialogParams
): UploadDataSourceDialogView => {
  const { open, onClose } = params
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addDataSource = useDataSourcesStore((s) => s.add)
  const showToast = useToastStore((s) => s.show)

  const handleFileChange = useCallback((next: File | null) => {
    setFileError(null)
    if (next === null) { setFile(null); setName(''); return }
    const type = getFileTypeOrNull(next.name)
    if (type === null) {
      setFileError('Please upload a CSV or Excel file.')
      setFile(null)
      return
    }
    setFile(next)
    setName(stripExtension(next.name))
  }, [])

  const handleNameChange = useCallback((value: string) => {
    setName(value)
    if (value.trim() === '') setNameError('Name is required')
    else setNameError(null)
  }, [])

  const handleSubmit = useCallback(async () => {
    if (file === null || name.trim() === '') return
    setIsSubmitting(true)
    try {
      const type = getFileTypeOrNull(file.name)
      if (type === null) { setFileError('Unsupported file type'); return }

      // Parse
      const { rows, errors } =
        type === 'csv'
          ? await (async () => {
              const text = await file.text()
              const { parseCSV } = await import('@/lib/parsers/csv')
              return parseCSV(text)
            })()
          : await (async () => {
              const buf = await file.arrayBuffer()
              const { parseXLSX } = await import('@/lib/parsers/xlsx')
              return parseXLSX(buf)
            })()

      if (rows.length === 0) {
        setFileError('This file appears empty.')
        return
      }

      const sizeError = checkSizeLimit(file.size, rows.length)
      if (sizeError) {
        setFileError(sizeError)
        return
      }

      if (errors.length > 0) {
        showToast({
          variant: 'destructive',
          title: 'Parse warnings',
          description: errors.slice(0, 3).join('; '),
        })
      }

      addDataSource({
        name: name.trim(),
        filename: file.name,
        type,
        sizeBytes: file.size,
        columns: detectColumnTypes(rows),
        rows,
      })

      // Reset and close
      setFile(null)
      setName('')
      onClose()
    } catch (err) {
      showToast({
        variant: 'destructive',
        title: 'Could not parse file',
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [file, name, addDataSource, showToast, onClose])

  const handleClose = useCallback(() => {
    if (isSubmitting) return
    setFile(null)
    setName('')
    setFileError(null)
    setNameError(null)
    onClose()
  }, [isSubmitting, onClose])

  return {
    file,
    name,
    nameError,
    fileError,
    isSubmitting,
    canSubmit: file !== null && name.trim() !== '' && !isSubmitting,
    handleFileChange,
    handleNameChange,
    handleSubmit,
    handleClose,
  }
}
```

```tsx
// upload-data-source-dialog.tsx
import type { ChangeEvent } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import { useUploadDataSourceDialog } from './upload-data-source-dialog.hook'
import type { UploadDataSourceDialogProps } from './upload-data-source-dialog.type'

export const UploadDataSourceDialog = (props: UploadDataSourceDialogProps) => {
  const view = useUploadDataSourceDialog(props)

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    view.handleFileChange(e.target.files?.[0] ?? null)
  }
  const handleNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    view.handleNameChange(e.target.value)
  }

  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && view.handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add data source</DialogTitle>
          <DialogDescription>Upload a CSV or Excel file. Limit: 10 MB or 50,000 rows.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" accept=".csv,.xlsx" onChange={handleFileInputChange} />
            {view.fileError && <p className="text-sm text-destructive">{view.fileError}</p>}
            {view.file && (
              <p className="text-xs text-muted-foreground">
                {view.file.name} · {(view.file.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={view.name} onChange={handleNameInputChange} placeholder="My data source" />
            {view.nameError && <p className="text-sm text-destructive">{view.nameError}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={view.handleClose} disabled={view.isSubmitting}>Cancel</Button>
          <Button onClick={view.handleSubmit} disabled={!view.canSubmit}>
            <Upload className="mr-2 h-4 w-4" aria-hidden />
            {view.isSubmitting ? 'Uploading…' : 'Add data source'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

```ts
// index.ts
export { UploadDataSourceDialog } from './upload-data-source-dialog'
export type { UploadDataSourceDialogProps } from './upload-data-source-dialog.type'
```

- [ ] **Step 3: Run hook tests, verify PASS**

```bash
npm test src/routes/-data-sources-page/upload-data-source-dialog
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/-data-sources-page/upload-data-source-dialog
git commit -m "feat(upload-dialog): full module with CSV/XLSX upload"
```

---

### Task 4: `data-source-table/` — list view

**Files:**
- Create: `src/routes/-data-sources-page/data-source-table/data-source-table.type.ts`
- Create: `src/routes/-data-sources-page/data-source-table/data-source-table.hook.ts`
- Create: `src/routes/-data-sources-page/data-source-table/data-source-table.tsx`
- Create: `src/routes/-data-sources-page/data-source-table/index.ts`
- Create: `src/routes/-data-sources-page/data-source-table/data-source-table.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// data-source-table.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataSourceTable } from './data-source-table'
import { useDataSourcesStore } from '@/stores/data-sources.store'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

describe('DataSourceTable', () => {
  beforeEach(() => useDataSourcesStore.setState({ list: [], mostRecentId: null }))

  it('renders empty state when list is empty', () => {
    render(<DataSourceTable />)
    expect(screen.getByText(/no data sources yet/i)).toBeInTheDocument()
  })

  it('renders rows with name, size, type, uploaded; tick beside most recent', () => {
    const ds = useDataSourcesStore.getState().add({
      name: 'Test', filename: 'test.csv', type: 'csv', sizeBytes: 1024, columns: [], rows: [],
    })
    render(<DataSourceTable />)
    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('CSV')).toBeInTheDocument()
    expect(screen.getByLabelText(`Most recent: ${ds.name}`)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Create the 4 module files**

```ts
// data-source-table.type.ts
import type { DataSource, DataSourceId } from '@/types/data-source.type'

export type DataSourceTableProps = {
  // none in V1 — reads from store directly
}

export type EnrichedDataSource = DataSource & {
  formattedSize: string
  formattedUploadedAt: string
  isMostRecent: boolean
  rowCount: number
}

export type UseDataSourceTableParams = DataSourceTableProps

export type DataSourceTableView = {
  enrichedItems: EnrichedDataSource[]
  isEmpty: boolean
  handleCreateReport: (id: DataSourceId) => void
}
```

```ts
// data-source-table.hook.ts
import { useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDataSourcesList, useMostRecentDataSourceId } from '@/stores/data-sources.store'
import { formatBytes, formatRelativeTime } from '@/lib/utils/format'
import type { DataSourceId } from '@/types/data-source.type'
import type { DataSourceTableView, EnrichedDataSource, UseDataSourceTableParams } from './data-source-table.type'

export const useDataSourceTable = (_params?: UseDataSourceTableParams): DataSourceTableView => {
  const list = useDataSourcesList()
  const mostRecentId = useMostRecentDataSourceId()
  const navigate = useNavigate()

  const enrichedItems = useMemo<EnrichedDataSource[]>(
    () =>
      list.map((d) => ({
        ...d,
        formattedSize: formatBytes(d.sizeBytes),
        formattedUploadedAt: formatRelativeTime(d.uploadedAt),
        isMostRecent: d.id === mostRecentId,
        rowCount: d.rows.length,
      })),
    [list, mostRecentId]
  )

  const handleCreateReport = useCallback(
    (id: DataSourceId) => navigate({ to: '/reports', search: { dataSourceId: id } as never }),
    [navigate]
  )

  return { enrichedItems, isEmpty: enrichedItems.length === 0, handleCreateReport }
}
```

```tsx
// data-source-table.tsx
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, FilePlus, Database } from 'lucide-react'
import { useDataSourceTable } from './data-source-table.hook'
import type { DataSourceTableProps } from './data-source-table.type'

export const DataSourceTable = (props: DataSourceTableProps) => {
  const view = useDataSourceTable(props)

  if (view.isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <Database className="mb-4 h-10 w-10" aria-hidden />
        <p className="text-base">No data sources yet</p>
        <p className="mt-1 text-sm">Click "+ Add data source" to upload a file.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Uploaded</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {view.enrichedItems.map((item) => (
          <TableRow key={item.id}>
            <TableCell>
              <div className="flex items-center gap-2 font-medium">
                {item.name}
                {item.isMostRecent && (
                  <span
                    className="inline-grid h-4 w-4 place-items-center rounded-full bg-success text-white"
                    aria-label={`Most recent: ${item.name}`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>{item.formattedSize}</TableCell>
            <TableCell><Badge variant="secondary">{item.type.toUpperCase()}</Badge></TableCell>
            <TableCell className="text-muted-foreground">{item.formattedUploadedAt}</TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm" onClick={() => view.handleCreateReport(item.id)}>
                <FilePlus className="mr-2 h-4 w-4" aria-hidden />
                Create Report
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

```ts
// index.ts
export { DataSourceTable } from './data-source-table'
export type { DataSourceTableProps } from './data-source-table.type'
```

- [ ] **Step 3: Run, verify PASS**

```bash
npm test src/routes/-data-sources-page/data-source-table
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/-data-sources-page/data-source-table
git commit -m "feat(data-sources): table with persistent tick + create-report action"
```

---

### Task 5: `-data-sources-page/` page module

**Files:**
- Create: `src/routes/-data-sources-page/data-sources-page.type.ts`
- Create: `src/routes/-data-sources-page/data-sources-page.hook.ts`
- Create: `src/routes/-data-sources-page/data-sources-page.tsx`
- Create: `src/routes/-data-sources-page/index.ts`

- [ ] **Step 1: Create the 4 module files**

```ts
// data-sources-page.type.ts
export type DataSourcesPageProps = {
  // none
}

export type DataSourcesPageView = {
  isUploadOpen: boolean
  totalCount: number
  totalRows: number
  handleOpenUpload: () => void
  handleCloseUpload: () => void
}
```

```ts
// data-sources-page.hook.ts
import { useCallback, useMemo, useState } from 'react'
import { useDataSourcesList } from '@/stores/data-sources.store'
import type { DataSourcesPageView } from './data-sources-page.type'

export const useDataSourcesPage = (): DataSourcesPageView => {
  const list = useDataSourcesList()
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const totalRows = useMemo(() => list.reduce((sum, d) => sum + d.rows.length, 0), [list])

  const handleOpenUpload = useCallback(() => setIsUploadOpen(true), [])
  const handleCloseUpload = useCallback(() => setIsUploadOpen(false), [])

  return {
    isUploadOpen,
    totalCount: list.length,
    totalRows,
    handleOpenUpload,
    handleCloseUpload,
  }
}
```

```tsx
// data-sources-page.tsx
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { DataSourceTable } from './data-source-table'
import { UploadDataSourceDialog } from './upload-data-source-dialog'
import { useDataSourcesPage } from './data-sources-page.hook'
import type { DataSourcesPageProps } from './data-sources-page.type'

export const DataSourcesPage = (_props: DataSourcesPageProps) => {
  const view = useDataSourcesPage()
  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Data Sources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view.totalCount} file{view.totalCount === 1 ? '' : 's'} · {view.totalRows.toLocaleString()} rows total
          </p>
        </div>
        <Button onClick={view.handleOpenUpload}>
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add data source
        </Button>
      </div>
      <DataSourceTable />
      <UploadDataSourceDialog open={view.isUploadOpen} onClose={view.handleCloseUpload} />
    </div>
  )
}
```

```ts
// index.ts
export { DataSourcesPage } from './data-sources-page'
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/routes/-data-sources-page
git commit -m "feat(data-sources): page module wiring table + upload dialog"
```

---

### Task 6: `routes/datasources.tsx` — route file

**Files:**
- Create: `src/routes/datasources.tsx`

- [ ] **Step 1: Create the route file**

```tsx
// src/routes/datasources.tsx
import { createFileRoute } from '@tanstack/react-router'
import { DataSourcesPage } from './-data-sources-page'

const DataSourcesRouteComponent = () => <DataSourcesPage />

export const Route = createFileRoute('/datasources')({ component: DataSourcesRouteComponent })
```

- [ ] **Step 2: Restart dev server (route tree regenerates)**

```bash
npm run dev
```

Navigate to `http://localhost:5173/datasources`. Expected: page renders with sidebar; empty state visible if no data sources.

- [ ] **Step 3: Upload a CSV manually, verify it appears in the table with tick + Create Report action visible**

- [ ] **Step 4: Refresh — verify the data source persists and tick stays**

- [ ] **Step 5: Commit**

```bash
git add src/routes/datasources.tsx src/routeTree.gen.ts
git commit -m "feat(routes): /datasources route file"
```

---

### Task 7: Phase 03 verification

- [ ] **Step 1: Run all tests + checks**

```bash
npm test && npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 2: Manual smoke**

  - Go to `/` → click "Try with sample data" → lands on `/datasources` with Superstore in list + green tick
  - Click "+ Add data source" → upload a different CSV → tick moves to the new file
  - Refresh page → tick stays beside the most recent
  - Try to upload a 12MB file → see friendly rejection
  - Try to upload a `.pdf` → see rejection
  - Click "Create Report" → navigates to `/reports?dataSourceId=...` (404 expected — Phase 04)

- [ ] **Step 3: Tag**

```bash
git tag phase-03-complete
```

---

## Phase 03 done

Data Sources flow ships. Move to `04-reports-list.md`.
