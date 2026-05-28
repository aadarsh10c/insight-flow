import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ThemeMode } from '@/types/theme.type'

type ThemeState = {
  mode: ThemeMode
  resolved: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const detectInitialMode = (): ThemeMode => {
  if (typeof matchMedia === 'undefined') return 'light'
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: detectInitialMode(),
      resolved: detectInitialMode(),
      setMode: (mode) => set({ mode, resolved: mode }),
    }),
    {
      name: 'insightflow:theme',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ mode: s.mode }) as ThemeState,
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Migrate legacy 'system' (or any invalid) value to detected mode.
        if (state.mode !== 'light' && state.mode !== 'dark') {
          state.mode = detectInitialMode()
        }
        state.resolved = state.mode
      },
    }
  )
)

// Subscribe to mode changes and write .dark on <html>.
if (typeof document !== 'undefined') {
  useThemeStore.subscribe((state, prev) => {
    if (state.resolved !== prev.resolved) {
      document.documentElement.classList.toggle('dark', state.resolved === 'dark')
    }
  })
}
