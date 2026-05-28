import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { StepCard } from '@/components/shared/step-card'
import { Step1ChartType } from './step-1-chart-type'
import { Step2Data } from './step-2-data'
import { Step3Filter } from './step-3-filter'
import { Step4Style } from './step-4-style'
import { ChartPreview } from './chart-preview'
import { useChartBuilderDialog } from './chart-builder-dialog.hook'
import type { ChartBuilderDialogProps } from './chart-builder-dialog.type'

export const ChartBuilderDialog = (props: ChartBuilderDialogProps) => {
  const view = useChartBuilderDialog(props)
  const { state } = view

  return (
    <Dialog open={props.open} onOpenChange={(o) => !o && view.handleClose()}>
      <DialogContent className="h-[90vh] !max-h-[90vh] w-[90vw] !max-w-[90vw] p-0">
        <DialogHeader className="flex flex-row items-center justify-between gap-2">
          <DialogTitle className="text-title">Create Chart</DialogTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={view.handleResetAll}>
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Reset All
            </Button>
            <Button variant="outline" size="sm" onClick={view.handleClose}>
              Cancel
            </Button>
            <Button size="sm" onClick={view.handleSave} disabled={!state.canSave}>
              Save Chart
            </Button>
          </div>
        </DialogHeader>

        <DialogBody className="!p-0">
          <div className="grid h-full grid-cols-[40%_60%]">
            <aside className="space-y-3 overflow-y-auto border-r border-border bg-background px-5 py-5">
              <StepCard
                status={state.steps[1].status}
                stepNumber={1}
                title="Chart type"
                summary={state.steps[1].status === 'complete' ? view.summaries.step1 : undefined}
                onExpand={() => view.handleGoToStep(1)}
              >
                <Step1ChartType
                  value={state.steps[1].value}
                  partitioned={view.partitioned}
                  hasPieEligibleColumn={view.hasPieEligibleColumn}
                  onChange={view.handleChartTypeChange}
                />
              </StepCard>

              <StepCard
                status={state.steps[2].status}
                stepNumber={2}
                title="Data"
                summary={state.steps[2].status === 'complete' ? view.summaries.step2 : undefined}
                resetReason={state.steps[2].status === 'reset' ? 'chart type changed' : undefined}
                onExpand={() => view.handleGoToStep(2)}
              >
                {state.steps[1].value !== null && (
                  <Step2Data
                    chartType={state.steps[1].value}
                    partitioned={view.partitioned}
                    columnConfig={props.report.columnConfig}
                    rows={props.dataSource.rows}
                    value={state.steps[2].value}
                    onChange={view.handleDataChange}
                  />
                )}
              </StepCard>

              <StepCard
                status={state.steps[3].status}
                stepNumber={3}
                title="Filter"
                optional
                summary={state.steps[3].status === 'complete' ? view.summaries.step3 : undefined}
                resetReason={state.steps[3].status === 'reset' ? 'data changed' : undefined}
                onExpand={() => view.handleGoToStep(3)}
              >
                <Step3Filter
                  rows={props.dataSource.rows}
                  partitioned={view.partitioned}
                  columnConfig={props.report.columnConfig}
                  value={state.steps[3].value}
                  onChange={view.handleFilterChange}
                />
              </StepCard>

              <StepCard
                status={state.steps[4].status}
                stepNumber={4}
                title="Style"
                optional
                summary={state.steps[4].status === 'complete' ? view.summaries.step4 : undefined}
                resetReason={state.steps[4].status === 'reset' ? 'data changed' : undefined}
                onExpand={() => view.handleGoToStep(4)}
              >
                <Step4Style
                  value={state.steps[4].value}
                  chartType={state.steps[1].value}
                  defaultTitle={view.defaultTitle}
                  defaultLegendName={view.defaultLegendName}
                  onChange={view.handleStyleChange}
                />
              </StepCard>
            </aside>

            <div className="overflow-hidden bg-background p-5">
              <ChartPreview
                dataSource={props.dataSource}
                columnConfig={props.report.columnConfig}
                chart={view.previewChart}
                onBucketChange={view.handleBucketChange}
              />
            </div>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  )
}
