import { create } from 'zustand'
import { newId } from '@/lib/ids'

export type ToastVariant = 'default' | 'success' | 'destructive'

export type ToastAction = { label: string; handler: () => void }

export type Toast = {
  id: string
  variant: ToastVariant
  title: string
  description?: string
  action?: ToastAction
}

type ShowInput = Omit<Toast, 'id'> & { durationMs?: number }

type ToastState = { toasts: Toast[] }

type ToastActions = {
  show: (input: ShowInput) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION_MS = 4000

export const useToastStore = create<ToastState & ToastActions>((set, get) => ({
  toasts: [],
  show: ({ durationMs = DEFAULT_DURATION_MS, ...rest }) => {
    const id = newId()
    const toast: Toast = { id, ...rest }
    set({ toasts: [...get().toasts, toast] })
    if (durationMs > 0) setTimeout(() => get().dismiss(id), durationMs)
    return id
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))
