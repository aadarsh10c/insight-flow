import { useCallback } from 'react'
import { useThemeStore } from '@/stores/theme.store'
import type { ThemeMode } from '@/types/theme.type'
import type { SidebarNavItem, SidebarView, UseSidebarParams } from './sidebar.type'

const NAV_ITEMS: ReadonlyArray<SidebarNavItem> = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/datasources', label: 'Data Sources', icon: 'database' },
  { to: '/reports', label: 'Reports', icon: 'file-text' },
  { to: '/styleguide', label: 'Style Guide', icon: 'palette' },
  { to: '/settings', label: 'Settings', icon: 'settings', disabled: true, disabledHint: 'Coming soon' },
]

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

const THEME_LABELS: Record<ThemeMode, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
}

export const useSidebar = (_params?: UseSidebarParams): SidebarView => {
  const themeMode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  const handleCycleTheme = useCallback(() => {
    setMode(NEXT_MODE[themeMode])
  }, [themeMode, setMode])

  return {
    navItems: NAV_ITEMS,
    themeMode,
    themeLabel: THEME_LABELS[themeMode],
    handleCycleTheme,
  }
}
