import type { RowData } from '@/types/data-source.type'

export type ParseResult = {
  rows: RowData[]
  errors: string[]
}

export const parseCSV = async (text: string): Promise<ParseResult> => {
  const { default: Papa } = await import('papaparse')
  return new Promise((resolve) => {
    Papa.parse<RowData>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve({
          rows: result.data,
          errors: result.errors.map((e) => `${e.type}: ${e.message}`),
        })
      },
    })
  })
}
