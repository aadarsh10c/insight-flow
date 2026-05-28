import { createFileRoute } from '@tanstack/react-router'
import { ReportDetailPage } from '../-report-detail-page'
import type { ReportId } from '@/types/report.type'

const ReportDetailRouteComponent = () => {
  const { reportId } = Route.useParams()
  return <ReportDetailPage reportId={reportId as ReportId} />
}

export const Route = createFileRoute('/reports/$reportId')({
  component: ReportDetailRouteComponent,
})
