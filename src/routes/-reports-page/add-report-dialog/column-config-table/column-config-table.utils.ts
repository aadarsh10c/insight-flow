import type { RowData } from '@/types/data-source.type'

export const findFirstSample = (rows: ReadonlyArray<RowData>, column: string): string => {
  for (const r of rows) {
    const v = r[column]
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      return String(v)
    }
  }
  return ''
}

export const truncateSample = (value: string, max = 24): string =>
  value.length > max ? value.slice(0, max) + '…' : value
