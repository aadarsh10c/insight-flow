import { useCallback, useMemo } from 'react'
import { useThemeStore } from '@/stores/theme.store'
import { getPlotlyLayout } from '@/lib/plotly-theme'
import { getValidBuckets } from '@/lib/time-buckets'
import type { TimeBucket, FilterClause } from '@/types/chart.type'
import {
  aggregateForBar,
  aggregateForLine,
  topNWithOther,
} from '../chart-builder-dialog.utils'
import type {
  ChartPreviewProps,
  ChartPreviewView,
  PeriodDropdownView,
} from './chart-preview.type'

const BUCKET_LABELS: Record<TimeBucket, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  yearly: 'Yearly',
}
const ALL_BUCKETS: TimeBucket[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']

const toIsoDate = (raw: string): string => {
  const t = Date.parse(raw)
  if (Number.isNaN(t)) return ''
  return new Date(t).toISOString().slice(0, 10)
}

const applyFilters = (
  rows: ReadonlyArray<Record<string, unknown>>,
  filters: ReadonlyArray<FilterClause>
): Array<Record<string, unknown>> => {
  if (filters.length === 0) return [...rows]
  return rows.filter((r) =>
    filters.every((f) => {
      if (f.values.length === 0) return true
      const cellValue = r[f.column]
      if (f.predicate === 'contains') {
        return String(cellValue ?? '').toLowerCase().includes(String(f.values[0]).toLowerCase())
      }
      if (f.predicate === 'between') {
        const cellIso = toIsoDate(String(cellValue ?? ''))
        if (cellIso === '') return false
        const from = f.values[0] === undefined || f.values[0] === null ? '' : String(f.values[0])
        const to = f.values[1] === undefined || f.values[1] === null ? '' : String(f.values[1])
        if (from !== '' && cellIso < from) return false
        if (to !== '' && cellIso > to) return false
        return true
      }
      return String(cellValue) === String(f.values[0])
    })
  )
}

export const useChartPreview = (props: ChartPreviewProps): ChartPreviewView => {
  const { dataSource, columnConfig, chart, onBucketChange } = props
  const resolved = useThemeStore((s) => s.resolved)

  const labelOf = useCallback(
    (c: string) => columnConfig[c]?.label ?? c,
    [columnConfig]
  )

  return useMemo<ChartPreviewView>(() => {
    const baseLayout = getPlotlyLayout(resolved) as Record<string, unknown>

    if (chart === null) {
      return {
        isReady: false,
        emptyMessage: 'Make selections to see your chart',
        title: '',
        filters: [],
        columnConfig,
        plotData: [],
        plotLayout: baseLayout,
        periodDropdown: null,
      }
    }

    const { config, filters, style } = chart
    const filteredRows = applyFilters(dataSource.rows, filters)
    const color = style.color ?? '#c2410c'

    const layout: Record<string, unknown> = {
      ...baseLayout,
      showlegend: style.legend ?? true,
    }

    let plotData: unknown[]
    let title = style.title ?? ''
    let periodDropdown: PeriodDropdownView | null = null
    const traceName =
      style.legendName !== undefined && style.legendName.trim() !== ''
        ? style.legendName
        : labelOf(config.measureColumn)

    if (config.type === 'bar') {
      const agg = aggregateForBar(filteredRows, config.measureColumn, config.groupColumn)
      plotData = [
        {
          type: 'bar',
          name: traceName,
          x: agg.map((p) => p[0]),
          y: agg.map((p) => p[1]),
          marker: { color },
        },
      ]
      if (title === '') {
        title = `Sum of ${labelOf(config.measureColumn)} by ${labelOf(config.groupColumn)}`
      }
    } else if (config.type === 'pie') {
      const agg = aggregateForBar(filteredRows, config.measureColumn, config.splitColumn)
      const grouped = topNWithOther(agg, 6)
      plotData = [
        {
          type: 'pie',
          name: traceName,
          labels: grouped.map((p) => p[0]),
          values: grouped.map((p) => p[1]),
        },
      ]
      if (title === '') {
        title = `${labelOf(config.measureColumn)} by ${labelOf(config.splitColumn)}`
      }
    } else {
      // line
      const agg = aggregateForLine(
        filteredRows,
        config.measureColumn,
        config.dateColumn,
        config.bucket
      )
      plotData = [
        {
          type: 'scatter',
          mode: 'lines+markers',
          name: traceName,
          x: agg.map((p) => p[0]),
          y: agg.map((p) => p[1]),
          line: { color },
          marker: { color },
        },
      ]
      if (title === '') {
        title = `${labelOf(config.measureColumn)} over time`
      }

      if (onBucketChange) {
        const dateValues = filteredRows
          .map((r) => String(r[config.dateColumn] ?? ''))
          .filter((s) => s !== '')
        const validBuckets = getValidBuckets(dateValues)
        const validSet = new Set(validBuckets)
        periodDropdown = {
          value: config.bucket,
          onChange: onBucketChange,
          options: ALL_BUCKETS.map((b) => ({
            value: b,
            label: BUCKET_LABELS[b],
            valid: validSet.has(b),
          })),
        }
      }
    }

    return {
      isReady: true,
      emptyMessage: null,
      title,
      filters,
      columnConfig,
      plotData,
      plotLayout: layout,
      periodDropdown,
    }
  }, [chart, dataSource.rows, columnConfig, labelOf, resolved, onBucketChange])
}
