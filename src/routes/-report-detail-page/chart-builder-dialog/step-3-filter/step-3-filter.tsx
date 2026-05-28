import { Fragment } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FilterRow } from '@/components/shared/filter-row'
import { useStep3Filter } from './step-3-filter.hook'
import type { Step3FilterProps } from './step-3-filter.type'

export const Step3Filter = (props: Step3FilterProps) => {
  const view = useStep3Filter(props)
  return (
    <div className="space-y-2">
      {view.filters.map((f, i) => (
        <Fragment key={f.id}>
          {i > 0 && (
            <div className="text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              AND
            </div>
          )}
          <FilterRow
            filter={f}
            availableColumns={view.filterableColumns}
            rows={view.rows}
            labelOf={view.labelFor}
            onChange={(next) => view.handleUpdate(f.id, next)}
            onRemove={() => view.handleRemove(f.id)}
          />
        </Fragment>
      ))}
      <Button variant="soft" size="sm" onClick={view.handleAdd} className="border-dashed">
        <Plus className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Add filter
      </Button>
    </div>
  )
}
