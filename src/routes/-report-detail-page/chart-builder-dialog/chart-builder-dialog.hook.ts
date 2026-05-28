import { useCallback, useMemo, useReducer, useState } from 'react'
import { useReportsStore } from '@/stores/reports.store'
import { useToastStore } from '@/stores/toast.store'
import { initialState, reducer } from './chart-builder-reducer'
import { buildSummary, partitionColumns, uniqueValuesOf } from './chart-builder-dialog.utils'
import type {
  BarConfig,
  ChartConfig,
  ChartStyle,
  ChartType,
  FilterClause,
  LineConfig,
  PieConfig,
  TimeBucket,
} from '@/types/chart.type'
import type { ChartBuilderDialogProps } from './chart-builder-dialog.type'

const buildDefaultTitle = (
  config: BarConfig | PieConfig | LineConfig | null,
  labelFor: (c: string) => string
): string => {
  if (config === null) return 'Untitled chart'
  if (config.type === 'bar')
    return `Sum of ${labelFor(config.measureColumn)} by ${labelFor(config.groupColumn)}`
  if (config.type === 'pie')
    return `${labelFor(config.measureColumn)} by ${labelFor(config.splitColumn)}`
  return `${labelFor(config.measureColumn)} over time`
}

const collectChartColumns = (chart: NonNullable<ChartConfig>): Set<string> => {
  const set = new Set<string>()
  const c = chart.config
  if (c.type === 'bar') {
    set.add(c.measureColumn)
    set.add(c.groupColumn)
  } else if (c.type === 'pie') {
    set.add(c.measureColumn)
    set.add(c.splitColumn)
  } else {
    set.add(c.measureColumn)
    set.add(c.dateColumn)
  }
  return set
}

export const useChartBuilderDialog = (props: ChartBuilderDialogProps) => {
  const { open, report, dataSource, onClose } = props
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [loadedKey, setLoadedKey] = useState<string>('')
  const [restoredNote, setRestoredNote] = useState<string | null>(null)
  const setChart = useReportsStore((s) => s.setChart)
  const updateReport = useReportsStore((s) => s.update)
  const showToast = useToastStore((s) => s.show)

  // Sync on (re-)open: hydrate from existing chart + auto-restore any ignored columns.
  // Compute-during-render is safe because we update state only when key changes.
  const syncKey = `${open ? '1' : '0'}|${report.id}|${report.chart ? 'with' : 'none'}`
  if (open && syncKey !== loadedKey) {
    if (report.chart) {
      // Auto-restore any ignored columns referenced by the chart
      const used = collectChartColumns(report.chart)
      const restored: string[] = []
      const newConfig = { ...report.columnConfig }
      for (const col of used) {
        if (newConfig[col]?.ignored === true) {
          newConfig[col] = { ...newConfig[col], ignored: false }
          restored.push(col)
        }
      }
      if (restored.length > 0) {
        updateReport(report.id, { columnConfig: newConfig })
        setRestoredNote(
          `Column${restored.length > 1 ? 's' : ''} '${restored.join("', '")}' ${restored.length > 1 ? 'were' : 'was'} restored because this chart needs ${restored.length > 1 ? 'them' : 'it'}.`
        )
      } else {
        setRestoredNote(null)
      }
      dispatch({ type: 'LOAD_FROM_CHART_CONFIG', value: report.chart })
    } else {
      setRestoredNote(null)
      dispatch({ type: 'RESET_ALL' })
      dispatch({ type: 'RESTORE_FROM_SNAPSHOT' })
      dispatch({ type: 'RESET_ALL' })
    }
    setLoadedKey(syncKey)
  }

  const handleDismissRestoredNote = useCallback(() => setRestoredNote(null), [])

  const partitioned = useMemo(
    () => partitionColumns(dataSource.columns, report.columnConfig),
    [dataSource.columns, report.columnConfig]
  )

  const hasPieEligibleColumn = useMemo(
    () => partitioned.category.some((c) => uniqueValuesOf(dataSource.rows, c).length <= 20),
    [partitioned.category, dataSource.rows]
  )

  const labelFor = useCallback(
    (c: string) => report.columnConfig[c]?.label ?? c,
    [report.columnConfig]
  )

  const handleChartTypeChange = useCallback(
    (value: ChartType) => dispatch({ type: 'SET_CHART_TYPE', value }),
    []
  )
  const handleDataChange = useCallback(
    (value: BarConfig | PieConfig | LineConfig) => dispatch({ type: 'SET_DATA', value }),
    []
  )
  const handleFilterChange = useCallback(
    (value: FilterClause[]) => dispatch({ type: 'SET_FILTER', value }),
    []
  )
  const handleStyleChange = useCallback(
    (value: ChartStyle) => dispatch({ type: 'SET_STYLE', value }),
    []
  )
  const handleGoToStep = useCallback(
    (value: 1 | 2 | 3 | 4) => dispatch({ type: 'GO_TO_STEP', value }),
    []
  )

  const handleResetAll = useCallback(() => {
    dispatch({ type: 'RESET_ALL' })
    showToast({
      variant: 'default',
      title: 'Reset',
      description: 'All steps cleared.',
      durationMs: 5000,
      action: {
        label: 'Undo',
        handler: () => dispatch({ type: 'RESTORE_FROM_SNAPSHOT' }),
      },
    })
  }, [showToast])

  const handleBucketChange = useCallback(
    (bucket: TimeBucket) => {
      const cur = state.steps[2].value
      const next =
        cur !== null && cur.type === 'line'
          ? { ...cur, bucket }
          : { type: 'line' as const, measureColumn: '', dateColumn: '', bucket }
      dispatch({ type: 'SET_DATA', value: next })
    },
    [state.steps]
  )

  const handleSave = useCallback(() => {
    if (!state.canSave || state.steps[2].value === null) return
    const chart: ChartConfig = {
      config: state.steps[2].value,
      filters: state.steps[3].value,
      style: state.steps[4].value,
    }
    setChart(report.id, chart)
    onClose()
  }, [state, report.id, setChart, onClose])

  const previewChart: ChartConfig | null = useMemo(() => {
    if (state.steps[2].value === null) return null
    return {
      config: state.steps[2].value,
      filters: state.steps[3].value,
      style: state.steps[4].value,
    }
  }, [state.steps])

  const summaries = useMemo(
    () =>
      buildSummary(
        state.steps[1].value,
        state.steps[2].value ? { type: state.steps[2].value.type } : null,
        state.steps[3].value,
        state.steps[4].value
      ),
    [state.steps]
  )

  // Build summary line for Step 2 specifically
  const step2Summary = useMemo(() => {
    const c = state.steps[2].value
    if (c === null) return undefined
    if (c.type === 'bar')
      return `${labelFor(c.measureColumn)} grouped by ${labelFor(c.groupColumn)}`
    if (c.type === 'pie')
      return `${labelFor(c.measureColumn)} split by ${labelFor(c.splitColumn)}`
    return `${labelFor(c.measureColumn)} over ${labelFor(c.dateColumn)} (${c.bucket})`
  }, [state.steps, labelFor])

  return {
    state,
    partitioned,
    hasPieEligibleColumn,
    defaultTitle: buildDefaultTitle(state.steps[2].value, labelFor),
    previewChart,
    summaries: { ...summaries, step2: step2Summary ?? summaries.step2 },
    labelFor,
    restoredNote,
    handleChartTypeChange,
    handleDataChange,
    handleFilterChange,
    handleStyleChange,
    handleGoToStep,
    handleBucketChange,
    handleResetAll,
    handleDismissRestoredNote,
    handleSave,
    handleClose: onClose,
  }
}

