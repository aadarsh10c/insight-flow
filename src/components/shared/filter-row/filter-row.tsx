import type { ChangeEvent } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TypeBadge } from '@/components/shared/type-badge'
import { useFilterRow } from './filter-row.hook'
import type { FilterRowProps } from './filter-row.type'

export const FilterRow = (props: FilterRowProps) => {
  const view = useFilterRow(props)
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5 rounded-md border border-border bg-muted/20 p-1.5">
      <Select value={view.columnName} onValueChange={view.handleColumnChange}>
        <SelectTrigger className="h-8">
          <SelectValue placeholder="Column…" />
        </SelectTrigger>
        <SelectContent>
          {view.availableColumns.map((c) => (
            <SelectItem key={c.name} value={c.name}>
              <span className="flex items-center gap-2">
                {view.labelOf(c.name)}
                <TypeBadge type={c.type} />
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {view.valueInputKind === 'dropdown' ? (
        <Select value={view.value} onValueChange={view.handleValueChange}>
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Value…" />
          </SelectTrigger>
          <SelectContent>
            {view.dropdownOptions.map((v) => (
              <SelectItem key={v} value={v}>
                {v}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          value={view.value}
          placeholder={view.inputPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>) => view.handleValueChange(e.target.value)}
          className="h-8"
          disabled={view.selectedColumnType === null}
        />
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={view.handleRemove}
        className="h-8 w-8"
        aria-label="Remove filter"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </Button>
    </div>
  )
}
