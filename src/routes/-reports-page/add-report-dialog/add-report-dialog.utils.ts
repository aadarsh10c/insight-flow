import type { ColumnConfigMap } from '@/types/report.type'

export const isValidReportInput = (dataSourceId: string | null, name: string): boolean =>
  dataSourceId !== null && name.trim() !== ''

export const stripEmptyOverrides = (config: ColumnConfigMap): ColumnConfigMap => {
  const out: ColumnConfigMap = {}
  for (const [k, v] of Object.entries(config)) {
    const cleaned = { ...v }
    if (cleaned.label === '' || cleaned.label === undefined) delete cleaned.label
    if (cleaned.ignored !== true) delete cleaned.ignored
    if (cleaned.type === undefined) delete cleaned.type
    if (Object.keys(cleaned).length > 0) out[k] = cleaned
  }
  return out
}
