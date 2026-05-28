import { useCallback, useMemo } from 'react'
import { pickDefaultBucket } from '@/lib/time-buckets'
import { uniqueValuesOf } from '../chart-builder-dialog.utils'
import type { Step2DataProps, Step2View } from './step-2-data.type'

const PIE_MAX_UNIQUE = 20

export const useStep2Data = (props: Step2DataProps): Step2View => {
  const { chartType, partitioned, columnConfig, rows, value, onChange } = props

  const labelFor = useCallback(
    (c: string) => columnConfig[c]?.label ?? c,
    [columnConfig]
  )

  const pieEligibleGroups = useMemo(() => {
    if (chartType !== 'pie') return []
    return partitioned.category.filter((c) => uniqueValuesOf(rows, c).length <= PIE_MAX_UNIQUE)
  }, [chartType, partitioned.category, rows])

  const groupOrSplitColumns =
    chartType === 'pie' ? pieEligibleGroups : partitioned.category

  const splitColumnNote = useMemo<string | null>(() => {
    if (chartType !== 'pie' || value === null || value.type !== 'pie') return null
    const count = uniqueValuesOf(rows, value.splitColumn).length
    if (count > 6 && count <= 20)
      return `Top 6 values shown, rest grouped as Other (${count} unique values)`
    return null
  }, [chartType, value, rows])

  const selectedMeasure =
    value !== null && 'measureColumn' in value ? value.measureColumn : ''
  const selectedGroup =
    value?.type === 'bar' ? value.groupColumn : value?.type === 'pie' ? value.splitColumn : ''
  const selectedDate = value?.type === 'line' ? value.dateColumn : ''

  const handleMeasureChange = useCallback(
    (measure: string) => {
      if (chartType === 'bar') {
        onChange({ type: 'bar', measureColumn: measure, groupColumn: selectedGroup })
      } else if (chartType === 'pie') {
        onChange({ type: 'pie', measureColumn: measure, splitColumn: selectedGroup })
      } else {
        const dateValues = rows
          .map((r) => String(r[selectedDate] ?? ''))
          .filter((s) => s !== '')
        const bucket =
          value?.type === 'line' ? value.bucket : (pickDefaultBucket(dateValues) ?? 'monthly')
        onChange({
          type: 'line',
          measureColumn: measure,
          dateColumn: selectedDate,
          bucket,
        })
      }
    },
    [chartType, selectedGroup, selectedDate, rows, value, onChange]
  )

  const handleGroupChange = useCallback(
    (group: string) => {
      if (chartType === 'bar') {
        onChange({ type: 'bar', measureColumn: selectedMeasure, groupColumn: group })
      } else if (chartType === 'pie') {
        onChange({ type: 'pie', measureColumn: selectedMeasure, splitColumn: group })
      }
    },
    [chartType, selectedMeasure, onChange]
  )

  const handleDateChange = useCallback(
    (date: string) => {
      if (chartType !== 'line') return
      const newDateValues = rows
        .map((r) => String(r[date] ?? ''))
        .filter((s) => s !== '')
      const bucket = pickDefaultBucket(newDateValues) ?? 'monthly'
      onChange({
        type: 'line',
        measureColumn: selectedMeasure,
        dateColumn: date,
        bucket,
      })
    },
    [chartType, rows, selectedMeasure, onChange]
  )

  return {
    chartType,
    measureColumns: partitioned.numeric,
    groupOrSplitColumns,
    splitColumnNote,
    temporalColumns: partitioned.temporal,
    selectedMeasure,
    selectedGroup,
    selectedDate,
    labelFor,
    handleMeasureChange,
    handleGroupChange,
    handleDateChange,
  }
}
