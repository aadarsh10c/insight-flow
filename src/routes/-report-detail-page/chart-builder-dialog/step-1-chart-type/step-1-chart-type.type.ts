import type { ChartType } from '@/types/chart.type'
import type { PartitionedColumns } from '../chart-builder-dialog.utils'

export type Step1ChartTypeProps = {
  value: ChartType | null
  partitioned: PartitionedColumns
  hasPieEligibleColumn: boolean
  onChange: (type: ChartType) => void
}

export type ChartTypeCard = {
  type: ChartType
  title: string
  description: string
  disabled: boolean
  disabledHint: string | null
}

export type UseStep1Params = Step1ChartTypeProps

export type Step1View = {
  cards: ReadonlyArray<ChartTypeCard>
  selected: ChartType | null
  handleSelect: (type: ChartType) => void
}
