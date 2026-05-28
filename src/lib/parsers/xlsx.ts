import type { RowData } from '@/types/data-source.type'
import type { ParseResult } from './csv'

export const parseXLSX = async (buffer: ArrayBuffer): Promise<ParseResult> => {
  const XLSX = await import('xlsx')
  try {
    const wb = XLSX.read(buffer, { type: 'array' })
    const firstSheetName = wb.SheetNames[0]
    if (firstSheetName === undefined) return { rows: [], errors: ['No sheets found'] }
    const ws = wb.Sheets[firstSheetName]
    if (ws === undefined) return { rows: [], errors: ['First sheet is empty'] }
    const rows = XLSX.utils.sheet_to_json<RowData>(ws, { defval: null })
    return { rows, errors: [] }
  } catch (err) {
    return { rows: [], errors: [(err as Error).message] }
  }
}
