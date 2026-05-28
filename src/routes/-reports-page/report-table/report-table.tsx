import type { ChangeEvent, MouseEvent } from 'react'
import { FileText, Search, Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { useReportTable } from './report-table.hook'
import type { ReportTableProps } from './report-table.type'

export const ReportTable = (_props: ReportTableProps) => {
  const view = useReportTable()

  if (view.isListEmpty) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center text-muted-foreground">
        <FileText className="mb-4 h-12 w-12 text-accent opacity-40" aria-hidden />
        <p className="text-title text-foreground">No reports yet</p>
        <p className="mt-1 text-sm">Click "+ Add Report" to build your first chart.</p>
      </div>
    )
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search
            className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={view.search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => view.handleSearchChange(e.target.value)}
            placeholder="Search reports by name or description…"
            className="pl-8"
            aria-label="Search reports"
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {view.matchCount} of {view.totalCount}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Data source</TableHead>
              <TableHead>Last modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.isSearchEmpty ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No matches for &ldquo;{view.search}&rdquo;
                </TableCell>
              </TableRow>
            ) : (
              view.enrichedItems.map((r) => (
                <TableRow
                  key={r.id}
                  className="cursor-pointer hover:bg-muted/30"
                  onClick={() => view.handleOpenReport(r.id)}
                >
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {r.truncatedDescription || '—'}
                  </TableCell>
                  <TableCell>{r.dataSourceName}</TableCell>
                  <TableCell className="text-muted-foreground">{r.formattedModifiedAt}</TableCell>
                  <TableCell
                    className="w-px whitespace-nowrap text-right"
                    onClick={(e: MouseEvent<HTMLTableCellElement>) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${r.name}`}
                      onClick={() => view.handleStartDelete(r.id, r.name)}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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
