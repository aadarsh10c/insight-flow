import type { ColumnSchema, RowData } from '@/types/data-source.type'
import type { ColumnConfigMap } from '@/types/report.type'
import type { TimeBucket } from '@/types/chart.type'

export type PartitionedColumns = {
  numeric: string[]
  category: string[]
  text: string[]
  temporal: string[]
}

const getEffectiveType = (col: ColumnSchema, overrides: ColumnConfigMap) =>
  overrides[col.name]?.type ?? col.inferredType

const isIgnored = (col: ColumnSchema, overrides: ColumnConfigMap) =>
  overrides[col.name]?.ignored === true

export const partitionColumns = (
  columns: ReadonlyArray<ColumnSchema>,
  overrides: ColumnConfigMap
): PartitionedColumns => {
  const result: PartitionedColumns = { numeric: [], category: [], text: [], temporal: [] }
  for (const c of columns) {
    if (isIgnored(c, overrides)) continue
    const t = getEffectiveType(c, overrides)
    if (t === 'number') result.numeric.push(c.name)
    else if (t === 'category') result.category.push(c.name)
    else if (t === 'text') result.text.push(c.name)
    else if (t === 'date') result.temporal.push(c.name)
  }
  return result
}

export const uniqueValuesOf = (rows: ReadonlyArray<RowData>, column: string): unknown[] => {
  const set = new Set<unknown>()
  for (const r of rows) {
    const v = r[column]
    if (v !== null && v !== undefined && String(v).trim() !== '') set.add(v)
  }
  return Array.from(set).sort((a, b) => String(a).localeCompare(String(b)))
}

const toNumber = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const n = Number(v.replace(/[$,%\s]/g, ''))
    return Number.isNaN(n) ? 0 : n
  }
  return 0
}

export const aggregateForBar = (
  rows: ReadonlyArray<RowData>,
  measureColumn: string,
  groupColumn: string
): Array<[string, number]> => {
  const sums = new Map<string, number>()
  for (const r of rows) {
    const key = String(r[groupColumn] ?? '')
    if (key === '') continue
    sums.set(key, (sums.get(key) ?? 0) + toNumber(r[measureColumn]))
  }
  return Array.from(sums.entries()).sort(([a], [b]) => a.localeCompare(b))
}

export const topNWithOther = (
  pairs: ReadonlyArray<[string, number]>,
  n: number
): Array<[string, number]> => {
  if (pairs.length <= n) return [...pairs]
  const sorted = [...pairs].sort((a, b) => b[1] - a[1])
  const top = sorted.slice(0, n)
  const other = sorted.slice(n).reduce((sum, [, v]) => sum + v, 0)
  return [...top, ['Other', other]]
}

export const bucketKey = (d: Date, bucket: TimeBucket): string => {
  switch (bucket) {
    case 'daily':
      return d.toISOString().slice(0, 10)
    case 'weekly': {
      const jan1 = new Date(d.getFullYear(), 0, 1)
      const week = Math.ceil(
        ((d.getTime() - jan1.getTime()) / 86_400_000 + jan1.getDay() + 1) / 7
      )
      return `${d.getFullYear()}-W${week}`
    }
    case 'monthly':
      return `${d.getFullYear()}-${d.getMonth() + 1}`
    case 'quarterly':
      return `${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3) + 1}`
    case 'yearly':
      return String(d.getFullYear())
  }
}

export const aggregateForLine = (
  rows: ReadonlyArray<RowData>,
  measureColumn: string,
  dateColumn: string,
  bucket: TimeBucket
): Array<[string, number]> => {
  const sums = new Map<string, number>()
  for (const r of rows) {
    const raw = r[dateColumn]
    if (raw == null) continue
    const d = new Date(String(raw))
    if (Number.isNaN(d.getTime())) continue
    const key = bucketKey(d, bucket)
    sums.set(key, (sums.get(key) ?? 0) + toNumber(r[measureColumn]))
  }
  return Array.from(sums.entries()).sort(([a], [b]) => a.localeCompare(b))
}

export const buildSummary = (
  step1: string | null,
  step2: { type: 'bar' | 'pie' | 'line' } | null,
  filters: ReadonlyArray<unknown>,
  style: Record<string, unknown>
): { step1?: string; step2?: string; step3?: string; step4?: string } => {
  const out: { step1?: string; step2?: string; step3?: string; step4?: string } = {}
  if (step1 !== null) out.step1 = step1.charAt(0).toUpperCase() + step1.slice(1) + ' chart'
  if (step2 !== null) out.step2 = step2.type
  if (filters.length > 0) out.step3 = `${filters.length} filter${filters.length === 1 ? '' : 's'}`
  if (Object.keys(style).length > 0) out.step4 = 'Customized'
  return out
}
