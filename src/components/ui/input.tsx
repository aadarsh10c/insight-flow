import * as React from 'react'

import { cn } from '@/lib/utils/cn'

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Layout
          'flex h-10 w-full rounded-md px-3 py-2 text-base md:text-sm',
          // Surface + border
          'border border-input bg-surface text-foreground',
          // File input handling
          'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
          // Placeholder
          'placeholder:text-muted-foreground',
          // Focus: border swaps to accent + soft glow (no offset gap)
          'transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20',
          // Disabled
          'disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
