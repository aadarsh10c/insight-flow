import type { TypeBadgeProps } from './type-badge.type'

const LABELS = {
  number: 'NUMBER',
  category: 'CATEGORY',
  text: 'TEXT',
  date: 'DATE',
} as const

export const TypeBadge = ({ type }: TypeBadgeProps) => (
  <span className="rounded-sm bg-muted px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
    {LABELS[type]}
  </span>
)
