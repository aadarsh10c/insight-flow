import type { ChangeEvent } from 'react'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ColumnConfigTable } from './column-config-table'
import { useAddReportDialog } from './add-report-dialog.hook'
import type { AddReportDialogProps } from './add-report-dialog.type'
import type { DataSourceId } from '@/types/data-source.type'

export const AddReportDialog = (props: AddReportDialogProps) => {
  const view = useAddReportDialog(props)

  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && view.handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-serif">Add Report</DialogTitle>
          <DialogDescription>
            Pick a data source, name your report, configure columns, then save.
          </DialogDescription>
        </DialogHeader>

        <DialogBody>
        {view.isEmpty ? (
          <div className="rounded-md border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
            {view.emptyMessage}
          </div>
        ) : (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Data source</Label>
              <Select
                value={view.selectedDataSourceId ?? ''}
                onValueChange={(v: string) => view.handleDataSourceChange(v as DataSourceId)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a data source…" />
                </SelectTrigger>
                <SelectContent>
                  {view.availableDataSources.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-name">Name</Label>
              <Input
                id="report-name"
                value={view.name}
                onChange={(e: ChangeEvent<HTMLInputElement>) => view.handleNameChange(e.target.value)}
                placeholder="Sales by Region"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-description">
                Description <span className="text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="report-description"
                value={view.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  view.handleDescriptionChange(e.target.value)
                }
                placeholder="What is this report for?"
                rows={2}
              />
            </div>

            {view.selectedDataSource && (
              <div className="space-y-2">
                <Label>Columns</Label>
                <ColumnConfigTable
                  columns={view.selectedDataSource.columns}
                  rows={view.selectedDataSource.rows}
                  value={view.columnConfig}
                  onChange={view.handleColumnConfigChange}
                />
              </div>
            )}
          </div>
        )}
        </DialogBody>

        <DialogFooter>
          <Button variant="outline" onClick={view.handleClose} disabled={view.isSubmitting}>
            Cancel
          </Button>
          <Button onClick={view.handleSubmit} disabled={!view.canSubmit}>
            {view.isSubmitting ? 'Saving…' : 'Save report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
