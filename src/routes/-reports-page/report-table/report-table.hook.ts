import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useReportsList, useReportsStore } from '@/stores/reports.store'
import { useDataSourcesList } from '@/stores/data-sources.store'
import { formatRelativeTime } from '@/lib/utils/format'
import type { ReportId } from '@/types/report.type'
import type { EnrichedReport, ReportTableView } from './report-table.type'

const truncate = (s: string, max = 80): string => (s.length > max ? s.slice(0, max) + '…' : s)

export const useReportTable = (): ReportTableView => {
  const list = useReportsList()
  const dataSources = useDataSourcesList()
  const deleteReport = useReportsStore((s) => s.delete)
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<ReportId | null>(null)
  const [pendingDeleteName, setPendingDeleteName] = useState('')

  const dsNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const d of dataSources) map.set(d.id, d.name)
    return map
  }, [dataSources])

  const allEnriched = useMemo<EnrichedReport[]>(
    () =>
      [...list]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map((r) => ({
          ...r,
          dataSourceName: dsNameById.get(r.dataSourceId) ?? '(deleted)',
          formattedModifiedAt: formatRelativeTime(r.updatedAt),
          truncatedDescription: truncate(r.description),
        })),
    [list, dsNameById]
  )

  const enrichedItems = useMemo<EnrichedReport[]>(() => {
    const q = search.trim().toLowerCase()
    if (q === '') return allEnriched
    return allEnriched.filter(
      (r) => r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)
    )
  }, [allEnriched, search])

  const handleSearchChange = useCallback((v: string) => setSearch(v), [])

  const handleOpenReport = useCallback(
    (id: ReportId) => navigate({ to: '/reports/$reportId', params: { reportId: id } }),
    [navigate]
  )

  const handleStartDelete = useCallback((id: ReportId, name: string) => {
    setPendingDeleteId(id)
    setPendingDeleteName(name)
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (pendingDeleteId) deleteReport(pendingDeleteId)
    setPendingDeleteId(null)
    setPendingDeleteName('')
  }, [pendingDeleteId, deleteReport])

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteId(null)
    setPendingDeleteName('')
  }, [])

  return {
    enrichedItems,
    isListEmpty: allEnriched.length === 0,
    isSearchEmpty: allEnriched.length > 0 && enrichedItems.length === 0,
    search,
    matchCount: enrichedItems.length,
    totalCount: allEnriched.length,
    pendingDeleteId,
    pendingDeleteName,
    handleSearchChange,
    handleOpenReport,
    handleStartDelete,
    handleConfirmDelete,
    handleCancelDelete,
  }
}
