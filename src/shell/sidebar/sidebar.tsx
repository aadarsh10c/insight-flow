import { Link } from '@tanstack/react-router'
import { Database, FileText, Home, Monitor, Moon, Palette, Settings, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from './sidebar.hook'
import type { SidebarIconKey, SidebarProps } from './sidebar.type'
import type { ThemeMode } from '@/types/theme.type'

const ICONS: Record<SidebarIconKey, LucideIcon> = {
  home: Home,
  database: Database,
  'file-text': FileText,
  palette: Palette,
  settings: Settings,
}

const THEME_ICONS: Record<ThemeMode, LucideIcon> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

export const Sidebar = (props: SidebarProps) => {
  const view = useSidebar(props)
  const ThemeIcon = THEME_ICONS[view.themeMode]

  return (
    <TooltipProvider>
      <aside className="flex h-screen w-[220px] flex-col border-r border-border bg-surface px-3 py-4">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-accent font-bold text-accent-foreground">
            i
          </div>
          <span className="font-serif text-base font-semibold">InsightFlow</span>
        </div>

        <nav className="flex flex-col gap-1">
          {view.navItems.map((item) => {
            const Icon = ICONS[item.icon]
            const baseClass = cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors',
              'hover:bg-muted',
              "aria-[current='page']:bg-accent/10 aria-[current='page']:text-accent aria-[current='page']:font-medium",
              item.disabled && 'pointer-events-none opacity-50'
            )

            const inner = (
              <Link to={item.to} disabled={item.disabled} aria-disabled={item.disabled} className={baseClass}>
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            )

            if (item.disabled && item.disabledHint) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>
                    <span>{inner}</span>
                  </TooltipTrigger>
                  <TooltipContent>{item.disabledHint}</TooltipContent>
                </Tooltip>
              )
            }
            return <div key={item.to}>{inner}</div>
          })}
        </nav>

        <div className="mt-auto px-2">
          <button
            type="button"
            onClick={view.handleCycleTheme}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted"
            aria-label={`Theme: ${view.themeLabel}`}
          >
            <ThemeIcon className="h-4 w-4" aria-hidden />
            <span>{view.themeLabel}</span>
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
