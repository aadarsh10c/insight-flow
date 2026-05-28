import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
