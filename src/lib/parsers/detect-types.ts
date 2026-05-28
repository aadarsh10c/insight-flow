import type { ColumnSchema, ColumnType, RowData } from '@/types/data-source.type'

const DATE_PATTERNS: RegExp[] = [
  /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
  /^\d{2}\/\d{2}\/\d{4}/, // DD/MM/YYYY or MM/DD/YYYY
  /^\d{2}-\d{2}-\d{4}/, // MM-DD-YYYY
  /^\d{4}$/, // Year only
  /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i, // Month-Year
  /^Q[1-4]\s+\d{4}$/i, // Quarter
]

const isDateLike = (value: string): boolean => DATE_PATTERNS.some((re) => re.test(value.trim()))

const isNumberLike = (value: string): boolean => {
  const stripped = value.replace(/[$,%\s]/g, '')
  if (stripped === '') return false
  return !Number.isNaN(Number(stripped))
}

export const CATEGORY_MAX_UNIQUE = 50
export const CATEGORY_MAX_RATIO = 0.5

const DATE_THRESHOLD = 0.8
const NUMBER_THRESHOLD = 0.9

export const inferColumnType = (values: ReadonlyArray<unknown>): ColumnType => {
  const nonEmpty = values
    .map((v) => (v == null ? '' : String(v)))
    .filter((s) => s.trim() !== '')

  if (nonEmpty.length === 0) return 'text'

  const dateMatches = nonEmpty.filter(isDateLike).length
  if (dateMatches / nonEmpty.length >= DATE_THRESHOLD) return 'date'

  const numberMatches = nonEmpty.filter(isNumberLike).length
  if (numberMatches / nonEmpty.length >= NUMBER_THRESHOLD) return 'number'

  const uniqueCount = new Set(nonEmpty).size
  const uniqueRatio = uniqueCount / nonEmpty.length
  if (uniqueCount <= CATEGORY_MAX_UNIQUE && uniqueRatio < CATEGORY_MAX_RATIO) return 'category'

  return 'text'
}

export const detectColumnTypes = (rows: ReadonlyArray<RowData>): ColumnSchema[] => {
  if (rows.length === 0) return []
  const columnNames = Object.keys(rows[0]!)
  return columnNames.map((name) => ({
    name,
    inferredType: inferColumnType(rows.map((r) => r[name])),
  }))
}
