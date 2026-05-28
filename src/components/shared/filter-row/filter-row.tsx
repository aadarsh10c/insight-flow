import { useState, type ChangeEvent } from 'react'
import { Calendar as CalendarIcon, ChevronsUpDown, X } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { TypeBadge } from '@/components/shared/type-badge'
import { cn } from '@/lib/utils/cn'
import { useFilterRow } from './filter-row.hook'
import type {
  DateRangeBounds,
  FilterRowProps,
  FilterableColumn,
} from './filter-row.type'

type ColumnComboboxProps = {
  columns: ReadonlyArray<FilterableColumn>
  selected: string
  selectedLabel: string
  labelOf: (name: string) => string
  onChange: (name: string) => void
}

const ColumnCombobox = ({
  columns,
  selected,
  selectedLabel,
  labelOf,
  onChange,
}: ColumnComboboxProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          title={selected !== '' ? selectedLabel : undefined}
          className="flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-colors hover:bg-muted/30 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:outline-none"
        >
          <span className="flex min-w-0 flex-1 items-center gap-2">
            <span className="truncate">
              {selected !== '' ? selectedLabel : (
                <span className="text-muted-foreground">Column…</span>
              )}
            </span>
            {selected !== '' && (
              <TypeBadge type={columns.find((c) => c.name === selected)?.type ?? 'text'} />
            )}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search columns…" />
          <CommandList>
            <CommandEmpty>No matches</CommandEmpty>
            {columns.map((c) => (
              <CommandItem
                key={c.name}
                value={`${labelOf(c.name)} ${c.name}`}
                onSelect={() => {
                  onChange(c.name)
                  setOpen(false)
                }}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate" title={labelOf(c.name)}>
                    {labelOf(c.name)}
                  </span>
                  <TypeBadge type={c.type} />
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type ValueComboboxProps = {
  options: ReadonlyArray<string>
  selected: string
  onChange: (value: string) => void
}

const ValueCombobox = ({ options, selected, onChange }: ValueComboboxProps) => {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          title={selected !== '' ? selected : undefined}
          className="flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-colors hover:bg-muted/30 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:outline-none"
        >
          <span className="truncate">
            {selected !== '' ? selected : <span className="text-muted-foreground">Value…</span>}
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search…" />
          <CommandList>
            <CommandEmpty>No matches</CommandEmpty>
            {options.map((v) => (
              <CommandItem
                key={v}
                value={v}
                onSelect={() => {
                  onChange(v)
                  setOpen(false)
                }}
              >
                <span className="truncate" title={v}>
                  {v}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

type DateRangePickerProps = {
  fromIso: string
  toIso: string
  bounds: DateRangeBounds
  onChange: (from: string, to: string) => void
}

const safeParseIso = (iso: string): Date | undefined => {
  if (iso === '') return undefined
  const d = parseISO(iso)
  return Number.isNaN(d.getTime()) ? undefined : d
}

const DateRangePicker = ({ fromIso, toIso, bounds, onChange }: DateRangePickerProps) => {
  const [open, setOpen] = useState(false)
  const fromDate = safeParseIso(fromIso)
  const toDate = safeParseIso(toIso)
  const minDate = bounds ? safeParseIso(bounds.min) : undefined
  const maxDate = bounds ? safeParseIso(bounds.max) : undefined

  const label =
    fromDate && toDate
      ? `${format(fromDate, 'MMM d, yyyy')} – ${format(toDate, 'MMM d, yyyy')}`
      : fromDate
        ? `From ${format(fromDate, 'MMM d, yyyy')}`
        : toDate
          ? `Until ${format(toDate, 'MMM d, yyyy')}`
          : 'Pick a date range'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={label}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-xs transition-colors hover:bg-muted/30 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20 focus-visible:outline-none"
        >
          <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className={cn('truncate', !fromDate && !toDate && 'text-muted-foreground')}>
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          captionLayout="dropdown"
          selected={fromDate || toDate ? { from: fromDate, to: toDate } : undefined}
          onSelect={(r) => {
            const f = r?.from ? format(r.from, 'yyyy-MM-dd') : ''
            const t = r?.to ? format(r.to, 'yyyy-MM-dd') : ''
            onChange(f, t)
          }}
          disabled={[
            ...(minDate ? [{ before: minDate }] : []),
            ...(maxDate ? [{ after: maxDate }] : []),
          ]}
          startMonth={minDate}
          endMonth={maxDate}
          numberOfMonths={1}
          defaultMonth={fromDate ?? minDate}
        />
      </PopoverContent>
    </Popover>
  )
}

export const FilterRow = (props: FilterRowProps) => {
  const view = useFilterRow(props)
  const isDateRange = view.valueInputKind === 'date-range'

  const removeButton = (
    <Button
      variant="ghost"
      size="icon"
      onClick={view.handleRemove}
      className="h-8 w-8"
      aria-label="Remove filter"
    >
      <X className="h-3.5 w-3.5" aria-hidden />
    </Button>
  )

  const columnPicker = (
    <ColumnCombobox
      columns={view.availableColumns}
      selected={view.columnName}
      selectedLabel={view.columnLabel}
      labelOf={view.labelOf}
      onChange={view.handleColumnChange}
    />
  )

  if (isDateRange) {
    return (
      <div className="flex flex-col gap-1.5 rounded-md border border-border bg-muted/20 p-1.5">
        <div className="grid grid-cols-[1fr_auto] items-center gap-1.5">
          {columnPicker}
          {removeButton}
        </div>
        <DateRangePicker
          fromIso={view.dateFrom}
          toIso={view.dateTo}
          bounds={view.dateBounds}
          onChange={view.handleDateRangeChange}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-center gap-1.5 rounded-md border border-border bg-muted/20 p-1.5">
      {columnPicker}

      {view.valueInputKind === 'combobox' ? (
        <ValueCombobox
          options={view.comboboxOptions}
          selected={view.comboboxValue}
          onChange={view.handleComboboxChange}
        />
      ) : (
        <Input
          value={view.textValue}
          placeholder={view.inputPlaceholder}
          onChange={(e: ChangeEvent<HTMLInputElement>) => view.handleTextChange(e.target.value)}
          className="h-8"
          disabled={view.selectedColumnType === null}
        />
      )}

      {removeButton}
    </div>
  )
}
