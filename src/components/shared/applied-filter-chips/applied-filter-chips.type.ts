import type { FilterClause } from '@/types/chart.type'
import type { ColumnConfigMap } from '@/types/report.type'

export type AppliedFilterChipsProps = {
  filters: ReadonlyArray<FilterClause>
  columnConfig: ColumnConfigMap
}
