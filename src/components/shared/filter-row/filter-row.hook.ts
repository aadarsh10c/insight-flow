import { useCallback, useMemo } from 'react'
import type {
  DateRangeBounds,
  FilterRowView,
  UseFilterRowParams,
  ValueInputKind,
} from './filter-row.type'

const uniqueValuesAsStrings = (
  rows: ReadonlyArray<Record<string, unknown>>,
  column: string
): string[] => {
  const set = new Set<string>()
  for (const r of rows) {
    const v = r[column]
    if (v !== null && v !== undefined && String(v).trim() !== '') set.add(String(v))
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b))
}

const toIsoDate = (raw: string): string => {
  const t = Date.parse(raw)
  if (Number.isNaN(t)) return ''
  return new Date(t).toISOString().slice(0, 10)
}

const computeDateBounds = (
  rows: ReadonlyArray<Record<string, unknown>>,
  column: string
): DateRangeBounds => {
  let min = ''
  let max = ''
  for (const r of rows) {
    const raw = r[column]
    if (raw === null || raw === undefined) continue
    const iso = toIsoDate(String(raw))
    if (iso === '') continue
    if (min === '' || iso < min) min = iso
    if (max === '' || iso > max) max = iso
  }
  return min === '' ? null : { min, max }
}

export const useFilterRow = (props: UseFilterRowParams): FilterRowView => {
  const { filter, availableColumns, rows, labelOf, onChange, onRemove } = props

  const selectedColumn = useMemo(
    () => availableColumns.find((c) => c.name === filter.column) ?? null,
    [availableColumns, filter.column]
  )

  const valueInputKind: ValueInputKind = useMemo(() => {
    if (selectedColumn === null) return 'text'
    if (selectedColumn.type === 'category') return 'combobox'
    if (selectedColumn.type === 'date') return 'date-range'
    return 'text'
  }, [selectedColumn])

  const comboboxOptions = useMemo(
    () =>
      valueInputKind === 'combobox' && selectedColumn !== null
        ? uniqueValuesAsStrings(rows, selectedColumn.name)
        : [],
    [valueInputKind, selectedColumn, rows]
  )

  const dateBounds = useMemo(
    () =>
      valueInputKind === 'date-range' && selectedColumn !== null
        ? computeDateBounds(rows, selectedColumn.name)
        : null,
    [valueInputKind, selectedColumn, rows]
  )

  const inputPlaceholder =
    selectedColumn?.type === 'text'
      ? 'contains…'
      : selectedColumn?.type === 'number'
        ? 'value'
        : 'value'

  const handleColumnChange = useCallback(
    (columnName: string) => {
      const col = availableColumns.find((c) => c.name === columnName)
      const predicate =
        col?.type === 'text' ? 'contains' : col?.type === 'date' ? 'between' : 'equals'
      onChange({ ...filter, column: columnName, values: [], predicate })
    },
    [availableColumns, filter, onChange]
  )

  const handleTextChange = useCallback(
    (value: string) => onChange({ ...filter, values: [value] }),
    [filter, onChange]
  )

  const handleComboboxChange = useCallback(
    (value: string) => onChange({ ...filter, values: [value] }),
    [filter, onChange]
  )

  const handleDateFromChange = useCallback(
    (value: string) => {
      const to = filter.values[1] !== undefined ? String(filter.values[1]) : ''
      onChange({ ...filter, predicate: 'between', values: [value, to] })
    },
    [filter, onChange]
  )

  const handleDateToChange = useCallback(
    (value: string) => {
      const from = filter.values[0] !== undefined ? String(filter.values[0]) : ''
      onChange({ ...filter, predicate: 'between', values: [from, value] })
    },
    [filter, onChange]
  )

  const handleDateRangeChange = useCallback(
    (from: string, to: string) => {
      onChange({ ...filter, predicate: 'between', values: [from, to] })
    },
    [filter, onChange]
  )

  return {
    columnName: filter.column,
    columnLabel: filter.column !== '' ? labelOf(filter.column) : '',
    availableColumns,
    labelOf,
    selectedColumnType: selectedColumn?.type ?? null,
    valueInputKind,
    textValue: filter.values[0] !== undefined ? String(filter.values[0]) : '',
    comboboxValue: filter.values[0] !== undefined ? String(filter.values[0]) : '',
    dateFrom: filter.values[0] !== undefined ? String(filter.values[0]) : '',
    dateTo: filter.values[1] !== undefined ? String(filter.values[1]) : '',
    dateBounds,
    comboboxOptions,
    inputPlaceholder,
    handleColumnChange,
    handleTextChange,
    handleComboboxChange,
    handleDateFromChange,
    handleDateToChange,
    handleDateRangeChange,
    handleRemove: onRemove,
  }
}
