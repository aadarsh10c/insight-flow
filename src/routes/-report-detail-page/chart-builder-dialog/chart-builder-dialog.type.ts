import type { DataSource } from '@/types/data-source.type'
import type { Report } from '@/types/report.type'

export type ChartBuilderDialogProps = {
  open: boolean
  report: Report
  dataSource: DataSource
  onClose: () => void
}
