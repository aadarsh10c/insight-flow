import { useCallback, useMemo } from 'react'
import type { FilterRowView, UseFilterRowParams, ValueInputKind } from './filter-row.type'

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

export const useFilterRow = (props: UseFilterRowParams): FilterRowView => {
  const { filter, availableColumns, rows, labelOf, onChange, onRemove } = props

  const selectedColumn = useMemo(
    () => availableColumns.find((c) => c.name === filter.column) ?? null,
    [availableColumns, filter.column]
  )

  const valueInputKind: ValueInputKind = useMemo(() => {
    if (selectedColumn === null) return 'text'
    return selectedColumn.type === 'category' ? 'dropdown' : 'text'
  }, [selectedColumn])

  const dropdownOptions = useMemo(
    () =>
      valueInputKind === 'dropdown' && selectedColumn !== null
        ? uniqueValuesAsStrings(rows, selectedColumn.name)
        : [],
    [valueInputKind, selectedColumn, rows]
  )

  const inputPlaceholder =
    selectedColumn?.type === 'text'
      ? 'contains…'
      : selectedColumn?.type === 'number'
        ? 'value'
        : selectedColumn?.type === 'date'
          ? 'YYYY-MM-DD'
          : 'value'

  const handleColumnChange = useCallback(
    (columnName: string) => {
      const col = availableColumns.find((c) => c.name === columnName)
      const predicate = col?.type === 'text' ? 'contains' : 'equals'
      onChange({ ...filter, column: columnName, values: [], predicate })
    },
    [availableColumns, filter, onChange]
  )

  const handleValueChange = useCallback(
    (value: string) => {
      onChange({ ...filter, values: [value] })
    },
    [filter, onChange]
  )

  return {
    columnName: filter.column,
    availableColumns,
    labelOf,
    selectedColumnType: selectedColumn?.type ?? null,
    value: filter.values[0] !== undefined ? String(filter.values[0]) : '',
    valueInputKind,
    dropdownOptions,
    inputPlaceholder,
    handleColumnChange,
    handleValueChange,
    handleRemove: onRemove,
  }
}
