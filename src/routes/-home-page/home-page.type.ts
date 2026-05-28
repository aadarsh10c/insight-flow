export type HomePageProps = Record<string, never>

export type UseHomePageParams = HomePageProps

export type HomePageView = {
  isSeeding: boolean
  headline: string
  subheadline: string
  features: ReadonlyArray<{ title: string; description: string; icon: 'upload' | 'chart' | 'check' }>
  handleGetStarted: () => void
  handleTrySampleData: () => Promise<void>
}
