import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ResolvedTheme, ThemeMode } from '@/types/theme.type'

type ThemeState = {
  mode: ThemeMode
  resolved: ResolvedTheme
}

type ThemeActions = {
  setMode: (mode: ThemeMode) => void
  _recomputeFromSystem: () => void
}

const resolveMode = (mode: ThemeMode): ResolvedTheme => {
  if (mode !== 'system') return mode
  if (typeof matchMedia === 'undefined') return 'light'
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState & ThemeActions>()(
  persist(
    (set, get) => ({
      mode: 'system',
      resolved: resolveMode('system'),
      setMode: (mode) => set({ mode, resolved: resolveMode(mode) }),
      _recomputeFromSystem: () => {
        if (get().mode === 'system') set({ resolved: resolveMode('system') })
      },
    }),
    {
      name: 'insightflow:theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ mode: s.mode }) as ThemeState,
      onRehydrateStorage: () => (state) => {
        if (state) state.resolved = resolveMode(state.mode)
      },
    }
  )
)

// Subscribe to resolved-theme changes and write .dark on <html>.
// This is the ONE DOM imperative side-effect in the codebase, intentionally outside React.
if (typeof document !== 'undefined') {
  useThemeStore.subscribe((state, prev) => {
    if (state.resolved !== prev.resolved) {
      document.documentElement.classList.toggle('dark', state.resolved === 'dark')
    }
  })

  // Listen for system preference changes — only meaningful when mode === 'system'.
  if (typeof matchMedia !== 'undefined') {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      useThemeStore.getState()._recomputeFromSystem()
    })
  }
}
