import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useReportById, useReportsStore } from '@/stores/reports.store'
import { useDataSourceById } from '@/stores/data-sources.store'
import { formatRelativeTime } from '@/lib/utils/format'
import type {
  ReportDetailPageProps,
  ReportDetailPageView,
} from './report-detail-page.type'

export const useReportDetailPage = (props: ReportDetailPageProps): ReportDetailPageView => {
  const report = useReportById(props.reportId)
  const dataSource = useDataSourceById(report?.dataSourceId)
  const updateReport = useReportsStore((s) => s.update)
  const navigate = useNavigate()

  const [isBuilderOpen, setIsBuilderOpen] = useState(false)

  // Note: auto-restore of ignored columns referenced by the chart happens inside
  // chart-builder-dialog.hook.ts on dialog open — that's where the side effect is
  // contextually relevant (the user is about to edit the chart). The report-detail
  // page itself just renders.
  const restoredColumnsNote: string | null = null

  const handleOpenBuilder = useCallback(() => setIsBuilderOpen(true), [])
  const handleCloseBuilder = useCallback(() => setIsBuilderOpen(false), [])
  const handleDismissRestoredNote = useCallback(() => {
    /* no-op in V1 — restore happens transparently on dialog open */
  }, [])

  const handleNameChange = useCallback(
    (v: string) => {
      if (report !== null) updateReport(report.id, { name: v })
    },
    [report, updateReport]
  )

  const handleDescriptionChange = useCallback(
    (v: string) => {
      if (report !== null) updateReport(report.id, { description: v })
    },
    [report, updateReport]
  )

  const handleBackToReports = useCallback(() => navigate({ to: '/reports' }), [navigate])

  if (report === null) {
    return {
      notFound: true,
      dataSourceMissing: false,
      reportName: '',
      reportDescription: '',
      formattedLastModified: '',
      dataSourceName: '',
      hasChart: false,
      isBuilderOpen: false,
      restoredColumnsNote: null,
      handleOpenBuilder,
      handleCloseBuilder,
      handleNameChange,
      handleDescriptionChange,
      handleDismissRestoredNote,
      handleBackToReports,
    }
  }

  return {
    notFound: false,
    dataSourceMissing: dataSource === null,
    reportName: report.name,
    reportDescription: report.description,
    formattedLastModified: formatRelativeTime(report.updatedAt),
    dataSourceName: dataSource?.name ?? '(missing)',
    hasChart: report.chart !== undefined,
    isBuilderOpen,
    restoredColumnsNote,
    handleOpenBuilder,
    handleCloseBuilder,
    handleNameChange,
    handleDescriptionChange,
    handleDismissRestoredNote,
    handleBackToReports,
  }
}
