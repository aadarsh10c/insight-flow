import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useDataSourcesList, useMostRecentDataSourceId } from '@/stores/data-sources.store'
import { formatBytes, formatRelativeTime } from '@/lib/utils/format'
import type { DataSourceId } from '@/types/data-source.type'
import type {
  DataSourceTableView,
  EnrichedDataSource,
  UseDataSourceTableParams,
} from './data-source-table.type'

const RECENT_THRESHOLD_MS = 5 * 60_000

export const useDataSourceTable = (_params?: UseDataSourceTableParams): DataSourceTableView => {
  const list = useDataSourcesList()
  const mostRecentId = useMostRecentDataSourceId()
  const navigate = useNavigate()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  const enrichedItems = useMemo<EnrichedDataSource[]>(
    () =>
      [...list]
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
        .map((d) => ({
          ...d,
          formattedSize: formatBytes(d.sizeBytes),
          formattedUploadedAt: formatRelativeTime(d.uploadedAt),
          isMostRecent: d.id === mostRecentId && now - d.uploadedAt < RECENT_THRESHOLD_MS,
          rowCount: d.rows.length,
        })),
    [list, mostRecentId, now]
  )

  const handleCreateReport = useCallback(
    (id: DataSourceId) => {
      navigate({ to: '/reports', search: { dataSourceId: id } })
    },
    [navigate]
  )

  return {
    enrichedItems,
    isEmpty: enrichedItems.length === 0,
    handleCreateReport,
  }
}
