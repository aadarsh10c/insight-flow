import type { ChangeEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, FileText, Upload } from 'lucide-react'
import { useUploadDataSourceDialog } from './upload-data-source-dialog.hook'
import type { UploadDataSourceDialogProps } from './upload-data-source-dialog.type'

export const UploadDataSourceDialog = (props: UploadDataSourceDialogProps) => {
  const view = useUploadDataSourceDialog(props)

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    view.handleFileChange(e.target.files?.[0] ?? null)
  }
  const handleNameInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    view.handleNameChange(e.target.value)
  }

  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && view.handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-serif">Add data source</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file. Limit: 10 MB or 50,000 rows.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">File</Label>
            {view.file === null ? (
              <Input id="file" type="file" accept=".csv,.xlsx" onChange={handleFileInputChange} />
            ) : (
              <div className="flex min-h-[132px] items-center gap-4 rounded-lg border border-border bg-surface p-5">
                <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-md bg-accent/10 text-accent">
                  <FileText className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <div className="truncate text-sm font-medium">{view.file.name}</div>
                  <div className="text-xs text-muted-foreground">{view.formattedSize}</div>
                  <div className="mt-1 inline-flex items-center gap-1 text-xs text-success">
                    <Check className="h-3 w-3" aria-hidden /> Ready to add
                  </div>
                </div>
                <label htmlFor="file-change" className="cursor-pointer rounded-md px-2 py-1 text-xs text-accent hover:bg-accent/10">
                  Change
                  <input
                    id="file-change"
                    type="file"
                    accept=".csv,.xlsx"
                    className="hidden"
                    onChange={handleFileInputChange}
                  />
                </label>
              </div>
            )}
            {view.fileError && <p className="text-sm text-destructive">{view.fileError}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={view.name}
              onChange={handleNameInputChange}
              placeholder="My data source"
            />
            {view.nameError && <p className="text-sm text-destructive">{view.nameError}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={view.handleClose} disabled={view.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={view.handleSubmit} disabled={!view.canSubmit}>
            <Upload className="mr-2 h-4 w-4" aria-hidden />
            {view.isSubmitting ? 'Uploading…' : 'Add data source'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
