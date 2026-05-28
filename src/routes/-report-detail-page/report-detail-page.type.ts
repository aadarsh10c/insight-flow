import type { TimeBucket } from '@/types/chart.type'
import type { ReportId } from '@/types/report.type'

export type ReportDetailPageProps = { reportId: ReportId }

export type ReportDetailPageView = {
  notFound: boolean
  dataSourceMissing: boolean
  reportName: string
  reportDescription: string
  formattedLastModified: string
  dataSourceName: string
  hasChart: boolean
  isBuilderOpen: boolean
  isEditMetaOpen: boolean
  nameDraft: string
  descriptionDraft: string
  canSaveMeta: boolean
  restoredColumnsNote: string | null
  handleOpenBuilder: () => void
  handleCloseBuilder: () => void
  handleOpenEditMeta: () => void
  handleCloseEditMeta: () => void
  handleNameDraftChange: (v: string) => void
  handleDescriptionDraftChange: (v: string) => void
  handleSaveMeta: () => void
  handleDismissRestoredNote: () => void
  handleBackToReports: () => void
  handleBucketChange: (bucket: TimeBucket) => void
}
