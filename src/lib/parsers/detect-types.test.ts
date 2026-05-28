import { describe, it, expect } from 'vitest'
import { detectColumnTypes, inferColumnType, CATEGORY_MAX_UNIQUE } from './detect-types'

describe('inferColumnType', () => {
  it('returns "date" for ISO date strings (80%+ match)', () => {
    expect(inferColumnType(['2024-01-01', '2024-02-15', '2024-03-30', 'invalid', '2024-04-10'])).toBe(
      'date'
    )
  })

  it('returns "date" for year-only values', () => {
    expect(inferColumnType(['2020', '2021', '2022', '2023', '2024'])).toBe('date')
  })

  it('returns "date" for quarter format', () => {
    expect(inferColumnType(['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024'])).toBe('date')
  })

  it('returns "number" when 90%+ parse as numbers after stripping $/,/%', () => {
    expect(
      inferColumnType([
        '$1,234',
        '$5,678',
        '$9,012',
        '$3,456',
        '$7,890',
        '$2,468',
        '$1,357',
        '$8,642',
        '$4,321',
        'N/A',
      ])
    ).toBe('number')
  })

  it('returns "category" for low-cardinality strings (small + ratio < 0.5)', () => {
    expect(
      inferColumnType([
        'West',
        'East',
        'South',
        'North',
        'West',
        'East',
        'South',
        'North',
        'West',
        'East',
        'South',
        'North',
      ])
    ).toBe('category')
  })

  it('returns "text" for high-cardinality strings (every value unique)', () => {
    expect(
      inferColumnType(['Alice Smith', 'Bob Jones', 'Carol Liu', 'Dan Park', 'Eve Cohen'])
    ).toBe('text')
  })

  it('returns "category" when unique count is at threshold', () => {
    const values = Array.from({ length: 200 }, (_, i) => `cat-${i % CATEGORY_MAX_UNIQUE}`)
    expect(inferColumnType(values)).toBe('category')
  })

  it('returns "text" when unique count exceeds threshold even at low ratio', () => {
    const values = Array.from({ length: 200 }, (_, i) => `id-${i}`)
    expect(inferColumnType(values)).toBe('text')
  })

  it('ignores empty strings when computing percentages', () => {
    expect(inferColumnType(['1', '2', '3', '', ''])).toBe('number')
  })

  it('returns "text" for empty input', () => {
    expect(inferColumnType([])).toBe('text')
  })
})

describe('detectColumnTypes', () => {
  it('returns ColumnSchema[] one per column with the 4-type system', () => {
    const rows = [
      { date: '2024-01-01', sales: '$100', region: 'West', customer: 'Alice Smith' },
      { date: '2024-02-01', sales: '$200', region: 'East', customer: 'Bob Jones' },
      { date: '2024-03-01', sales: '$300', region: 'West', customer: 'Carol Liu' },
      { date: '2024-04-01', sales: '$400', region: 'East', customer: 'Dan Park' },
      { date: '2024-05-01', sales: '$500', region: 'West', customer: 'Eve Cohen' },
    ]
    expect(detectColumnTypes(rows)).toEqual([
      { name: 'date', inferredType: 'date' },
      { name: 'sales', inferredType: 'number' },
      { name: 'region', inferredType: 'category' },
      { name: 'customer', inferredType: 'text' },
    ])
  })

  it('returns empty array for empty rows', () => {
    expect(detectColumnTypes([])).toEqual([])
  })
})
