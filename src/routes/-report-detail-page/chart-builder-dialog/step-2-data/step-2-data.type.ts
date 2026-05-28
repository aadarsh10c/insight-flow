import type {
  BarConfig,
  ChartType,
  LineConfig,
  PieConfig,
} from '@/types/chart.type'
import type { RowData } from '@/types/data-source.type'
import type { ColumnConfigMap } from '@/types/report.type'
import type { PartitionedColumns } from '../chart-builder-dialog.utils'

export type Step2DataProps = {
  chartType: ChartType
  partitioned: PartitionedColumns
  columnConfig: ColumnConfigMap
  rows: ReadonlyArray<RowData>
  value: BarConfig | PieConfig | LineConfig | null
  onChange: (next: BarConfig | PieConfig | LineConfig) => void
}

export type Step2View = {
  chartType: ChartType
  measureColumns: ReadonlyArray<string>
  groupOrSplitColumns: ReadonlyArray<string>
  splitColumnNote: string | null
  temporalColumns: ReadonlyArray<string>
  selectedMeasure: string
  selectedGroup: string
  selectedDate: string
  labelFor: (column: string) => string
  handleMeasureChange: (v: string) => void
  handleGroupChange: (v: string) => void
  handleDateChange: (v: string) => void
}
