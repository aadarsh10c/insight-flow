import { BarChart3, LineChart, PieChart } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useStep1ChartType } from './step-1-chart-type.hook'
import type { ChartTypeCard, Step1ChartTypeProps } from './step-1-chart-type.type'

const ICONS: Record<ChartTypeCard['type'], LucideIcon> = {
  bar: BarChart3,
  pie: PieChart,
  line: LineChart,
}

export const Step1ChartType = (props: Step1ChartTypeProps) => {
  const view = useStep1ChartType(props)
  return (
    <div className="grid gap-2">
      {view.cards.map((card) => {
        const Icon = ICONS[card.type]
        const isSelected = view.selected === card.type
        return (
          <button
            key={card.type}
            type="button"
            disabled={card.disabled}
            onClick={() => view.handleSelect(card.type)}
            className={cn(
              'flex w-full items-start gap-3 rounded-md border p-3 text-left transition-colors',
              'border-border bg-surface hover:bg-muted',
              'disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-surface',
              isSelected &&
                'border-accent bg-accent/5 hover:bg-accent/10 disabled:opacity-100'
            )}
          >
            <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-accent" aria-hidden />
            <div className="flex-1">
              <div className="text-sm font-medium">{card.title}</div>
              <div className="text-xs text-muted-foreground">{card.description}</div>
              {card.disabledHint && (
                <div className="mt-1.5 text-[11px] italic text-muted-foreground/70">
                  {card.disabledHint}
                </div>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
