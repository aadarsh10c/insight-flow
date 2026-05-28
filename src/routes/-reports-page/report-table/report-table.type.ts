import type { Report, ReportId } from '@/types/report.type'

export type ReportTableProps = Record<string, never>

export type EnrichedReport = Report & {
  dataSourceName: string
  formattedModifiedAt: string
  truncatedDescription: string
}

export type ReportTableView = {
  enrichedItems: ReadonlyArray<EnrichedReport>
  isListEmpty: boolean
  isSearchEmpty: boolean
  search: string
  matchCount: number
  totalCount: number
  pendingDeleteId: ReportId | null
  pendingDeleteName: string
  handleSearchChange: (value: string) => void
  handleOpenReport: (id: ReportId) => void
  handleStartDelete: (id: ReportId, name: string) => void
  handleConfirmDelete: () => void
  handleCancelDelete: () => void
}
