import { DayPicker, type DayPickerProps } from 'react-day-picker'
import 'react-day-picker/style.css'
import { cn } from '@/lib/utils/cn'

export const Calendar = ({ className, classNames, ...props }: DayPickerProps) => (
  <DayPicker
    className={cn('rdp-root p-3 text-sm', className)}
    classNames={{
      selected: '[&_button]:bg-accent [&_button]:text-white [&_button]:hover:bg-accent/90',
      today: '[&_button]:ring-1 [&_button]:ring-accent/40 [&_button]:font-semibold',
      range_start:
        '[&_button]:bg-accent [&_button]:text-white [&_button]:rounded-l-md [&_button]:rounded-r-none',
      range_end:
        '[&_button]:bg-accent [&_button]:text-white [&_button]:rounded-r-md [&_button]:rounded-l-none',
      range_middle:
        '[&_button]:bg-accent/15 [&_button]:text-foreground [&_button]:rounded-none',
      ...classNames,
    }}
    {...props}
  />
)
