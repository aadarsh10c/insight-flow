import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useReportById, useReportsStore } from '@/stores/reports.store'
import { useDataSourceById } from '@/stores/data-sources.store'
import { formatRelativeTime } from '@/lib/utils/format'
import type { TimeBucket } from '@/types/chart.type'
import type {
  ReportDetailPageProps,
  ReportDetailPageView,
} from './report-detail-page.type'

export const useReportDetailPage = (props: ReportDetailPageProps): ReportDetailPageView => {
  const report = useReportById(props.reportId)
  const dataSource = useDataSourceById(report?.dataSourceId)
  const updateReport = useReportsStore((s) => s.update)
  const setChart = useReportsStore((s) => s.setChart)
  const navigate = useNavigate()

  const [isBuilderOpen, setIsBuilderOpen] = useState(false)
  const [isEditMetaOpen, setIsEditMetaOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const [descriptionDraft, setDescriptionDraft] = useState('')

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

  const handleOpenEditMeta = useCallback(() => {
    if (report === null) return
    setNameDraft(report.name)
    setDescriptionDraft(report.description)
    setIsEditMetaOpen(true)
  }, [report])

  const handleCloseEditMeta = useCallback(() => setIsEditMetaOpen(false), [])

  const handleNameDraftChange = useCallback((v: string) => setNameDraft(v), [])
  const handleDescriptionDraftChange = useCallback((v: string) => setDescriptionDraft(v), [])

  const handleSaveMeta = useCallback(() => {
    if (report === null) return
    const trimmed = nameDraft.trim()
    if (trimmed === '') return
    updateReport(report.id, { name: trimmed, description: descriptionDraft })
    setIsEditMetaOpen(false)
  }, [report, nameDraft, descriptionDraft, updateReport])

  const handleBackToReports = useCallback(() => navigate({ to: '/reports' }), [navigate])

  const handleBucketChange = useCallback(
    (bucket: TimeBucket) => {
      if (report === null || !report.chart || report.chart.config.type !== 'line') return
      setChart(report.id, {
        ...report.chart,
        config: { ...report.chart.config, bucket },
      })
    },
    [report, setChart]
  )

  const canSaveMeta = nameDraft.trim() !== ''

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
      isEditMetaOpen: false,
      nameDraft: '',
      descriptionDraft: '',
      canSaveMeta: false,
      restoredColumnsNote: null,
      handleOpenBuilder,
      handleCloseBuilder,
      handleOpenEditMeta,
      handleCloseEditMeta,
      handleNameDraftChange,
      handleDescriptionDraftChange,
      handleSaveMeta,
      handleDismissRestoredNote,
      handleBackToReports,
      handleBucketChange,
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
    isEditMetaOpen,
    nameDraft,
    descriptionDraft,
    canSaveMeta,
    restoredColumnsNote,
    handleOpenBuilder,
    handleCloseBuilder,
    handleOpenEditMeta,
    handleCloseEditMeta,
    handleNameDraftChange,
    handleDescriptionDraftChange,
    handleSaveMeta,
    handleDismissRestoredNote,
    handleBackToReports,
    handleBucketChange,
  }
}
