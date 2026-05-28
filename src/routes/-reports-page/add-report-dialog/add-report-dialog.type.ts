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
