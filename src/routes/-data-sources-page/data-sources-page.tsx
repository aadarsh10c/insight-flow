import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataSourceTable } from './data-source-table'
import { UploadDataSourceDialog } from './upload-data-source-dialog'
import { useDataSourcesPage } from './data-sources-page.hook'
import type { DataSourcesPageProps } from './data-sources-page.type'

export const DataSourcesPage = (_props: DataSourcesPageProps) => {
  const view = useDataSourcesPage()
  return (
    <div className="px-8 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Data Sources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {view.totalCount} file{view.totalCount === 1 ? '' : 's'}
            {view.totalCount > 0 && ` · ${view.totalRows.toLocaleString()} rows total`}
          </p>
        </div>
        <Button onClick={view.handleOpenUpload}>
          <Plus className="mr-2 h-4 w-4" aria-hidden /> Add data source
        </Button>
      </div>
      <DataSourceTable />
      <UploadDataSourceDialog open={view.isUploadOpen} onClose={view.handleCloseUpload} />
    </div>
  )
}
