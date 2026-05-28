import {
  SectionColors,
  SectionComponents,
  SectionElevation,
  SectionFocus,
  SectionIcons,
  SectionMotion,
  SectionPhilosophy,
  SectionPlotlyPalette,
  SectionPrimitives,
  SectionRadius,
  SectionRulebook,
  SectionShadows,
  SectionSpacing,
  SectionTheme,
  SectionTypography,
} from './sections'

const TOC = [
  { id: 'philosophy', label: '1. Philosophy' },
  { id: 'theme', label: '2. Theme' },
  { id: 'colors', label: '3. Colors' },
  { id: 'type', label: '4. Typography' },
  { id: 'spacing', label: '5. Spacing' },
  { id: 'radius', label: '6. Radius' },
  { id: 'elevation', label: '7. Elevation' },
  { id: 'shadows', label: '8. Shadows' },
  { id: 'icons', label: '9. Icons' },
  { id: 'focus', label: '10. Focus' },
  { id: 'motion', label: '11. Motion' },
  { id: 'plotly', label: '12. Plotly palette' },
  { id: 'components', label: '13. Components' },
  { id: 'primitives', label: '14. Shared primitives' },
  { id: 'rulebook', label: '15. Rulebook' },
] as const

export const StyleguidePage = () => (
  <div className="px-8 py-8">
    <header className="mb-6 space-y-1">
      <h1 className="text-title">Style Guide</h1>
      <p className="text-small text-muted-foreground">
        Every token and primitive live in the running app. Toggle theme in the sidebar to see all sections update.
      </p>
    </header>

    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[180px_1fr]">
      <nav className="hidden self-start lg:sticky lg:top-6 lg:block">
        <ul className="space-y-0.5">
          {TOC.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded-md px-2 py-1 text-small text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main className="min-w-0 space-y-12">
        <SectionPhilosophy />
        <SectionTheme />
        <SectionColors />
        <SectionTypography />
        <SectionSpacing />
        <SectionRadius />
        <SectionElevation />
        <SectionShadows />
        <SectionIcons />
        <SectionFocus />
        <SectionMotion />
        <SectionPlotlyPalette />
        <SectionComponents />
        <SectionPrimitives />
        <SectionRulebook />
      </main>
    </div>
  </div>
)
