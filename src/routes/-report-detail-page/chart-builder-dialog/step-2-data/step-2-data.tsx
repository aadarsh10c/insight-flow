import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useStep2Data } from './step-2-data.hook'
import type { Step2DataProps } from './step-2-data.type'

export const Step2Data = (props: Step2DataProps) => {
  const view = useStep2Data(props)
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-xs">
          {view.chartType === 'line'
            ? 'What do you want to track?'
            : 'What do you want to measure?'}
        </Label>
        <Select value={view.selectedMeasure} onValueChange={view.handleMeasureChange}>
          <SelectTrigger>
            <SelectValue placeholder="Pick a column…" />
          </SelectTrigger>
          <SelectContent>
            {view.measureColumns.map((c) => (
              <SelectItem key={c} value={c}>
                {view.labelFor(c)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {view.chartType !== 'line' && (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {view.chartType === 'pie'
              ? 'How do you want to split it?'
              : 'How do you want to group it?'}
          </Label>
          <Select value={view.selectedGroup} onValueChange={view.handleGroupChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a column…" />
            </SelectTrigger>
            <SelectContent>
              {view.groupOrSplitColumns.map((c) => (
                <SelectItem key={c} value={c}>
                  {view.labelFor(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {view.splitColumnNote && (
            <p className="text-[11px] italic text-muted-foreground">{view.splitColumnNote}</p>
          )}
        </div>
      )}

      {view.chartType === 'line' && (
        <div className="space-y-1.5">
          <Label className="text-xs">Over what period?</Label>
          <Select value={view.selectedDate} onValueChange={view.handleDateChange}>
            <SelectTrigger>
              <SelectValue placeholder="Pick a date column…" />
            </SelectTrigger>
            <SelectContent>
              {view.temporalColumns.map((c) => (
                <SelectItem key={c} value={c}>
                  {view.labelFor(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
