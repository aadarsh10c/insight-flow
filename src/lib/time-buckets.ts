import type { TimeBucket } from '@/types/chart.type'

const ALL_BUCKETS: TimeBucket[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']

const MIN_POINTS = 2
const MAX_POINTS = 500
const IDEAL_POINTS = 30

const countBuckets = (dates: ReadonlyArray<string>, bucket: TimeBucket): number => {
  const keys = new Set<string>()
  for (const iso of dates) {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) continue
    switch (bucket) {
      case 'daily':
        keys.add(d.toISOString().slice(0, 10))
        break
      case 'weekly': {
        const onejan = new Date(d.getFullYear(), 0, 1)
        const week = Math.ceil(
          ((d.getTime() - onejan.getTime()) / 86_400_000 + onejan.getDay() + 1) / 7
        )
        keys.add(`${d.getFullYear()}-W${week}`)
        break
      }
      case 'monthly':
        keys.add(`${d.getFullYear()}-${d.getMonth()}`)
        break
      case 'quarterly':
        keys.add(`${d.getFullYear()}-Q${Math.floor(d.getMonth() / 3)}`)
        break
      case 'yearly':
        keys.add(String(d.getFullYear()))
        break
    }
  }
  return keys.size
}

export const getValidBuckets = (dates: ReadonlyArray<string>): TimeBucket[] => {
  if (dates.length === 0) return []
  return ALL_BUCKETS.filter((b) => {
    const n = countBuckets(dates, b)
    return n >= MIN_POINTS && n <= MAX_POINTS
  })
}

export const pickDefaultBucket = (dates: ReadonlyArray<string>): TimeBucket | null => {
  const valid = getValidBuckets(dates)
  if (valid.length === 0) return null
  return valid.reduce<{ bucket: TimeBucket; distance: number } | null>((best, b) => {
    const distance = Math.abs(countBuckets(dates, b) - IDEAL_POINTS)
    if (best === null || distance < best.distance) return { bucket: b, distance }
    return best
  }, null)!.bucket
}
