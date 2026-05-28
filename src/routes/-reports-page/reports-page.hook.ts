import { useCallback, useState } from 'react'
import { useReportsList } from '@/stores/reports.store'
import type { ReportsPageProps, ReportsPageView } from './reports-page.type'

export const useReportsPage = (props: ReportsPageProps): ReportsPageView => {
  const list = useReportsList()
  // Auto-open the dialog if a data source was preselected (came from /datasources)
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
