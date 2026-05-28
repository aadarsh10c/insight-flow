import { Filter } from 'lucide-react'
import type { FilterClause } from '@/types/chart.type'
import type { AppliedFilterChipsProps } from './applied-filter-chips.type'

const labelOf = (col: string, cfg: AppliedFilterChipsProps['columnConfig']) =>
  cfg[col]?.label ?? col

const formatValue = (f: FilterClause): string => {
  if (f.predicate === 'between') {
    const from = f.values[0] === undefined || f.values[0] === null ? '…' : String(f.values[0])
    const to = f.values[1] === undefined || f.values[1] === null ? '…' : String(f.values[1])
    return `${from} → ${to}`
  }
  const v = f.values[0]
  if (v === undefined || v === null) return ''
  return f.predicate === 'contains' ? `"${String(v)}"` : String(v)
}

const formatPredicate = (f: FilterClause): string => {
  if (f.predicate === 'contains') return 'contains'
  if (f.predicate === 'between') return 'in'
  return '='
}

export const AppliedFilterChips = ({ filters, columnConfig }: AppliedFilterChipsProps) => {
  if (filters.length === 0) return null
  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <Filter className="h-3 w-3" aria-hidden />
        Filtered:
      </span>
      {filters.map((f) => (
        <span
          key={f.id}
          className="rounded-sm bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
        >
          {labelOf(f.column, columnConfig)} {formatPredicate(f)} {formatValue(f)}
        </span>
      ))}
    </div>
  )
}
