import Plot from 'react-plotly.js'
import { BarChart3 } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AppliedFilterChips } from '@/components/shared/applied-filter-chips'
import { useChartPreview } from './chart-preview.hook'
import type { ChartPreviewProps } from './chart-preview.type'
import type { TimeBucket } from '@/types/chart.type'

export const ChartPreview = (props: ChartPreviewProps) => {
  const view = useChartPreview(props)
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-surface p-4">
      <header className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-serif text-base font-semibold">{view.title || ' '}</div>
          <AppliedFilterChips filters={view.filters} columnConfig={view.columnConfig} />
        </div>
        {view.periodDropdown && (
          <Select
            value={view.periodDropdown.value}
            onValueChange={(v: string) => view.periodDropdown!.onChange(v as TimeBucket)}
          >
            <SelectTrigger className="h-8 w-fit min-w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {view.periodDropdown.options.map((o) => (
                <SelectItem key={o.value} value={o.value} disabled={!o.valid}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </header>

      {view.isReady ? (
        <div className="flex-1 overflow-hidden">
          <Plot
            data={view.plotData as never}
            layout={view.plotLayout as never}
            config={{ displayModeBar: false, responsive: true }}
            style={{ width: '100%', height: '100%' }}
            useResizeHandler
          />
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
          <BarChart3 className="h-12 w-12 text-accent opacity-30" aria-hidden />
          <div className="text-sm">{view.emptyMessage}</div>
        </div>
      )}
    </div>
  )
}
