import type { ChangeEvent } from 'react'
import { ChevronLeft, Database, Pencil, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useReportById } from '@/stores/reports.store'
import { useDataSourceById } from '@/stores/data-sources.store'
import { ChartBuilderDialog } from './chart-builder-dialog'
import { ChartPreview } from './chart-builder-dialog/chart-preview'
import { useReportDetailPage } from './report-detail-page.hook'
import type { ReportDetailPageProps } from './report-detail-page.type'

export const ReportDetailPage = (props: ReportDetailPageProps) => {
  const view = useReportDetailPage(props)
  const report = useReportById(props.reportId)
  const dataSource = useDataSourceById(report?.dataSourceId)

  if (view.notFound || report === null) {
    return (
      <div className="px-8 py-16 text-center">
        <h1 className="text-title">Report not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">It may have been deleted.</p>
        <Button variant="outline" className="mt-6" onClick={view.handleBackToReports}>
          <ChevronLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Back to Reports
        </Button>
      </div>
    )
  }

  if (view.dataSourceMissing || dataSource === null) {
    return (
      <div className="px-8 py-16 text-center">
        <h1 className="text-title">Data source missing</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The data source for this report is no longer available.
        </p>
        <Button variant="outline" className="mt-6" onClick={view.handleBackToReports}>
          <ChevronLeft className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Back to Reports
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col px-8 py-6">
      <button
        type="button"
        onClick={view.handleBackToReports}
        className="mb-3 inline-flex w-fit items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
        Reports
      </button>

      <header className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-title">{view.reportName}</h1>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={view.handleOpenEditMeta}
              aria-label="Edit report name and description"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden />
            </Button>
          </div>
          {view.reportDescription !== '' ? (
            <p className="text-sm text-muted-foreground">{view.reportDescription}</p>
          ) : (
            <p className="text-sm italic text-muted-foreground/60">No description</p>
          )}
          <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
            <Badge variant="secondary" className="inline-flex items-center gap-1 font-normal">
              <Database className="h-3 w-3" aria-hidden /> {view.dataSourceName}
            </Badge>
            <span>· Last modified {view.formattedLastModified}</span>
          </div>
        </div>

        <Button onClick={view.handleOpenBuilder}>
          {view.hasChart ? (
            <>
              <Pencil className="mr-2 h-4 w-4" aria-hidden /> Edit Widget
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" aria-hidden /> Add Widget
            </>
          )}
        </Button>
      </header>

      <Dialog open={view.isEditMetaOpen} onOpenChange={(o) => !o && view.handleCloseEditMeta()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif">Edit report</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-report-name">Name</Label>
                <Input
                  id="edit-report-name"
                  value={view.nameDraft}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    view.handleNameDraftChange(e.target.value)
                  }
                  placeholder="Sales by Region"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-report-description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="edit-report-description"
                  value={view.descriptionDraft}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                    view.handleDescriptionDraftChange(e.target.value)
                  }
                  placeholder="What is this report for?"
                  rows={3}
                />
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={view.handleCloseEditMeta}>
              Cancel
            </Button>
            <Button onClick={view.handleSaveMeta} disabled={!view.canSaveMeta}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {view.restoredColumnsNote && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-4 py-2 text-sm text-foreground">
          <span className="flex-1">{view.restoredColumnsNote}</span>
          <button
            type="button"
            onClick={view.handleDismissRestoredNote}
            aria-label="Dismiss note"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-hidden">
        {view.hasChart ? (
          <ChartPreview
            dataSource={dataSource}
            columnConfig={report.columnConfig}
            chart={report.chart ?? null}
            onBucketChange={view.handleBucketChange}
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-surface p-8 text-center">
            <div className="space-y-2 text-muted-foreground">
              <p className="text-title text-foreground">No chart yet</p>
              <p className="text-sm">
                Click "Add Widget" to build your first chart for this report.
              </p>
            </div>
          </div>
        )}
      </div>

      <ChartBuilderDialog
        open={view.isBuilderOpen}
        report={report}
        dataSource={dataSource}
        onClose={view.handleCloseBuilder}
      />
    </div>
  )
}
