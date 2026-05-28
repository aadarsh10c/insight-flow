import type { DataSource, DataSourceId } from '@/types/data-source.type'

export type DataSourceTableProps = Record<string, never>

export type EnrichedDataSource = DataSource & {
  formattedSize: string
  formattedUploadedAt: string
  isMostRecent: boolean
  rowCount: number
}

export type UseDataSourceTableParams = DataSourceTableProps

export type DataSourceTableView = {
  enrichedItems: ReadonlyArray<EnrichedDataSource>
  isEmpty: boolean
  isHydrating: boolean
  handleCreateReport: (id: DataSourceId) => void
}
