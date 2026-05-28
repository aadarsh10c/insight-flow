import type { DataSourceId } from '@/types/data-source.type'

export type ReportsPageProps = {
  preselectedDataSourceId?: DataSourceId
}

export type ReportsPageView = {
  isDialogOpen: boolean
  preselectedDataSourceId: DataSourceId | undefined
  totalCount: number
  handleOpenDialog: () => void
  handleCloseDialog: () => void
}
