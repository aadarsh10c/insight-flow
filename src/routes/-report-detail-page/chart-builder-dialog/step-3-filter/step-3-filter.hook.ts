import { useCallback, useMemo } from 'react'
import { newId } from '@/lib/ids'
import type { FilterClause } from '@/types/chart.type'
import type { FilterableColumn } from '@/components/shared/filter-row'
import type { Step3FilterProps, Step3View } from './step-3-filter.type'

export const useStep3Filter = (props: Step3FilterProps): Step3View => {
  const { rows, partitioned, columnConfig, value, onChange } = props

  const filterableColumns = useMemo<FilterableColumn[]>(
    () => [
      ...partitioned.category.map((n) => ({ name: n, type: 'category' as const })),
      ...partitioned.text.map((n) => ({ name: n, type: 'text' as const })),
      ...partitioned.numeric.map((n) => ({ name: n, type: 'number' as const })),
      ...partitioned.temporal.map((n) => ({ name: n, type: 'date' as const })),
    ],
    [partitioned]
  )

  const labelFor = useCallback(
    (c: string) => columnConfig[c]?.label ?? c,
    [columnConfig]
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
    filterableColumns,
    rows,
    labelFor,
    handleAdd,
    handleUpdate,
    handleRemove,
  }
}
