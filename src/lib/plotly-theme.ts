import type { ResolvedTheme } from '@/types/theme.type'

const TOKENS = {
  light: {
    background: '#fdfbf7',
    surface: '#ffffff',
    foreground: '#1c1917',
    border: '#e7e5e4',
  },
  dark: {
    background: '#1c1917',
    surface: '#292524',
    foreground: '#f5f5f4',
    border: '#44403c',
  },
} as const

const CATEGORICAL: ReadonlyArray<string> = [
  '#c2410c', // orange-700 (matches accent)
  '#0e7490', // cyan-700
  '#15803d', // green-700
  '#6d28d9', // violet-700
  '#a16207', // amber-700
  '#be185d', // pink-700
]

export type PlotlyLayout = {
  paper_bgcolor: string
  plot_bgcolor: string
  font?: { family?: string; color?: string }
  xaxis?: { gridcolor?: string; linecolor?: string }
  yaxis?: { gridcolor?: string; linecolor?: string }
  margin?: { l: number; r: number; t: number; b: number }
  colorway?: ReadonlyArray<string>
}

export const getPlotlyLayout = (mode: ResolvedTheme): PlotlyLayout => {
  const t = TOKENS[mode]
  return {
    paper_bgcolor: t.background,
    plot_bgcolor: t.surface,
    font: { family: 'Inter, ui-sans-serif, system-ui, sans-serif', color: t.foreground },
    xaxis: { gridcolor: t.border, linecolor: t.border },
    yaxis: { gridcolor: t.border, linecolor: t.border },
    margin: { l: 56, r: 24, t: 24, b: 48 },
    colorway: CATEGORICAL,
  }
}

export const getCategoricalPalette = (): ReadonlyArray<string> => CATEGORICAL
