import type { ChartStyle } from '@/types/chart.type'

export type Step4StyleProps = {
  value: ChartStyle
  defaultTitle: string
  onChange: (next: ChartStyle) => void
}

export type SwatchGroup = { label: string; colors: ReadonlyArray<string> }

export type Step4View = {
  title: string
  color: string
  legend: boolean
  swatchGroups: ReadonlyArray<SwatchGroup>
  handleTitleChange: (v: string) => void
  handleColorChange: (color: string) => void
  handleLegendToggle: () => void
}
