import type { ThemeMode } from '@/types/theme.type'

export type SidebarIconKey = 'home' | 'database' | 'file-text'

export type SidebarNavItem = {
  to: string
  label: string
  icon: SidebarIconKey
  disabled?: boolean
  disabledHint?: string
}

export type SidebarProps = Record<string, never>

export type UseSidebarParams = SidebarProps

export type SidebarView = {
  navItems: ReadonlyArray<SidebarNavItem>
  themeMode: ThemeMode
  themeLabel: string
  isCollapsed: boolean
  handleToggleTheme: () => void
  handleToggleCollapse: () => void
}
