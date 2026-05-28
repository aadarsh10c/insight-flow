import { useCallback } from 'react'
import { useThemeStore } from '@/stores/theme.store'
import { useUiStore } from '@/stores/ui.store'
import type { ThemeMode } from '@/types/theme.type'
import type { SidebarNavItem, SidebarView, UseSidebarParams } from './sidebar.type'

const NAV_ITEMS: ReadonlyArray<SidebarNavItem> = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/datasources', label: 'Data Sources', icon: 'database' },
  { to: '/reports', label: 'Reports', icon: 'file-text' },
  { to: '/styleguide', label: 'Style Guide', icon: 'palette' },
  { to: '/settings', label: 'Settings', icon: 'settings', disabled: true, disabledHint: 'Coming soon' },
]

const THEME_LABELS: Record<ThemeMode, string> = {
  light: 'Light',
  dark: 'Dark',
}

export const useSidebar = (_params?: UseSidebarParams): SidebarView => {
  const themeMode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const isCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUiStore((s) => s.toggleSidebar)

  const handleToggleTheme = useCallback(() => {
    setMode(themeMode === 'light' ? 'dark' : 'light')
  }, [themeMode, setMode])

  return {
    navItems: NAV_ITEMS,
    themeMode,
    themeLabel: THEME_LABELS[themeMode],
    isCollapsed,
    handleToggleTheme,
    handleToggleCollapse: toggleSidebar,
  }
}
