import { describe, it, expect } from 'vitest'
import { parseCSV } from './csv'

describe('parseCSV', () => {
  it('parses a small CSV with headers into rows', async () => {
    const text = 'name,age\nAlice,30\nBob,25'
    const result = await parseCSV(text)
    expect(result.rows).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ])
  })

  it('skips empty lines', async () => {
    const text = 'a,b\n1,2\n\n3,4'
    const result = await parseCSV(text)
    expect(result.rows).toHaveLength(2)
  })

  it('handles quoted values with commas', async () => {
    const text = 'name,company\n"Smith, John","Acme, Inc"\nJane Doe,Beta'
    const result = await parseCSV(text)
    expect(result.rows[0]).toEqual({ name: 'Smith, John', company: 'Acme, Inc' })
  })

  it('returns errors array (possibly empty) without throwing', async () => {
    const text = 'a,b\n1,2'
    const result = await parseCSV(text)
    expect(Array.isArray(result.errors)).toBe(true)
  })

  it('handles empty input gracefully', async () => {
    const result = await parseCSV('')
    expect(result.rows).toEqual([])
  })
})
