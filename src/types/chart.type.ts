export type ChartType = 'bar' | 'pie' | 'line'

export type TimeBucket = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'

export type FilterPredicate = 'equals' | 'contains'

export type FilterClause = {
  id: string
  column: string
  predicate: FilterPredicate
  values: unknown[]
}

export type ChartStyle = {
  title?: string
  color?: string
  legend?: boolean
  xAxisLabel?: string
  yAxisLabel?: string
}

export type BarConfig = {
  type: 'bar'
  measureColumn: string
  groupColumn: string
}

export type PieConfig = {
  type: 'pie'
  measureColumn: string
  splitColumn: string
}

export type LineConfig = {
  type: 'line'
  measureColumn: string
  dateColumn: string
  bucket: TimeBucket
}

export type ChartConfig = {
  config: BarConfig | PieConfig | LineConfig
  filters: FilterClause[]
  style: ChartStyle
}
