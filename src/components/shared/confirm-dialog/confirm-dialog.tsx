import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useConfirmDialog } from './confirm-dialog.hook'
import type { ConfirmDialogProps } from './confirm-dialog.type'

export const ConfirmDialog = (props: ConfirmDialogProps) => {
  const view = useConfirmDialog(props)
  return (
    <Dialog open={view.open} onOpenChange={view.handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{view.title}</DialogTitle>
          <DialogDescription>{view.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={view.handleCancel}>
            {view.cancelLabel}
          </Button>
          <Button
            variant={view.isDestructive ? 'destructive' : 'default'}
            onClick={view.handleConfirm}
          >
            {view.confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
