import type { ColumnType, RowData } from '@/types/data-source.type'
import type { FilterClause } from '@/types/chart.type'

export type FilterableColumn = { name: string; type: ColumnType }

export type ValueInputKind = 'combobox' | 'text' | 'date-range'

export type FilterRowProps = {
  filter: FilterClause
  availableColumns: ReadonlyArray<FilterableColumn>
  rows: ReadonlyArray<RowData>
  labelOf: (column: string) => string
  onChange: (next: FilterClause) => void
  onRemove: () => void
}

export type UseFilterRowParams = FilterRowProps

export type DateRangeBounds = { min: string; max: string } | null

export type FilterRowView = {
  columnName: string
  columnLabel: string
  availableColumns: ReadonlyArray<FilterableColumn>
  labelOf: (column: string) => string
  selectedColumnType: ColumnType | null
  valueInputKind: ValueInputKind
  textValue: string
  comboboxValue: string
  dateFrom: string
  dateTo: string
  dateBounds: DateRangeBounds
  comboboxOptions: ReadonlyArray<string>
  inputPlaceholder: string
  handleColumnChange: (columnName: string) => void
  handleTextChange: (value: string) => void
  handleComboboxChange: (value: string) => void
  handleDateFromChange: (value: string) => void
  handleDateToChange: (value: string) => void
  handleDateRangeChange: (from: string, to: string) => void
  handleRemove: () => void
}
