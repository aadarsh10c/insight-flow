# Phase 06 — Style Guide route

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Ship `/styleguide` — a read-only route that renders every token, scale, and component example **live** in the running app. Mirrors `docs/StyleGuide.md` at runtime. Lets anyone (humans, agents) verify the design system without leaving the app.

**Architecture:** One page module with section sub-modules. Each section is small + pure presentation. Heavy reuse of the shared primitives built in Phases 01-05 (`TypeBadge`, `AppliedFilterChips`, `StepCard`, `FilterRow`, `ConfirmDialog`). No new state — the page reads from `theme.store` so toggling theme demonstrates the system live.

**Tech Stack:** Same as prior phases.

**Reference docs:** `docs/StyleGuide.md` (sections 1-15 are the spec to mirror). Whitepaper §3 (architecture — /styleguide is a route).

---

## Pre-conditions

- Phase 05 exit criteria pass · `git tag phase-05-complete` exists
- Shared primitives from Phase 05 exist (`TypeBadge`, `AppliedFilterChips`, `StepCard`, `FilterRow`)

---

## Exit criteria

- [ ] `/styleguide` route renders inside the shell (sidebar active item = Style Guide)
- [ ] Page has a sticky table-of-contents on the left of main content (or anchor links at top)
- [ ] All 15 sections from `StyleGuide.md` are rendered:
   1. Philosophy
   2. Theme (light/dark live demo)
   3. Color tokens (swatch grid · light + dark side-by-side)
   4. Type scale (every size rendered at its purpose)
   5. Spacing scale (visualized bars)
   6. Border radius scale (5 sample tiles)
   7. Elevation (L1/L2/L3/L4 demo)
   8. Shadows (sample cards)
   9. Iconography (size scale + stroke comparison)
   10. Focus rings (interactive sample button + input)
   11. Motion (duration tokens demoed via hover transitions)
   12. Plotly palette (categorical + sequential, both modes)
   13. Component examples (Button, Input, Card, Dialog trigger, Badge, Tooltip, Select, Table)
   14. Shared primitives (TypeBadge, AppliedFilterChips example, StepCard 3 states, FilterRow example)
   15. The Rulebook (text — 6 principles)
- [ ] Toggling theme via sidebar instantly updates every swatch + sample on the page (no reload)
- [ ] No new tokens or component overrides created — every example references the same tokens production uses
- [ ] Phase 06 tests pass · `typecheck`, `lint`, `build` green

---

## File structure created in this phase

```
src/
└── routes/
    ├── styleguide.tsx                              # route file
    └── -styleguide-page/
        ├── index.ts
        ├── styleguide-page.{tsx,hook.ts,type.ts}
        ├── styleguide-section/                     # generic section wrapper
        │   └── styleguide-section.{tsx,type.ts}
        ├── section-color-tokens/
        ├── section-type-scale/
        ├── section-spacing/
        ├── section-radius/
        ├── section-elevation/
        ├── section-shadows/
        ├── section-icons/
        ├── section-focus/
        ├── section-motion/
        ├── section-plotly-palette/
        ├── section-components/
        └── section-shared-primitives/
```

> Section modules are small (most are ~30-60 lines including types). They each export one component that the page composes in order. Resist the urge to extract a "section base class" — just compose.

---

## Tasks

### Task 1: Generic `<StyleguideSection>` wrapper

A tiny container that gives every section: anchor id · serif heading · muted description · spacing. Reused 12+ times.

**Files:** 4-file module under `-styleguide-page/styleguide-section/`

```tsx
// styleguide-section.tsx
import type { ReactNode } from 'react'
export type StyleguideSectionProps = { id: string; title: string; description?: string; children: ReactNode }

export const StyleguideSection = ({ id, title, description, children }: StyleguideSectionProps) => (
  <section id={id} className="space-y-3 scroll-mt-16">
    <header>
      <h2 className="font-serif text-2xl font-semibold">{title}</h2>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </header>
    <div>{children}</div>
  </section>
)
```

- [ ] Commit:

```bash
git commit -m "feat(styleguide): section wrapper"
```

---

### Task 2: Section — Color tokens

Renders semantic palette as a swatch grid. **Important:** swatch backgrounds use the actual CSS custom properties — toggling theme live-updates the grid.

```tsx
// section-color-tokens.tsx (sketch)
const TOKENS = ['background', 'foreground', 'surface', 'surface-2', 'muted', 'muted-foreground', 'border', 'accent', 'accent-foreground', 'success', 'warning', 'destructive'] as const

export const SectionColorTokens = () => (
  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
    {TOKENS.map((name) => (
      <div key={name} className="rounded-md border border-border p-3" style={{ background: `var(--${name})` }}>
        <div className="font-mono text-[11px] font-medium" style={{ color: name === 'background' || name === 'surface' ? 'var(--foreground)' : 'var(--accent-foreground)' }}>--{name}</div>
      </div>
    ))}
  </div>
)
```

- [ ] Commit:

```bash
git commit -m "feat(styleguide): color tokens section"
```

---

### Task 3: Sections — Type scale · Spacing · Radius

Three small visual sections. Each ~30-50 lines.

- **Type scale:** render every entry from `StyleGuide.md §4` as a literal demonstration ("Sales Dashboard" at display, "Create Chart" at title, etc.)
- **Spacing:** a list of bars — each row labeled `space-N (Npx)` with a fill at that exact width
- **Radius:** 5 sample tiles at each radius value with the token name printed inside

- [ ] Build all 3 modules
- [ ] Commit:

```bash
git commit -m "feat(styleguide): type · spacing · radius sections"
```

---

### Task 4: Sections — Elevation · Shadows · Icons

- **Elevation:** 4 sample boxes labeled L1/L2/L3/L4 stacked vertically with appropriate shadow + border per StyleGuide §7. L4 toast example uses `bg-foreground text-background`.
- **Shadows:** 3 cards each labeled `shadow-sm`, `shadow-md`, `shadow-lg` with the right shadow token applied.
- **Icons:** size scale (14/16/18/20/24/32) rendered live with Lucide `Clock` icon · stroke comparison row with `Square` icon at 1.5 vs 2.0

- [ ] Build all 3 modules
- [ ] Commit:

```bash
git commit -m "feat(styleguide): elevation · shadows · icons sections"
```

---

### Task 5: Sections — Focus · Motion

- **Focus:** A `<Button>` + `<Input>` rendered live — user clicks/tabs to them to see focus rings. Annotation text below describes the rule.
- **Motion:** Three demo boxes that animate on hover at `duration-fast`, `duration-base`, `duration-slow` — gives the user a feel for the timing. Plus the `prefers-reduced-motion` note.

- [ ] Build both modules
- [ ] Commit:

```bash
git commit -m "feat(styleguide): focus · motion sections"
```

---

### Task 6: Section — Plotly palette

Render the 6 categorical swatches as colored tiles (with hex labels) + a mini bar chart using all 6 + a mini bar chart using only the accent (sequential).

> Use `getCategoricalPalette()` and `getPlotlyLayout(resolved)` from `lib/plotly-theme.ts` — never duplicate the values.

- [ ] Build module
- [ ] Commit:

```bash
git commit -m "feat(styleguide): Plotly palette section"
```

---

### Task 7: Section — Component examples

Live rendering of every shadcn component we actually use:
- `<Button>` — primary, outline, ghost, destructive · default + small + icon-only
- `<Input>` — empty + filled + error states
- `<Textarea>`
- `<Select>` (open state via mock if practical)
- `<Badge>` — neutral + accent
- `<Card>` — sample with title + content
- `<Tooltip>` — sample button with tooltip on hover
- `<Dialog>` — a trigger button that opens a tiny example modal
- `<Table>` — 3-row example with our column conventions

- [ ] Build module
- [ ] Commit:

```bash
git commit -m "feat(styleguide): component examples section"
```

---

### Task 8: Section — Shared primitives

Live examples of the primitives built in Phase 05:
- `<TypeBadge type="category" />` etc. — all 4 types
- `<AppliedFilterChips>` — sample with 2 chips
- `<StepCard>` — 3 cards showing locked / active / complete states
- `<FilterRow>` — interactive sample with mock data

- [ ] Build module
- [ ] Commit:

```bash
git commit -m "feat(styleguide): shared primitives section"
```

---

### Task 9: Section — Philosophy · Theme · Rulebook (text-heavy)

Three text-mostly sections:
- **Philosophy** — render the 6 numbered principles from StyleGuide §1 as a `<ol>` with serif headings
- **Theme** — short paragraph + live theme cycle button (mounted from sidebar, but include a duplicate trigger here for visibility) — actually this might just describe + link to sidebar
- **Rulebook** — the 6 hard rules from StyleGuide §13 as a numbered list

- [ ] Build all 3 modules
- [ ] Commit:

```bash
git commit -m "feat(styleguide): philosophy · theme · rulebook sections"
```

---

### Task 10: Page module + route file

Compose all sections in order. Sticky table-of-contents on the left if implementation time permits; otherwise anchor links at top.

```tsx
// styleguide-page.tsx (sketch)
const SECTIONS: Array<{ id: string; label: string }> = [
  { id: 'philosophy', label: '1. Philosophy' },
  { id: 'theme', label: '2. Theme' },
  { id: 'colors', label: '3. Colors' },
  { id: 'type', label: '4. Type' },
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
]

export const StyleguidePage = () => (
  <div className="mx-auto max-w-5xl px-8 py-8 grid grid-cols-[180px_1fr] gap-10">
    <nav className="sticky top-8 self-start space-y-1">
      {SECTIONS.map((s) => (
        <a key={s.id} href={`#${s.id}`} className="block rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
          {s.label}
        </a>
      ))}
    </nav>
    <main className="space-y-12">
      <SectionPhilosophy />
      <SectionTheme />
      <SectionColorTokens />
      <SectionTypeScale />
      <SectionSpacing />
      <SectionRadius />
      <SectionElevation />
      <SectionShadows />
      <SectionIcons />
      <SectionFocus />
      <SectionMotion />
      <SectionPlotlyPalette />
      <SectionComponents />
      <SectionSharedPrimitives />
      <SectionRulebook />
    </main>
  </div>
)
```

```tsx
// routes/styleguide.tsx
import { createFileRoute } from '@tanstack/react-router'
import { StyleguidePage } from './-styleguide-page'
const StyleguideRouteComponent = () => <StyleguidePage />
export const Route = createFileRoute('/styleguide')({ component: StyleguideRouteComponent })
```

- [ ] Build the page module + route
- [ ] Test: navigate to `/styleguide` · scroll through · toggle theme · verify all sections update
- [ ] Commit:

```bash
git commit -m "feat(routes): /styleguide page composing all sections"
```

---

### Task 11: Phase 06 verification

- [ ] `npm test && npm run typecheck && npm run lint && npm run build`
- [ ] Manual smoke:
  - Navigate to `/styleguide` · all 15 sections visible
  - Toggle theme in sidebar · every section updates
  - Click TOC anchor links · scrolls to section
  - All component examples render correctly
- [ ] Tag:

```bash
git tag phase-06-complete
```

---

## Phase 06 done

Style Guide route ships. Move to `07-polish-and-deploy.md`.
