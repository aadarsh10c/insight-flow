import type { ChangeEvent } from 'react'
import { ChevronDown, ChevronRight, Eye, EyeOff } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { useColumnConfigTable } from './column-config-table.hook'
import type {
  ColumnConfigTableProps,
  EnrichedColumn,
} from './column-config-table.type'
import type { ColumnType } from '@/types/data-source.type'

const TYPE_OPTIONS: ReadonlyArray<{ value: ColumnType; label: string }> = [
  { value: 'number', label: 'Number' },
  { value: 'category', label: 'Category' },
  { value: 'text', label: 'Text' },
  { value: 'date', label: 'Date' },
]

type RowProps = {
  column: EnrichedColumn
  isIgnored: boolean
  onLabel: (name: string, label: string) => void
  onType: (name: string, type: ColumnType) => void
  onIgnore: (name: string) => void
}

const ColumnRow = ({ column, isIgnored, onLabel, onType, onIgnore }: RowProps) => (
  <TableRow className={cn(isIgnored && 'opacity-60')}>
    <TableCell className="align-top">
      <Input
        value={column.effectiveLabel}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onLabel(column.name, e.target.value)}
        aria-label={`Rename ${column.name}`}
        className="h-8 text-xs"
      />
    </TableCell>
    <TableCell className="min-w-[160px] align-top">
      <div className="flex flex-col gap-1">
        <Select
          value={column.effectiveType}
          onValueChange={(v: string) => onType(column.name, v as ColumnType)}
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {column.sampleValue && (
          <span className="pl-2 font-mono text-[10px] text-muted-foreground">
            e.g. {column.sampleValue}
          </span>
        )}
      </div>
    </TableCell>
    <TableCell className="w-px whitespace-nowrap text-right align-top">
      <Button variant="ghost" size="sm" onClick={() => onIgnore(column.name)}>
        {isIgnored ? (
          <>
            <Eye className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Restore
          </>
        ) : (
          <>
            <EyeOff className="mr-1.5 h-3.5 w-3.5" aria-hidden />
            Ignore
          </>
        )}
      </Button>
    </TableCell>
  </TableRow>
)

export const ColumnConfigTable = (props: ColumnConfigTableProps) => {
  const view = useColumnConfigTable(props)
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-7">Name</TableHead>
              <TableHead className="pl-7">Type</TableHead>
              <TableHead className="pr-7 text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {view.active.map((c) => (
              <ColumnRow
                key={c.name}
                column={c}
                isIgnored={false}
                onLabel={view.handleLabelChange}
                onType={view.handleTypeChange}
                onIgnore={view.handleToggleIgnore}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {view.ignored.length > 0 && (
        <div className="rounded-md border border-border bg-muted/30">
          <button
            type="button"
            onClick={view.handleToggleIgnoredSection}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground hover:bg-muted"
          >
            {view.isIgnoredOpen ? (
              <ChevronDown className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            )}
            Ignored columns ({view.ignored.length})
          </button>
          {view.isIgnoredOpen && (
            <Table>
              <TableBody>
                {view.ignored.map((c) => (
                  <ColumnRow
                    key={c.name}
                    column={c}
                    isIgnored
                    onLabel={view.handleLabelChange}
                    onType={view.handleTypeChange}
                    onIgnore={view.handleToggleIgnore}
                  />
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}
