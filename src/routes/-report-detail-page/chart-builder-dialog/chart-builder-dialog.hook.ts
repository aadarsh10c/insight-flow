import { useCallback, useMemo, useReducer, useRef, useState } from 'react'
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

export const useChartBuilderDialog = (props: ChartBuilderDialogProps) => {
  const { open, report, dataSource, onClose } = props
  const [state, dispatch] = useReducer(reducer, undefined, initialState)
  const [loadedKey, setLoadedKey] = useState<string>('')
  const setChart = useReportsStore((s) => s.setChart)
  const showToast = useToastStore((s) => s.show)

  // Sync on (re-)open: hydrate from existing chart, or reset to initial.
  // Compute-during-render (no useEffect, no cascading renders).
  const syncKey = `${open ? '1' : '0'}|${report.id}|${report.chart ? 'with' : 'none'}`
  if (open && syncKey !== loadedKey) {
    if (report.chart) {
      dispatch({ type: 'LOAD_FROM_CHART_CONFIG', value: report.chart })
    } else {
      // Reset to initialState by dispatching RESET_ALL and discarding snapshot
      dispatch({ type: 'RESET_ALL' })
      dispatch({ type: 'RESTORE_FROM_SNAPSHOT' })
      // ^ no-op if no prior snapshot; ensures a fresh tree state
      dispatch({ type: 'RESET_ALL' })
    }
    setLoadedKey(syncKey)
  }

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

  const handleBucketChange = useCallback((bucket: TimeBucket) => {
    // The current step 2 value is a LineConfig — update its bucket directly without
    // dropping back to 'reset' state by dispatching SET_DATA again with same fields + new bucket.
    // Read current state via getter pattern in dispatch by passing a thunk... simpler: dispatch SET_DATA.
    // We need the current data to copy; use a re-entrant lookup via dispatchedClosure pattern.
    // Workaround: use a local ref-style read via lastDispatched is overkill — call dispatch with
    // a new SET_DATA based on assumption we're in a line state. The reducer accepts the new value.
    // Caller (ChartPreview) only passes a bucket when current is a line, so this is safe.
    dispatch({
      type: 'SET_DATA',
      value: (() => {
        const cur = stateRef.current.steps[2].value
        if (cur === null || cur.type !== 'line')
          return { type: 'line', measureColumn: '', dateColumn: '', bucket }
        return { ...cur, bucket }
      })(),
    })
  }, [])

  // Mutable ref to current state for handlers that need to read latest without re-creating
  const stateRef = useStateRef(state)

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
    handleChartTypeChange,
    handleDataChange,
    handleFilterChange,
    handleStyleChange,
    handleGoToStep,
    handleBucketChange,
    handleResetAll,
    handleSave,
    handleClose: onClose,
  }
}

// Tiny ref-state helper — keeps a mutable .current that stays in sync with state.
// Used so callbacks reading latest state don't have to depend on it and re-create.
const useStateRef = <T>(value: T) => {
  const ref = useRef(value)
  ref.current = value
  return ref
}
