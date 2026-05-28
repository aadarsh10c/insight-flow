import { describe, it, expect } from 'vitest'
import { initialState, reducer } from './chart-builder-reducer'

describe('chart-builder-reducer', () => {
  it('initialState: step 1 active, others locked, canSave false', () => {
    const s = initialState()
    expect(s.steps[1].status).toBe('active')
    expect(s.steps[2].status).toBe('locked')
    expect(s.steps[3].status).toBe('locked')
    expect(s.steps[4].status).toBe('locked')
    expect(s.canSave).toBe(false)
  })

  it('SET_CHART_TYPE: step 1 complete, step 2 active', () => {
    const s = reducer(initialState(), { type: 'SET_CHART_TYPE', value: 'bar' })
    expect(s.steps[1].status).toBe('complete')
    expect(s.steps[1].value).toBe('bar')
    expect(s.steps[2].status).toBe('active')
    expect(s.canSave).toBe(false)
  })

  it('canSave true once step 2 complete (bar w/ measure + group)', () => {
    let s = initialState()
    s = reducer(s, { type: 'SET_CHART_TYPE', value: 'bar' })
    s = reducer(s, {
      type: 'SET_DATA',
      value: { type: 'bar', measureColumn: 'sales', groupColumn: 'region' },
    })
    expect(s.steps[2].status).toBe('complete')
    expect(s.canSave).toBe(true)
  })

  it('changing chart type resets steps 2, 3, 4 to reset state when they had values', () => {
    let s = initialState()
    s = reducer(s, { type: 'SET_CHART_TYPE', value: 'bar' })
    s = reducer(s, {
      type: 'SET_DATA',
      value: { type: 'bar', measureColumn: 'sales', groupColumn: 'region' },
    })
    s = reducer(s, {
      type: 'SET_FILTER',
      value: [{ id: 'f1', column: 'region', predicate: 'equals', values: ['West'] }],
    })
    s = reducer(s, { type: 'SET_STYLE', value: { title: 'X' } })
    s = reducer(s, { type: 'SET_CHART_TYPE', value: 'pie' })
    expect(s.steps[2].value).toBeNull()
    expect(s.steps[3].status).toBe('reset')
    expect(s.steps[4].status).toBe('reset')
    expect(s.canSave).toBe(false)
  })

  it('changing data resets steps 3 and 4 only, not step 1', () => {
    let s = initialState()
    s = reducer(s, { type: 'SET_CHART_TYPE', value: 'bar' })
    s = reducer(s, {
      type: 'SET_DATA',
      value: { type: 'bar', measureColumn: 'sales', groupColumn: 'region' },
    })
    s = reducer(s, { type: 'SET_STYLE', value: { color: '#c2410c' } })
    s = reducer(s, {
      type: 'SET_DATA',
      value: { type: 'bar', measureColumn: 'profit', groupColumn: 'region' },
    })
    expect(s.steps[1].status).toBe('complete')
    expect(s.steps[4].status).toBe('reset')
  })

  it('changing filter does NOT reset style', () => {
    let s = initialState()
    s = reducer(s, { type: 'SET_CHART_TYPE', value: 'bar' })
    s = reducer(s, {
      type: 'SET_DATA',
      value: { type: 'bar', measureColumn: 'sales', groupColumn: 'region' },
    })
    s = reducer(s, { type: 'SET_STYLE', value: { color: '#c2410c' } })
    s = reducer(s, {
      type: 'SET_FILTER',
      value: [{ id: 'f1', column: 'region', predicate: 'equals', values: ['West'] }],
    })
    expect(s.steps[4].value).toEqual({ color: '#c2410c' })
  })

  it('RESET_ALL captures snapshot of previous state', () => {
    let s = initialState()
    s = reducer(s, { type: 'SET_CHART_TYPE', value: 'bar' })
    const before = s
    s = reducer(s, { type: 'RESET_ALL' })
    expect(s.steps[1].status).toBe('active')
    expect(s.steps[1].value).toBeNull()
    expect(s.snapshot).toEqual({ ...before, snapshot: undefined })
  })

  it('RESTORE_FROM_SNAPSHOT replays previous state', () => {
    let s = initialState()
    s = reducer(s, { type: 'SET_CHART_TYPE', value: 'pie' })
    s = reducer(s, { type: 'RESET_ALL' })
    s = reducer(s, { type: 'RESTORE_FROM_SNAPSHOT' })
    expect(s.steps[1].value).toBe('pie')
    expect(s.snapshot).toBeUndefined()
  })

  it('LOAD_FROM_CHART_CONFIG hydrates a complete state', () => {
    const s = reducer(initialState(), {
      type: 'LOAD_FROM_CHART_CONFIG',
      value: {
        config: { type: 'bar', measureColumn: 'sales', groupColumn: 'region' },
        filters: [],
        style: { title: 'Sales' },
      },
    })
    expect(s.steps[1].value).toBe('bar')
    expect(s.steps[2].status).toBe('complete')
    expect(s.steps[4].value).toEqual({ title: 'Sales' })
    expect(s.canSave).toBe(true)
  })
})
