import type { ChangeEvent } from 'react'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { useStep4Style } from './step-4-style.hook'
import type { Step4StyleProps } from './step-4-style.type'

export const Step4Style = (props: Step4StyleProps) => {
  const view = useStep4Style(props)
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs" htmlFor="chart-title">
          Chart title
        </Label>
        <Input
          id="chart-title"
          value={view.title}
          onChange={(e: ChangeEvent<HTMLInputElement>) => view.handleTitleChange(e.target.value)}
        />
      </div>

      {view.showLegendName && (
        <div className="space-y-1.5">
          <Label className="text-xs" htmlFor="legend-name">
            Legend name
          </Label>
          <Input
            id="legend-name"
            value={view.legendName}
            placeholder={view.legendNamePlaceholder}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              view.handleLegendNameChange(e.target.value)
            }
          />
        </div>
      )}

      <div className="space-y-2">
        <Label className="text-xs">Color</Label>
        {view.swatchGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <p className="text-[10px] text-muted-foreground">{group.label}</p>
            <div className="grid grid-cols-4 gap-1.5">
              {group.colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => view.handleColorChange(c)}
                  style={{ backgroundColor: c }}
                  className={cn(
                    'relative aspect-[2/1] rounded-md ring-offset-2 ring-offset-surface transition-transform',
                    'hover:scale-105',
                    view.color === c && 'ring-2 ring-accent'
                  )}
                  aria-label={`Color ${c}`}
                >
                  {view.color === c && (
                    <Check className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={view.handleLegendToggle}>
        {view.legend ? 'Hide legend' : 'Show legend'}
      </Button>
    </div>
  )
}
