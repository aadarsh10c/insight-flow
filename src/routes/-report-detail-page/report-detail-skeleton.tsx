import { Skeleton } from '@/components/ui/skeleton'

export const ReportDetailSkeleton = () => (
  <div className="flex h-full flex-col px-8 py-6">
    <Skeleton className="mb-3 h-3 w-24" />
    <Skeleton className="mb-2 h-8 w-1/2" />
    <Skeleton className="mb-4 h-4 w-2/3" />
    <div className="mb-4 flex items-center gap-3">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-4 w-24" />
      <div className="ml-auto">
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
    <Skeleton className="flex-1 w-full" />
  </div>
)
