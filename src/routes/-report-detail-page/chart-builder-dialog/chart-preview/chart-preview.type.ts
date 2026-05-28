import type { DataSource } from '@/types/data-source.type'
import type { ChartConfig, TimeBucket } from '@/types/chart.type'
import type { ColumnConfigMap } from '@/types/report.type'

export type ChartPreviewProps = {
  dataSource: DataSource
  columnConfig: ColumnConfigMap
  chart: ChartConfig | null
  onBucketChange?: (bucket: TimeBucket) => void
}

export type PeriodDropdownView = {
  value: TimeBucket
  onChange: (value: TimeBucket) => void
  options: ReadonlyArray<{ value: TimeBucket; label: string; valid: boolean }>
}

export type ChartPreviewView = {
  isReady: boolean
  emptyMessage: string | null
  title: string
  filters: ChartConfig['filters']
  columnConfig: ColumnConfigMap
  plotData: unknown[]
  plotLayout: Record<string, unknown>
  periodDropdown: PeriodDropdownView | null
}
