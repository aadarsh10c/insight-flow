import { Link } from '@tanstack/react-router'
import {
  Database,
  FileText,
  Home,
  Moon,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Sun,
} from 'lucide-react'
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
  light: Sun,
  dark: Moon,
}

export const Sidebar = (props: SidebarProps) => {
  const view = useSidebar(props)
  const ThemeIcon = THEME_ICONS[view.themeMode]
  const ToggleIcon = view.isCollapsed ? PanelLeftOpen : PanelLeftClose

  return (
    <TooltipProvider delayDuration={150}>
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-border bg-surface py-4 transition-[width]',
          view.isCollapsed ? 'w-[60px] px-2' : 'w-[220px] px-3'
        )}
      >
        <div
          className={cn(
            'mb-4 flex items-center gap-2',
            view.isCollapsed ? 'justify-center px-0' : 'px-2'
          )}
        >
          {view.isCollapsed ? (
            <button
              type="button"
              onClick={view.handleToggleCollapse}
              aria-label="Expand sidebar"
              title="Expand sidebar"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent font-bold text-accent-foreground transition-colors hover:bg-accent/90"
            >
              i
            </button>
          ) : (
            <>
              <div className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent font-bold text-accent-foreground">
                i
              </div>
              <span className="flex-1 truncate text-title">InsightFlow</span>
              <button
                type="button"
                onClick={view.handleToggleCollapse}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ToggleIcon className="h-4 w-4" aria-hidden />
              </button>
            </>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {view.navItems.map((item) => {
            const Icon = ICONS[item.icon]
            const linkClass = cn(
              'flex items-center rounded-md text-sm text-foreground transition-colors',
              'hover:bg-muted',
              "aria-[current='page']:bg-accent/10 aria-[current='page']:text-accent aria-[current='page']:font-medium",
              item.disabled && 'pointer-events-none opacity-50',
              view.isCollapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2'
            )

            const link = (
              <Link
                to={item.to}
                disabled={item.disabled}
                aria-disabled={item.disabled}
                className={linkClass}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {!view.isCollapsed && item.label}
              </Link>
            )

            const showTooltip = view.isCollapsed || (item.disabled && item.disabledHint)
            if (!showTooltip) return <div key={item.to}>{link}</div>

            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <span>{link}</span>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {item.disabled && item.disabledHint ? item.disabledHint : item.label}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </nav>

        <div className={cn('mt-auto', view.isCollapsed ? 'px-0' : 'px-2')}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={view.handleToggleTheme}
                className={cn(
                  'flex w-full items-center rounded-md py-2 text-xs text-muted-foreground hover:bg-muted',
                  view.isCollapsed ? 'justify-center px-0' : 'gap-2 px-2'
                )}
                aria-label={`Theme: ${view.themeLabel}`}
              >
                <ThemeIcon className="h-4 w-4 shrink-0" aria-hidden />
                {!view.isCollapsed && <span>{view.themeLabel}</span>}
              </button>
            </TooltipTrigger>
            {view.isCollapsed && <TooltipContent side="right">Theme: {view.themeLabel}</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}
