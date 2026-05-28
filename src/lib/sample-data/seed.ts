import type { DataSource } from '@/types/data-source.type'
import { useDataSourcesStore } from '@/stores/data-sources.store'

export const seedSampleDataSource = async (): Promise<DataSource> => {
  const [{ parseCSV }, { detectColumnTypes }, response] = await Promise.all([
    import('@/lib/parsers/csv'),
    import('@/lib/parsers/detect-types'),
    fetch('/sample/superstore.csv'),
  ])
  const text = await response.text()
  const parsed = await parseCSV(text)
  return useDataSourcesStore.getState().add({
    name: 'Sample — Superstore',
    filename: 'superstore.csv',
    type: 'csv',
    sizeBytes: text.length,
    columns: detectColumnTypes(parsed.rows),
    rows: parsed.rows,
  })
}
