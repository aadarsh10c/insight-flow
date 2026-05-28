import type { DataSourceId } from '@/types/data-source.type'
import type { ReportId } from '@/types/report.type'

export const newId = (): string => crypto.randomUUID()

export const asDataSourceId = (id: string): DataSourceId => id as DataSourceId
export const asReportId = (id: string): ReportId => id as ReportId
