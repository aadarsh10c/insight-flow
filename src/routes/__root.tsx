import { createRootRoute, Outlet, useLocation, useRouterState } from '@tanstack/react-router'
import { Shell } from '@/shell'

const RootComponent = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isNavigating = useRouterState({ select: (s) => s.isLoading })
  return (
    <div
      data-navigating={isNavigating || undefined}
      className="data-[navigating]:[filter:grayscale(1)_opacity(0.7)]"
    >
      {isHome ? <Outlet /> : <Shell><Outlet /></Shell>}
    </div>
  )
}

export const Route = createRootRoute({ component: RootComponent })
