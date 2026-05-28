import { useCallback, useMemo } from 'react'
import type { ChartType } from '@/types/chart.type'
import type {
  ChartTypeCard,
  Step1View,
  UseStep1Params,
} from './step-1-chart-type.type'

export const useStep1ChartType = (params: UseStep1Params): Step1View => {
  const { value, partitioned, hasPieEligibleColumn, onChange } = params

  const cards = useMemo<ChartTypeCard[]>(() => {
    const noNumeric = partitioned.numeric.length === 0
    const noCategory = partitioned.category.length === 0
    const noDate = partitioned.temporal.length === 0

    const barDisabled = noNumeric || noCategory
    const pieDisabled = noNumeric || !hasPieEligibleColumn
    const lineDisabled = noNumeric || noDate

    return [
      {
        type: 'bar' as const,
        title: 'Bar chart',
        description: 'Compare values across categories',
        disabled: barDisabled,
        disabledHint: barDisabled
          ? 'Needs at least one Number column and one Category column'
          : null,
      },
      {
        type: 'pie' as const,
        title: 'Pie chart',
        description: 'See how a total is split',
        disabled: pieDisabled,
        disabledHint: pieDisabled
          ? noNumeric
            ? 'Needs a Number column'
            : 'Needs a Category column with 20 or fewer unique values'
          : null,
      },
      {
        type: 'line' as const,
        title: 'Line chart',
        description: 'See how a value changes over time',
        disabled: lineDisabled,
        disabledHint: lineDisabled
          ? 'No Date column found — go back to edit column types to enable this'
          : null,
      },
    ]
  }, [partitioned, hasPieEligibleColumn])

  const handleSelect = useCallback((type: ChartType) => onChange(type), [onChange])

  return { cards, selected: value, handleSelect }
}
