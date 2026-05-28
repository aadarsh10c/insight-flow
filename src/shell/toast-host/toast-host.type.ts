import type { Toast } from '@/stores/toast.store'

export type ToastHostProps = Record<string, never>

export type ToastHostView = {
  toasts: ReadonlyArray<Toast>
  handleDismiss: (id: string) => void
  handleAction: (id: string) => void
}
