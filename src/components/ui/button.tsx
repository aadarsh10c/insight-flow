import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  [
    // Layout
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium',
    // Icon defaults
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    // Focus ring — keyboard only
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    // Transitions — responsive feel
    'transition-all duration-150 ease-out',
    // Active state — subtle press
    'active:scale-[0.98]',
    // Disabled
    'disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100',
  ],
  {
    variants: {
      variant: {
        // Primary — filled brand accent
        default: 'bg-accent text-accent-foreground shadow-sm hover:bg-accent/90 active:bg-accent/95',
        // Destructive — filled red
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/95',
        // Outline — bordered, hover fills muted
        outline:
          'border border-border bg-surface text-foreground shadow-sm hover:bg-muted hover:border-border active:bg-muted/80',
        // Secondary — muted fill
        secondary:
          'bg-muted text-foreground shadow-sm hover:bg-muted/70 active:bg-muted/60',
        // Ghost — no background until hover
        ghost: 'text-foreground hover:bg-muted active:bg-muted/70',
        // Link — looks like a link
        link: 'text-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
