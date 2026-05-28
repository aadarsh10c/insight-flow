export type DataSourcesPageProps = Record<string, never>

export type DataSourcesPageView = {
  isUploadOpen: boolean
  totalCount: number
  totalRows: number
  handleOpenUpload: () => void
  handleCloseUpload: () => void
}
