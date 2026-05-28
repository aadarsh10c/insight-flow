import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '../-reports-page'
import type { DataSourceId } from '@/types/data-source.type'

type ReportsSearch = { dataSourceId?: string }

const ReportsRouteComponent = () => {
  const { dataSourceId } = Route.useSearch()
  return <ReportsPage preselectedDataSourceId={dataSourceId as DataSourceId | undefined} />
}

export const Route = createFileRoute('/reports/')({
  validateSearch: (s: Record<string, unknown>): ReportsSearch => ({
    dataSourceId: typeof s.dataSourceId === 'string' ? s.dataSourceId : undefined,
  }),
  component: ReportsRouteComponent,
})
