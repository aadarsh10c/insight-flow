export type ConfirmDialogVariant = 'default' | 'destructive'

export type ConfirmDialogProps = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  variant?: ConfirmDialogVariant
  onConfirm: () => void
  onCancel: () => void
}

export type UseConfirmDialogParams = ConfirmDialogProps

export type ConfirmDialogView = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  isDestructive: boolean
  handleConfirm: () => void
  handleCancel: () => void
  handleOpenChange: (open: boolean) => void
}
