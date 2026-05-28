import { useCallback } from 'react'
import { useToastStore } from '@/stores/toast.store'
import type { ToastHostView } from './toast-host.type'

export const useToastHost = (): ToastHostView => {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  const handleDismiss = useCallback((id: string) => dismiss(id), [dismiss])

  const handleAction = useCallback(
    (id: string) => {
      const t = useToastStore.getState().toasts.find((x) => x.id === id)
      t?.action?.handler()
      dismiss(id)
    },
    [dismiss]
  )

  return { toasts, handleDismiss, handleAction }
}
