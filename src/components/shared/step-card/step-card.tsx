import { Check, Circle, Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { StepCardProps, StepCardStatus } from './step-card.type'

type StatusDotProps = { status: StepCardStatus }

const StatusDot = ({ status }: StatusDotProps) => {
  if (status === 'locked') {
    return (
      <div className="grid h-5 w-5 place-items-center text-muted-foreground">
        <Lock className="h-3 w-3" aria-hidden />
      </div>
    )
  }
  if (status === 'complete') {
    return (
      <div className="grid h-5 w-5 place-items-center rounded-full bg-success text-white">
        <Check className="h-3 w-3" aria-hidden />
      </div>
    )
  }
  return (
    <div className="grid h-5 w-5 place-items-center rounded-full bg-accent text-white">
      <Circle className="h-2.5 w-2.5 fill-current" aria-hidden />
    </div>
  )
}

export const StepCard = (props: StepCardProps) => {
  const { status, stepNumber, title, optional, summary, resetReason, onExpand, children } = props
  const isBodyVisible = status === 'active' || status === 'reset'
  const isHeaderInteractive = status === 'complete' && onExpand !== undefined

  return (
    <div
      className={cn(
        'rounded-lg border bg-surface transition-colors',
        status === 'locked' && 'opacity-55',
        status === 'active' && 'border-accent shadow-[0_0_0_3px_rgba(194,65,12,0.10)]',
        status === 'complete' && 'border-border',
        status === 'reset' && 'border-warning/50'
      )}
    >
      <div
        role={isHeaderInteractive ? 'button' : undefined}
        tabIndex={isHeaderInteractive ? 0 : undefined}
        onClick={isHeaderInteractive ? onExpand : undefined}
        onKeyDown={
          isHeaderInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onExpand?.()
                }
              }
            : undefined
        }
        className={cn(
          'flex items-center gap-2.5 px-3.5 py-2.5',
          isHeaderInteractive && 'cursor-pointer'
        )}
      >
        <StatusDot status={status} />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Step {stepNumber}
            {status === 'locked' && ' · Locked'}
            {status === 'complete' && ' · Complete'}
            {optional && (
              <span className="ml-1.5 font-normal text-muted-foreground/70">optional</span>
            )}
          </div>
          <div className="text-sm font-semibold">{title}</div>
        </div>
      </div>

      {status === 'complete' && summary && (
        <div className="px-3.5 pb-2.5 pl-[42px] text-xs text-muted-foreground">{summary}</div>
      )}

      {status === 'reset' && resetReason && (
        <div className="border-t border-warning/30 bg-warning/5 px-3.5 py-1.5 pl-[42px] text-[11px] italic text-warning">
          Reset — {resetReason}
        </div>
      )}

      {isBodyVisible && children && (
        <div className="border-t border-border/60 p-3.5">{children}</div>
      )}
    </div>
  )
}
