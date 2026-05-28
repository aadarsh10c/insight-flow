import { createFileRoute } from '@tanstack/react-router'
import { DataSourcesPage } from './-data-sources-page'

const DataSourcesRouteComponent = () => <DataSourcesPage />

export const Route = createFileRoute('/datasources')({ component: DataSourcesRouteComponent })
