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
  restoredColumnsNote: string | null
  handleOpenBuilder: () => void
  handleCloseBuilder: () => void
  handleNameChange: (v: string) => void
  handleDescriptionChange: (v: string) => void
  handleDismissRestoredNote: () => void
  handleBackToReports: () => void
}
