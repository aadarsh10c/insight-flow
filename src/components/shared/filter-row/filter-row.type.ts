import type { ColumnType, RowData } from '@/types/data-source.type'
import type { FilterClause } from '@/types/chart.type'

export type FilterableColumn = { name: string; type: ColumnType }

export type ValueInputKind = 'dropdown' | 'text'

export type FilterRowProps = {
  filter: FilterClause
  availableColumns: ReadonlyArray<FilterableColumn>
  rows: ReadonlyArray<RowData>
  labelOf: (column: string) => string
  onChange: (next: FilterClause) => void
  onRemove: () => void
}

export type UseFilterRowParams = FilterRowProps

export type FilterRowView = {
  columnName: string
  availableColumns: ReadonlyArray<FilterableColumn>
  labelOf: (column: string) => string
  selectedColumnType: ColumnType | null
  value: string
  valueInputKind: ValueInputKind
  dropdownOptions: ReadonlyArray<string>
  inputPlaceholder: string
  handleColumnChange: (columnName: string) => void
  handleValueChange: (value: string) => void
  handleRemove: () => void
}
