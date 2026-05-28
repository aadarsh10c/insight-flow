import type { ChartStyle, ChartType } from '@/types/chart.type'

export type Step4StyleProps = {
  value: ChartStyle
  chartType: ChartType | null
  defaultTitle: string
  defaultLegendName: string
  onChange: (next: ChartStyle) => void
}

export type SwatchGroup = { label: string; colors: ReadonlyArray<string> }

export type Step4View = {
  title: string
  legendName: string
  legendNamePlaceholder: string
  showLegendName: boolean
  color: string
  legend: boolean
  swatchGroups: ReadonlyArray<SwatchGroup>
  handleTitleChange: (v: string) => void
  handleLegendNameChange: (v: string) => void
  handleColorChange: (color: string) => void
  handleLegendToggle: () => void
}
