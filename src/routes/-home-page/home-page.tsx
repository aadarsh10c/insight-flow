import { ArrowRight, BarChart3, Check, Database, Sparkles } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useHomePage } from './home-page.hook'
import type { HomePageProps } from './home-page.type'

const FEATURE_ICONS: Record<'upload' | 'chart' | 'check', LucideIcon> = {
  upload: Database,
  chart: BarChart3,
  check: Check,
}

export const HomePage = (props: HomePageProps) => {
  const view = useHomePage(props)

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 70%)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-accent font-bold text-accent-foreground">
            i
          </div>
          <span className="text-title">InsightFlow</span>
        </div>
        <a
          href="/styleguide"
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Style Guide
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pt-16 pb-12 text-center">
        <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
          {view.headline}
        </h1>
        <p className="mt-6 text-base text-muted-foreground md:text-lg">{view.subheadline}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
          <Button size="lg" onClick={view.handleGetStarted}>
            Get started
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={view.handleTrySampleData}
            disabled={view.isSeeding}
          >
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            {view.isSeeding ? 'Loading sample…' : 'Try with sample data'}
          </Button>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-border bg-surface p-6 shadow-sm md:grid-cols-3">
          {view.features.map((feature) => {
            const Icon = FEATURE_ICONS[feature.icon]
            return (
              <div key={feature.title} className="flex flex-col gap-2">
                <div className="grid h-8 w-8 place-items-center rounded-lg bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" aria-hidden />
                </div>
                <div className="text-sm font-semibold">{feature.title}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </div>
            )
          })}
        </div>
      </section>

      <footer className="relative z-10 border-t border-border px-12 py-6 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>InsightFlow</span>
          <span>v0.1</span>
        </div>
      </footer>
    </div>
  )
}
