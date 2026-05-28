import { cn } from '@/lib/utils/cn'

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('animate-pulse rounded-md bg-foreground/[0.06] dark:bg-foreground/[0.08]', className)}
    {...props}
  />
)
