import { describe, it, expect } from 'vitest'
import * as XLSX from 'xlsx'
import { parseXLSX } from './xlsx'

const makeXlsxBuffer = (rows: Record<string, unknown>[]): ArrayBuffer => {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
  return XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

describe('parseXLSX', () => {
  it('parses first sheet into rows of objects', async () => {
    const buf = makeXlsxBuffer([
      { name: 'Alice', age: 30 },
      { name: 'Bob', age: 25 },
    ])
    const result = await parseXLSX(buf)
    expect(result.rows).toHaveLength(2)
    expect(result.rows[0]).toEqual({ name: 'Alice', age: 30 })
  })

  it('returns empty rows for empty workbook', async () => {
    const buf = makeXlsxBuffer([])
    const result = await parseXLSX(buf)
    expect(result.rows).toEqual([])
  })

  it('does not throw on garbage input; returns empty rows + errors array', async () => {
    const garbage = new Uint8Array([0, 0, 0]).buffer
    const result = await parseXLSX(garbage)
    expect(result.rows).toEqual([])
    expect(Array.isArray(result.errors)).toBe(true)
  })
})
