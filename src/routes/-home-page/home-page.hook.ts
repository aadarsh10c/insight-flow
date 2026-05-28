import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToastStore } from '@/stores/toast.store'
import type { HomePageView, UseHomePageParams } from './home-page.type'
import { FEATURES, HEADLINE, SUBHEADLINE } from './home-page.utils'

export const useHomePage = (_params?: UseHomePageParams): HomePageView => {
  const navigate = useNavigate()
  const showToast = useToastStore((s) => s.show)
  const [isSeeding, setIsSeeding] = useState(false)

  const handleGetStarted = useCallback(() => {
    navigate({ to: '/datasources' })
  }, [navigate])

  const handleTrySampleData = useCallback(async () => {
    setIsSeeding(true)
    try {
      const { seedSampleDataSource } = await import('@/lib/sample-data/seed')
      await seedSampleDataSource()
      navigate({ to: '/datasources' })
    } catch (err) {
      showToast({
        variant: 'destructive',
        title: 'Could not load sample data',
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    } finally {
      setIsSeeding(false)
    }
  }, [navigate, showToast])

  return {
    isSeeding,
    headline: HEADLINE,
    subheadline: SUBHEADLINE,
    features: FEATURES,
    handleGetStarted,
    handleTrySampleData,
  }
}
