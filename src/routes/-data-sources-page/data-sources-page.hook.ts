import { useCallback, useMemo, useState } from 'react'
import { useDataSourcesList } from '@/stores/data-sources.store'
import type { DataSourcesPageView } from './data-sources-page.type'

export const useDataSourcesPage = (): DataSourcesPageView => {
  const list = useDataSourcesList()
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const totalRows = useMemo(() => list.reduce((sum, d) => sum + d.rows.length, 0), [list])

  const handleOpenUpload = useCallback(() => setIsUploadOpen(true), [])
  const handleCloseUpload = useCallback(() => setIsUploadOpen(false), [])

  return {
    isUploadOpen,
    totalCount: list.length,
    totalRows,
    handleOpenUpload,
    handleCloseUpload,
  }
}
