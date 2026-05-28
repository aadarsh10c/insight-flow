import { describe, it, expect } from 'vitest'
import {
  aggregateForBar,
  aggregateForLine,
  bucketKey,
  partitionColumns,
  topNWithOther,
  uniqueValuesOf,
} from './chart-builder-dialog.utils'
import type { ColumnSchema } from '@/types/data-source.type'

describe('partitionColumns', () => {
  it('splits columns into numeric / category / text / temporal', () => {
    const columns: ColumnSchema[] = [
      { name: 'a', inferredType: 'number' },
      { name: 'b', inferredType: 'category' },
      { name: 'c', inferredType: 'text' },
      { name: 'd', inferredType: 'date' },
    ]
    expect(partitionColumns(columns, {})).toEqual({
      numeric: ['a'],
      category: ['b'],
      text: ['c'],
      temporal: ['d'],
    })
  })

  it('respects column-config type overrides', () => {
    const columns: ColumnSchema[] = [{ name: 'x', inferredType: 'text' }]
    expect(partitionColumns(columns, { x: { type: 'category' } }).category).toEqual(['x'])
  })

  it('excludes ignored columns', () => {
    const columns: ColumnSchema[] = [{ name: 'x', inferredType: 'number' }]
    expect(partitionColumns(columns, { x: { ignored: true } }).numeric).toEqual([])
  })
})

describe('uniqueValuesOf', () => {
  it('returns sorted unique non-null values', () => {
    const rows = [{ a: 'West' }, { a: 'East' }, { a: 'West' }, { a: null }]
    expect(uniqueValuesOf(rows, 'a')).toEqual(['East', 'West'])
  })

  it('skips empty strings', () => {
    const rows = [{ a: 'A' }, { a: '' }, { a: '   ' }]
    expect(uniqueValuesOf(rows, 'a')).toEqual(['A'])
  })
})

describe('topNWithOther', () => {
  it('keeps top N and groups rest as Other', () => {
    const pairs: Array<[string, number]> = Array.from({ length: 10 }, (_, i) => [`c${i}`, 10 - i])
    const out = topNWithOther(pairs, 6)
    expect(out).toHaveLength(7)
    expect(out[6]?.[0]).toBe('Other')
  })

  it('returns input unchanged when below threshold', () => {
    const pairs: Array<[string, number]> = [
      ['a', 1],
      ['b', 2],
    ]
    expect(topNWithOther(pairs, 6)).toEqual(pairs)
  })
})

describe('aggregateForBar', () => {
  it('sums measure by group column (handles $/commas)', () => {
    const rows = [
      { region: 'W', sales: '$10' },
      { region: 'E', sales: '$5' },
      { region: 'W', sales: '$15' },
    ]
    expect(aggregateForBar(rows, 'sales', 'region')).toEqual([
      ['E', 5],
      ['W', 25],
    ])
  })

  it('skips rows with missing group key', () => {
    const rows = [{ region: 'W', sales: 10 }, { region: null, sales: 5 }, { region: '', sales: 5 }]
    expect(aggregateForBar(rows, 'sales', 'region')).toEqual([['W', 10]])
  })
})

describe('bucketKey', () => {
  it('returns zero-padded YYYY-MM for monthly so string sort is chronological', () => {
    expect(bucketKey(new Date('2024-03-15'), 'monthly')).toBe('2024-03')
    expect(bucketKey(new Date('2024-10-15'), 'monthly')).toBe('2024-10')
    expect(['2024-03', '2024-10'].sort()).toEqual(['2024-03', '2024-10'])
  })
  it('returns year for yearly', () => {
    expect(bucketKey(new Date('2024-03-15'), 'yearly')).toBe('2024')
  })
  it('returns YYYY-QN for quarterly', () => {
    expect(bucketKey(new Date('2024-03-15'), 'quarterly')).toBe('2024-Q1')
  })
})

describe('aggregateForLine', () => {
  it('groups dates by bucket and sums measure', () => {
    const rows = [
      { date: '2024-01-15', sales: 10 },
      { date: '2024-01-20', sales: 5 },
      { date: '2024-02-10', sales: 20 },
    ]
    const result = aggregateForLine(rows, 'sales', 'date', 'monthly')
    expect(result).toHaveLength(2)
    expect(result[0]?.[1]).toBe(15)
    expect(result[1]?.[1]).toBe(20)
  })

  it('skips rows with invalid date', () => {
    const rows = [
      { date: '2024-01-15', sales: 10 },
      { date: 'not-a-date', sales: 5 },
    ]
    expect(aggregateForLine(rows, 'sales', 'date', 'monthly')).toHaveLength(1)
  })
})
