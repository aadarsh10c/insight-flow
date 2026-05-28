import { Sidebar } from './sidebar'
import { useShell } from './shell.hook'
import type { ShellProps } from './shell.type'

export const Shell = (props: ShellProps) => {
  const view = useShell(props)
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main id="main" className="flex-1 overflow-y-auto">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-accent focus:px-3 focus:py-1 focus:text-accent-foreground"
        >
          Skip to main
        </a>
        {view.children}
      </main>
    </div>
  )
}
