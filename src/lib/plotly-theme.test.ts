import { describe, it, expect } from 'vitest'
import { getPlotlyLayout, getCategoricalPalette } from './plotly-theme'

describe('getPlotlyLayout', () => {
  it('returns light-mode colors when mode is light', () => {
    const layout = getPlotlyLayout('light')
    expect(layout.paper_bgcolor).toBe('#fdfbf7')
    expect(layout.plot_bgcolor).toBe('#ffffff')
    expect(layout.font?.color).toBe('#1c1917')
  })

  it('returns dark-mode colors when mode is dark', () => {
    const layout = getPlotlyLayout('dark')
    expect(layout.paper_bgcolor).toBe('#1c1917')
    expect(layout.plot_bgcolor).toBe('#292524')
    expect(layout.font?.color).toBe('#f5f5f4')
  })

  it('includes the categorical palette as colorway', () => {
    const layout = getPlotlyLayout('light')
    expect(layout.colorway).toEqual(getCategoricalPalette())
  })

  it('sets margin and font family', () => {
    const layout = getPlotlyLayout('light')
    expect(layout.margin).toEqual({ l: 56, r: 24, t: 24, b: 48 })
    expect(layout.font?.family).toContain('Inter')
  })
})

describe('getCategoricalPalette', () => {
  it('returns 6 distinct hex colors', () => {
    const p = getCategoricalPalette()
    expect(p).toHaveLength(6)
    expect(new Set(p).size).toBe(6)
  })

  it('starts with the accent orange (#c2410c)', () => {
    expect(getCategoricalPalette()[0]).toBe('#c2410c')
  })
})
