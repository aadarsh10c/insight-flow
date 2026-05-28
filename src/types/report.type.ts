import type { ColumnType, DataSourceId } from './data-source.type'
import type { ChartConfig } from './chart.type'

export type ReportId = string & { readonly __brand: 'ReportId' }

export type ColumnOverride = {
  label?: string
  type?: ColumnType
  ignored?: boolean
}

export type ColumnConfigMap = Record<string, ColumnOverride>

export type Report = {
  id: ReportId
  name: string
  description: string
  dataSourceId: DataSourceId
  columnConfig: ColumnConfigMap
  chart?: ChartConfig
  createdAt: number
  updatedAt: number
}
