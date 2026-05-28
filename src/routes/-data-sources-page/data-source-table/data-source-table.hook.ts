import { useCallback, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDataSourcesList, useMostRecentDataSourceId } from '@/stores/data-sources.store'
import { formatBytes, formatRelativeTime } from '@/lib/utils/format'
import type { DataSourceId } from '@/types/data-source.type'
import type {
  DataSourceTableView,
  EnrichedDataSource,
  UseDataSourceTableParams,
} from './data-source-table.type'

export const useDataSourceTable = (_params?: UseDataSourceTableParams): DataSourceTableView => {
  const list = useDataSourcesList()
  const mostRecentId = useMostRecentDataSourceId()
  const navigate = useNavigate()

  const enrichedItems = useMemo<EnrichedDataSource[]>(
    () =>
      [...list]
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
        .map((d) => ({
          ...d,
          formattedSize: formatBytes(d.sizeBytes),
          formattedUploadedAt: formatRelativeTime(d.uploadedAt),
          isMostRecent: d.id === mostRecentId,
          rowCount: d.rows.length,
        })),
    [list, mostRecentId]
  )

  const handleCreateReport = useCallback(
    (id: DataSourceId) => {
      // Forward reference: /reports route is created in Phase 04
      navigate({ to: '/reports' as never, search: { dataSourceId: id } as never })
    },
    [navigate]
  )

  return {
    enrichedItems,
    isEmpty: enrichedItems.length === 0,
    handleCreateReport,
  }
}
