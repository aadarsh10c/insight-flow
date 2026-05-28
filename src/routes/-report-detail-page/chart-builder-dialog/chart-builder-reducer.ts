import type {
  BarConfig,
  ChartConfig,
  ChartStyle,
  ChartType,
  FilterClause,
  LineConfig,
  PieConfig,
} from '@/types/chart.type'

export type StepStatus = 'locked' | 'active' | 'complete' | 'reset'

export type Step1Value = ChartType | null
export type Step2Value = BarConfig | PieConfig | LineConfig | null
export type Step3Value = FilterClause[]
export type Step4Value = ChartStyle

export type StepperState = {
  currentStep: 1 | 2 | 3 | 4
  steps: {
    1: { status: StepStatus; value: Step1Value }
    2: { status: StepStatus; value: Step2Value }
    3: { status: StepStatus; value: Step3Value }
    4: { status: StepStatus; value: Step4Value }
  }
  canSave: boolean
  snapshot?: StepperState
}

export type ReducerAction =
  | { type: 'SET_CHART_TYPE'; value: ChartType }
  | { type: 'SET_DATA'; value: NonNullable<Step2Value> }
  | { type: 'SET_FILTER'; value: Step3Value }
  | { type: 'SET_STYLE'; value: Step4Value }
  | { type: 'GO_TO_STEP'; value: 1 | 2 | 3 | 4 }
  | { type: 'RESET_ALL' }
  | { type: 'RESTORE_FROM_SNAPSHOT' }
  | { type: 'LOAD_FROM_CHART_CONFIG'; value: ChartConfig }

export const initialState = (): StepperState => ({
  currentStep: 1,
  steps: {
    1: { status: 'active', value: null },
    2: { status: 'locked', value: null },
    3: { status: 'locked', value: [] },
    4: { status: 'locked', value: {} },
  },
  canSave: false,
})

const computeCanSave = (s: StepperState): boolean => s.steps[2].status === 'complete'

const hadAnyValue = <T>(value: T, isEmpty: (v: T) => boolean): boolean => !isEmpty(value)

export const reducer = (state: StepperState, action: ReducerAction): StepperState => {
  switch (action.type) {
    case 'SET_CHART_TYPE': {
      const step3HadValue = hadAnyValue(state.steps[3].value, (v) => v.length === 0)
      const step4HadValue = hadAnyValue(state.steps[4].value, (v) => Object.keys(v).length === 0)
      const next: StepperState = {
        ...state,
        currentStep: 2,
        steps: {
          1: { status: 'complete', value: action.value },
          2: { status: 'active', value: null },
          3: { status: step3HadValue ? 'reset' : 'locked', value: [] },
          4: { status: step4HadValue ? 'reset' : 'locked', value: {} },
        },
      }
      return { ...next, canSave: computeCanSave(next) }
    }
    case 'SET_DATA': {
      const step3HadValue = state.steps[3].value.length > 0
      const step4HadValue = Object.keys(state.steps[4].value).length > 0
      const next: StepperState = {
        ...state,
        currentStep: 3,
        steps: {
          ...state.steps,
          2: { status: 'complete', value: action.value },
          3: step3HadValue
            ? { status: 'reset', value: [] }
            : { status: 'active', value: [] },
          4: step4HadValue
            ? { status: 'reset', value: {} }
            : { status: 'locked', value: {} },
        },
      }
      return { ...next, canSave: computeCanSave(next) }
    }
    case 'SET_FILTER': {
      const next: StepperState = {
        ...state,
        currentStep: 4,
        steps: {
          ...state.steps,
          3: { status: 'complete', value: action.value },
          4: state.steps[4].status === 'locked'
            ? { status: 'active', value: {} }
            : state.steps[4],
        },
      }
      return { ...next, canSave: computeCanSave(next) }
    }
    case 'SET_STYLE':
      return {
        ...state,
        steps: {
          ...state.steps,
          4: { status: 'complete', value: action.value },
        },
        canSave: computeCanSave(state),
      }
    case 'GO_TO_STEP':
      return { ...state, currentStep: action.value }
    case 'RESET_ALL':
      return { ...initialState(), snapshot: { ...state, snapshot: undefined } }
    case 'RESTORE_FROM_SNAPSHOT':
      return state.snapshot ? { ...state.snapshot, snapshot: undefined } : state
    case 'LOAD_FROM_CHART_CONFIG': {
      const { config, filters, style } = action.value
      const s: StepperState = {
        currentStep: 4,
        steps: {
          1: { status: 'complete', value: config.type },
          2: { status: 'complete', value: config },
          3: {
            status: filters.length > 0 ? 'complete' : 'active',
            value: filters as FilterClause[],
          },
          4: {
            status: Object.keys(style).length > 0 ? 'complete' : 'active',
            value: style,
          },
        },
        canSave: true,
      }
      return s
    }
    default:
      return state
  }
}
