import { useCallback, useMemo, useState } from 'react'
import type { ColumnType } from '@/types/data-source.type'
import type { ColumnOverride } from '@/types/report.type'
import type {
  ColumnConfigTableView,
  EnrichedColumn,
  UseColumnConfigTableParams,
} from './column-config-table.type'
import { findFirstSample, truncateSample } from './column-config-table.utils'

export const useColumnConfigTable = (
  params: UseColumnConfigTableParams
): ColumnConfigTableView => {
  const { columns, rows, value, onChange } = params
  const [isIgnoredOpen, setIgnoredOpen] = useState(false)

  const enriched = useMemo<EnrichedColumn[]>(
    () =>
      columns.map((c) => {
        const override = value[c.name] ?? {}
        return {
          name: c.name,
          effectiveType: override.type ?? c.inferredType,
          effectiveLabel: override.label ?? c.name,
          sampleValue: truncateSample(findFirstSample(rows, c.name)),
          override,
        }
      }),
    [columns, rows, value]
  )

  const active = useMemo(() => enriched.filter((c) => !c.override.ignored), [enriched])
  const ignored = useMemo(() => enriched.filter((c) => c.override.ignored === true), [enriched])

  const patch = useCallback(
    (column: string, p: ColumnOverride) => {
      const current = value[column] ?? {}
      onChange({ ...value, [column]: { ...current, ...p } })
    },
    [value, onChange]
  )

  const handleLabelChange = useCallback(
    (column: string, label: string) => patch(column, { label }),
    [patch]
  )
  const handleTypeChange = useCallback(
    (column: string, type: ColumnType) => patch(column, { type }),
    [patch]
  )
  const handleToggleIgnore = useCallback(
    (column: string) => {
      const current = value[column] ?? {}
      patch(column, { ignored: !current.ignored })
    },
    [value, patch]
  )
  const handleToggleIgnoredSection = useCallback(() => setIgnoredOpen((o) => !o), [])

  return {
    active,
    ignored,
    isIgnoredOpen,
    handleLabelChange,
    handleTypeChange,
    handleToggleIgnore,
    handleToggleIgnoredSection,
  }
}
