import { useCallback } from 'react'
import type { ConfirmDialogView, UseConfirmDialogParams } from './confirm-dialog.type'

export const useConfirmDialog = (params: UseConfirmDialogParams): ConfirmDialogView => {
  const {
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant = 'default',
    onConfirm,
    onCancel,
  } = params

  const handleConfirm = useCallback(() => onConfirm(), [onConfirm])
  const handleCancel = useCallback(() => onCancel(), [onCancel])
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) onCancel()
    },
    [onCancel]
  )

  return {
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    isDestructive: variant === 'destructive',
    handleConfirm,
    handleCancel,
    handleOpenChange,
  }
}
