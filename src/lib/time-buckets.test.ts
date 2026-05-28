import { describe, it, expect } from 'vitest'
import { getValidBuckets, pickDefaultBucket } from './time-buckets'

describe('getValidBuckets', () => {
  it('30 unique daily dates -> daily + weekly (others would yield <2 points)', () => {
    const dates = Array.from({ length: 30 }, (_, i) => new Date(2024, 0, i + 1).toISOString())
    const buckets = getValidBuckets(dates)
    expect(buckets).toContain('daily')
    expect(buckets).toContain('weekly')
    expect(buckets).not.toContain('yearly')
  })

  it('600 days of daily data -> monthly + quarterly + yearly (daily over cap)', () => {
    const dates = Array.from({ length: 600 }, (_, i) => new Date(2024, 0, i + 1).toISOString())
    const buckets = getValidBuckets(dates)
    expect(buckets).toContain('monthly')
    expect(buckets).not.toContain('daily')
  })

  it('10 years of daily data -> monthly + quarterly + yearly', () => {
    const dates = Array.from({ length: 3650 }, (_, i) => new Date(2014, 0, i + 1).toISOString())
    expect(getValidBuckets(dates)).toEqual(['monthly', 'quarterly', 'yearly'])
  })

  it('returns empty array for empty input', () => {
    expect(getValidBuckets([])).toEqual([])
  })

  it('skips invalid date strings', () => {
    const dates = ['2024-01-01', 'not-a-date', '2024-02-01', '2024-03-01']
    const buckets = getValidBuckets(dates)
    expect(buckets.length).toBeGreaterThan(0)
  })
})

describe('pickDefaultBucket', () => {
  it('picks the bucket yielding closest to 30 points (monthly for ~500 days)', () => {
    const dates = Array.from({ length: 500 }, (_, i) => new Date(2024, 0, i + 1).toISOString())
    expect(pickDefaultBucket(dates)).toBe('monthly')
  })

  it('returns null for empty input', () => {
    expect(pickDefaultBucket([])).toBeNull()
  })
})
