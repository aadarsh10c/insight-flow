import { useCallback } from 'react'
import type { Step4StyleProps, Step4View, SwatchGroup } from './step-4-style.type'

const SWATCHES: ReadonlyArray<SwatchGroup> = [
  { label: 'Warm', colors: ['#c2410c', '#a16207', '#b91c1c', '#be185d'] },
  { label: 'Cool', colors: ['#0e7490', '#1d4ed8', '#6d28d9', '#0f766e'] },
  { label: 'Neutral / earthy', colors: ['#15803d', '#4d7c0f', '#44403c', '#334155'] },
]

const DEFAULT_COLOR = '#c2410c'

export const useStep4Style = (props: Step4StyleProps): Step4View => {
  const { value, chartType, defaultTitle, defaultLegendName, onChange } = props

  const handleTitleChange = useCallback(
    (title: string) => onChange({ ...value, title }),
    [value, onChange]
  )
  const handleLegendNameChange = useCallback(
    (legendName: string) => onChange({ ...value, legendName }),
    [value, onChange]
  )
  const handleColorChange = useCallback(
    (color: string) => onChange({ ...value, color }),
    [value, onChange]
  )
  const handleLegendToggle = useCallback(
    () => onChange({ ...value, legend: !(value.legend ?? true) }),
    [value, onChange]
  )

  return {
    title: value.title ?? defaultTitle,
    legendName: value.legendName ?? '',
    legendNamePlaceholder: defaultLegendName,
    showLegendName: chartType === 'line',
    color: value.color ?? DEFAULT_COLOR,
    legend: value.legend ?? true,
    swatchGroups: SWATCHES,
    handleTitleChange,
    handleLegendNameChange,
    handleColorChange,
    handleLegendToggle,
  }
}
