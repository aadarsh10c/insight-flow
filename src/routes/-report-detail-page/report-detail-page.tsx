import type { ChangeEvent } from 'react'
import { ChevronLeft, Database, Pencil, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
        <h1 className="font-serif text-2xl font-semibold">Report not found</h1>
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
        <h1 className="font-serif text-2xl font-semibold">Data source missing</h1>
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
          <Input
            value={view.reportName}
            onChange={(e: ChangeEvent<HTMLInputElement>) => view.handleNameChange(e.target.value)}
            className="h-auto border-0 bg-transparent p-0 font-serif text-2xl font-semibold !ring-0 focus-visible:border-0 focus-visible:!ring-0"
          />
          <Textarea
            value={view.reportDescription}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              view.handleDescriptionChange(e.target.value)
            }
            placeholder="No description — click to add"
            rows={1}
            className="min-h-[24px] resize-none border-0 bg-transparent p-0 text-sm text-muted-foreground !ring-0 focus-visible:border-0 focus-visible:!ring-0"
          />
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
          />
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-border bg-surface p-8 text-center">
            <div className="space-y-2 text-muted-foreground">
              <p className="font-serif text-lg font-semibold text-foreground">No chart yet</p>
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
