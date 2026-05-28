import type { ColumnSchema, ColumnType, RowData } from '@/types/data-source.type'
import type { ColumnConfigMap, ColumnOverride } from '@/types/report.type'

export type ColumnConfigTableProps = {
  columns: ReadonlyArray<ColumnSchema>
  rows: ReadonlyArray<RowData>
  value: ColumnConfigMap
  onChange: (next: ColumnConfigMap) => void
}

export type EnrichedColumn = {
  name: string
  effectiveType: ColumnType
  effectiveLabel: string
  sampleValue: string
  override: ColumnOverride
}

export type UseColumnConfigTableParams = ColumnConfigTableProps

export type ColumnConfigTableView = {
  active: ReadonlyArray<EnrichedColumn>
  ignored: ReadonlyArray<EnrichedColumn>
  isIgnoredOpen: boolean
  handleLabelChange: (column: string, label: string) => void
  handleTypeChange: (column: string, type: ColumnType) => void
  handleToggleIgnore: (column: string) => void
  handleToggleIgnoredSection: () => void
}
