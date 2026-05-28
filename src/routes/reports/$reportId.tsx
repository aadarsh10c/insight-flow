import { createFileRoute } from '@tanstack/react-router'
import { ReportDetailPage } from '../-report-detail-page'
import { ReportDetailSkeleton } from '../-report-detail-page/report-detail-skeleton'
import type { ReportId } from '@/types/report.type'

const ReportDetailRouteComponent = () => {
  const { reportId } = Route.useParams()
  return <ReportDetailPage reportId={reportId as ReportId} />
}

export const Route = createFileRoute('/reports/$reportId')({
  component: ReportDetailRouteComponent,
  pendingComponent: ReportDetailSkeleton,
  pendingMs: 0,
  pendingMinMs: 0,
})
