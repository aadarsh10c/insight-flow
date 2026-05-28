import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Shell } from '@/shell'

const RootComponent = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return isHome ? <Outlet /> : <Shell><Outlet /></Shell>
}

export const Route = createRootRoute({ component: RootComponent })
