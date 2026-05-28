import type { FilterClause } from '@/types/chart.type'
import type { RowData } from '@/types/data-source.type'
import type { ColumnConfigMap } from '@/types/report.type'
import type { PartitionedColumns } from '../chart-builder-dialog.utils'
import type { FilterableColumn } from '@/components/shared/filter-row'

export type Step3FilterProps = {
  rows: ReadonlyArray<RowData>
  partitioned: PartitionedColumns
  columnConfig: ColumnConfigMap
  value: FilterClause[]
  onChange: (next: FilterClause[]) => void
}

export type Step3View = {
  filters: ReadonlyArray<FilterClause>
  filterableColumns: ReadonlyArray<FilterableColumn>
  rows: ReadonlyArray<RowData>
  labelFor: (column: string) => string
  handleAdd: () => void
  handleUpdate: (id: string, next: FilterClause) => void
  handleRemove: (id: string) => void
}
