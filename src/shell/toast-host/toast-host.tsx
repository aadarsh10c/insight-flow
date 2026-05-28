import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useToastHost } from './toast-host.hook'

export const ToastHost = () => {
  const view = useToastHost()
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {view.toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'pointer-events-auto flex w-80 items-start gap-3 rounded-lg border bg-surface px-4 py-3 shadow-lg',
            t.variant === 'destructive' && 'border-destructive/50',
            t.variant === 'success' && 'border-success/50',
            t.variant === 'default' && 'border-border'
          )}
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{t.title}</p>
            {t.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
            )}
          </div>
          {t.action && (
            <button
              type="button"
              onClick={() => view.handleAction(t.id)}
              className="text-sm font-medium text-accent hover:underline"
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            onClick={() => view.handleDismiss(t.id)}
            aria-label="Dismiss"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ))}
    </div>
  )
}
