import { useCallback, useMemo } from 'react'
import { newId } from '@/lib/ids'
import type { FilterClause } from '@/types/chart.type'
import type { FilterableColumn } from '@/components/shared/filter-row'
import type { Step3FilterProps, Step3View } from './step-3-filter.type'

export const useStep3Filter = (props: Step3FilterProps): Step3View => {
  const { rows, partitioned, columnConfig, chartColumns, value, onChange } = props

  const filterableColumns = useMemo<FilterableColumn[]>(() => {
    const usedByChart = new Set(chartColumns)
    return [
      ...partitioned.category.map((n) => ({ name: n, type: 'category' as const })),
      ...partitioned.text.map((n) => ({ name: n, type: 'text' as const })),
      ...partitioned.numeric.map((n) => ({ name: n, type: 'number' as const })),
      ...partitioned.temporal.map((n) => ({ name: n, type: 'date' as const })),
    ].filter((c) => !usedByChart.has(c.name))
  }, [partitioned, chartColumns])

  const labelFor = useCallback(
    (c: string) => columnConfig[c]?.label ?? c,
    [columnConfig]
  )

  const availableColumnsFor = useCallback(
    (filterId: string) => {
      const takenByOthers = new Set(
        value.filter((f) => f.id !== filterId && f.column !== '').map((f) => f.column)
      )
      return filterableColumns.filter((c) => !takenByOthers.has(c.name))
    },
    [filterableColumns, value]
  )

  const handleAdd = useCallback(() => {
    onChange([
      ...value,
      { id: newId(), column: '', predicate: 'equals', values: [] },
    ])
  }, [value, onChange])

  const handleUpdate = useCallback(
    (id: string, next: FilterClause) => {
      onChange(value.map((f) => (f.id === id ? next : f)))
    },
    [value, onChange]
  )

  const handleRemove = useCallback(
    (id: string) => onChange(value.filter((f) => f.id !== id)),
    [value, onChange]
  )

  return {
    filters: value,
    availableColumnsFor,
    rows,
    labelFor,
    handleAdd,
    handleUpdate,
    handleRemove,
  }
}
