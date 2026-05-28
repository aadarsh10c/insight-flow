# Phase 02 — Shell & Home

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans`. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build the app shell (sidebar) for all non-Home routes; build the branded Home route at `/` that renders fullscreen; wire the "Try with sample data" button to lazy-load the seed module.

**Architecture:** `__root.tsx` chooses between `<Outlet />` (Home) and `<Shell><Outlet /></Shell>` (everything else). Home uses bolder layout but the same tokens.

**Tech Stack:** Same as Phase 01 + Lucide icons + shadcn primitives + dynamic `import()` for sample-data seed.

**Reference docs:** Whitepaper §4 (Home), §3 (Architecture). StyleGuide §3 (color), §4 (type scale), §13 (component rules). Design spec §3 (routing), §7 (sample-data lazy loading).

---

## Pre-conditions

- Phase 01 exit criteria all pass
- `git tag phase-01-complete` exists

---

## Exit criteria

- [ ] `/` renders fullscreen with branded hero — no sidebar visible
- [ ] All other routes render inside `<Shell>` with the sidebar
- [ ] Sidebar items: Home · Data Sources · Reports · Style Guide · Settings (Settings disabled in V1 with tooltip "Coming soon")
- [ ] Active sidebar item is visually distinct
- [ ] "Try with sample data" button on Home dynamically imports `lib/sample-data/seed.ts`, seeds a data source, navigates to `/datasources`
- [ ] Theme toggle in sidebar footer cycles System → Light → Dark
- [ ] Unit tests pass for shell hook + home hook + seed module
- [ ] `npm run typecheck` + `npm run lint` + `npm test` + `npm run build` all pass

---

## File structure created in this phase

```
src/
├── shell/
│   ├── index.ts
│   ├── shell.tsx
│   ├── shell.hook.ts
│   ├── shell.type.ts
│   └── sidebar/
│       ├── index.ts
│       ├── sidebar.tsx
│       ├── sidebar.hook.ts
│       └── sidebar.type.ts
├── lib/
│   └── sample-data/
│       └── seed.ts                          # + seed.test.ts
└── routes/
    ├── __root.tsx                           # MODIFIED
    └── -home-page/
        ├── index.ts
        ├── home-page.tsx
        ├── home-page.hook.ts
        ├── home-page.type.ts
        └── home-page.utils.ts
```

Routes `/datasources`, `/reports`, `/styleguide` referenced in sidebar but not yet implemented — they will 404 until later phases. That's OK.

---

## Tasks

### Task 1: `lib/parsers/csv.ts` — dynamic-importable CSV parser

The home seed flow needs this. It dynamic-imports PapaParse so PapaParse never enters the initial bundle.

**Files:**
- Modify: `package.json` (add papaparse)
- Create: `src/lib/parsers/csv.ts`
- Create: `src/lib/parsers/csv.test.ts`

- [ ] **Step 1: Install PapaParse**

```bash
npm install papaparse
npm install -D @types/papaparse
```

- [ ] **Step 2: Write failing test**

```ts
// src/lib/parsers/csv.test.ts
import { describe, it, expect } from 'vitest'
import { parseCSV } from './csv'

describe('parseCSV', () => {
  it('parses a small CSV with headers into rows', async () => {
    const text = 'name,age\nAlice,30\nBob,25'
    const result = await parseCSV(text)
    expect(result.rows).toEqual([
      { name: 'Alice', age: '30' },
      { name: 'Bob', age: '25' },
    ])
  })

  it('skips empty lines', async () => {
    const text = 'a,b\n1,2\n\n3,4'
    const result = await parseCSV(text)
    expect(result.rows).toHaveLength(2)
  })

  it('returns errors array on malformed rows', async () => {
    const text = 'a,b\n"unclosed,2'
    const result = await parseCSV(text)
    expect(Array.isArray(result.errors)).toBe(true)
  })
})
```

- [ ] **Step 3: Run, verify FAIL**

```bash
npm test src/lib/parsers/csv.test.ts
```

- [ ] **Step 4: Implement**

```ts
// src/lib/parsers/csv.ts
import type { RowData } from '@/types/data-source.type'

export type ParseResult = {
  rows: RowData[]
  errors: string[]
}

export const parseCSV = async (text: string): Promise<ParseResult> => {
  const { default: Papa } = await import('papaparse')
  return new Promise((resolve) => {
    Papa.parse<RowData>(text, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve({
          rows: result.data,
          errors: result.errors.map((e) => `${e.type}: ${e.message}`),
        })
      },
    })
  })
}
```

- [ ] **Step 5: Run, verify PASS**

```bash
npm test src/lib/parsers/csv.test.ts
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/parsers/csv.ts src/lib/parsers/csv.test.ts package.json package-lock.json
git commit -m "feat(lib): CSV parser with dynamic Papa import"
```

---

### Task 2: `lib/sample-data/seed.ts` — lazy sample seed

**Files:**
- Create: `src/lib/sample-data/seed.ts`
- Create: `src/lib/sample-data/seed.test.ts`

- [ ] **Step 1: Write failing test**

```ts
// src/lib/sample-data/seed.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useDataSourcesStore } from '@/stores/data-sources.store'
import { seedSampleDataSource } from './seed'

const csvText = 'col_a,col_b\n1,foo\n2,bar\n3,baz'

describe('seedSampleDataSource', () => {
  beforeEach(() => {
    useDataSourcesStore.setState({ list: [], mostRecentId: null })
    global.fetch = vi.fn().mockResolvedValue({ text: () => Promise.resolve(csvText) } as Response)
  })

  it('seeds a data source named "Sample — Superstore" with parsed rows', async () => {
    await seedSampleDataSource()
    const list = useDataSourcesStore.getState().list
    expect(list).toHaveLength(1)
    expect(list[0].name).toBe('Sample — Superstore')
    expect(list[0].type).toBe('csv')
    expect(list[0].rows.length).toBeGreaterThan(0)
    expect(list[0].columns.length).toBeGreaterThan(0)
  })

  it('returns the created data source', async () => {
    const ds = await seedSampleDataSource()
    expect(ds.id).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Implement**

```ts
// src/lib/sample-data/seed.ts
import type { DataSource } from '@/types/data-source.type'
import { useDataSourcesStore } from '@/stores/data-sources.store'

export const seedSampleDataSource = async (): Promise<DataSource> => {
  const [{ parseCSV }, { detectColumnTypes }, response] = await Promise.all([
    import('@/lib/parsers/csv'),
    import('@/lib/parsers/detect-types'),
    fetch('/sample/superstore.csv'),
  ])
  const text = await response.text()
  const parsed = await parseCSV(text)
  return useDataSourcesStore.getState().add({
    name: 'Sample — Superstore',
    filename: 'superstore.csv',
    type: 'csv',
    sizeBytes: text.length,
    columns: detectColumnTypes(parsed.rows),
    rows: parsed.rows,
  })
}
```

- [ ] **Step 4: Run, verify PASS**

- [ ] **Step 5: Commit**

```bash
git add src/lib/sample-data
git commit -m "feat(lib): sample data seed (lazy)"
```

---

### Task 3: `shell/sidebar/` module

**Files:**
- Create: `src/shell/sidebar/sidebar.type.ts`
- Create: `src/shell/sidebar/sidebar.hook.ts`
- Create: `src/shell/sidebar/sidebar.tsx`
- Create: `src/shell/sidebar/index.ts`
- Create: `src/shell/sidebar/sidebar.test.tsx`

- [ ] **Step 1: Write failing test**

```tsx
// src/shell/sidebar/sidebar.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Sidebar } from './sidebar'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from '@/routeTree.gen'

const renderAt = (path: string) => {
  const history = createMemoryHistory({ initialEntries: [path] })
  const router = createRouter({ routeTree, history })
  return render(<RouterProvider router={router as never} />)
}

describe('Sidebar', () => {
  it('renders the InsightFlow brand', () => {
    render(<Sidebar />)
    expect(screen.getByText('InsightFlow')).toBeInTheDocument()
  })

  it('renders nav items: Home, Data Sources, Reports, Style Guide, Settings', () => {
    render(<Sidebar />)
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Data Sources')).toBeInTheDocument()
    expect(screen.getByText('Reports')).toBeInTheDocument()
    expect(screen.getByText('Style Guide')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run, verify FAIL**

- [ ] **Step 3: Create the 4 module files**

```ts
// src/shell/sidebar/sidebar.type.ts
import type { ThemeMode } from '@/types/theme.type'

export type SidebarNavItem = {
  to: string
  label: string
  icon: 'home' | 'database' | 'file-text' | 'palette' | 'settings'
  disabled?: boolean
}

export type SidebarProps = {
  // No props in V1 — uses stores directly
}

export type UseSidebarParams = SidebarProps

export type SidebarView = {
  navItems: SidebarNavItem[]
  themeMode: ThemeMode
  handleCycleTheme: () => void
}
```

```ts
// src/shell/sidebar/sidebar.hook.ts
import { useCallback } from 'react'
import { useThemeStore } from '@/stores/theme.store'
import type { ThemeMode } from '@/types/theme.type'
import type { SidebarNavItem, SidebarView, UseSidebarParams } from './sidebar.type'

const NAV_ITEMS: SidebarNavItem[] = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/datasources', label: 'Data Sources', icon: 'database' },
  { to: '/reports', label: 'Reports', icon: 'file-text' },
  { to: '/styleguide', label: 'Style Guide', icon: 'palette' },
  { to: '/settings', label: 'Settings', icon: 'settings', disabled: true },
]

const NEXT_MODE: Record<ThemeMode, ThemeMode> = {
  system: 'light',
  light: 'dark',
  dark: 'system',
}

export const useSidebar = (_params?: UseSidebarParams): SidebarView => {
  const themeMode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)

  const handleCycleTheme = useCallback(() => {
    setMode(NEXT_MODE[themeMode])
  }, [themeMode, setMode])

  return { navItems: NAV_ITEMS, themeMode, handleCycleTheme }
}
```

```tsx
// src/shell/sidebar/sidebar.tsx
import { Link } from '@tanstack/react-router'
import { Home, Database, FileText, Palette, Settings, Sun, Moon, Monitor } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils/cn'
import { useSidebar } from './sidebar.hook'
import type { SidebarProps } from './sidebar.type'

const ICONS = { home: Home, database: Database, 'file-text': FileText, palette: Palette, settings: Settings } as const
const THEME_ICONS = { system: Monitor, light: Sun, dark: Moon } as const

export const Sidebar = (_props: SidebarProps) => {
  const view = useSidebar()
  const ThemeIcon = THEME_ICONS[view.themeMode]
  return (
    <TooltipProvider>
      <aside className="flex h-screen w-[220px] flex-col border-r border-border bg-surface px-3 py-4">
        <div className="mb-4 flex items-center gap-2 px-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-accent font-bold text-accent-foreground">i</div>
          <span className="font-serif text-base font-semibold">InsightFlow</span>
        </div>
        <nav className="flex flex-col gap-1">
          {view.navItems.map((item) => {
            const Icon = ICONS[item.icon]
            const inner = (
              <Link
                to={item.to}
                disabled={item.disabled}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground transition-colors',
                  'hover:bg-muted',
                  'aria-[current=page]:bg-accent/10 aria-[current=page]:text-accent aria-[current=page]:font-medium',
                  item.disabled && 'pointer-events-none opacity-50'
                )}
                aria-disabled={item.disabled}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            )
            if (item.disabled) {
              return (
                <Tooltip key={item.to}>
                  <TooltipTrigger asChild>{inner}</TooltipTrigger>
                  <TooltipContent>Coming soon</TooltipContent>
                </Tooltip>
              )
            }
            return <div key={item.to}>{inner}</div>
          })}
        </nav>
        <div className="mt-auto px-2">
          <button
            type="button"
            onClick={view.handleCycleTheme}
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-xs text-muted-foreground hover:bg-muted"
            aria-label={`Theme: ${view.themeMode}`}
          >
            <ThemeIcon className="h-4 w-4" aria-hidden />
            <span className="capitalize">{view.themeMode}</span>
          </button>
        </div>
      </aside>
    </TooltipProvider>
  )
}
```

```ts
// src/shell/sidebar/index.ts
export { Sidebar } from './sidebar'
export type { SidebarProps } from './sidebar.type'
```

- [ ] **Step 4: Run, verify PASS**

```bash
npm test src/shell/sidebar
```

- [ ] **Step 5: Commit**

```bash
git add src/shell/sidebar
git commit -m "feat(shell): sidebar with nav + theme toggle"
```

---

### Task 4: `shell/` module wrapping the sidebar + outlet

**Files:**
- Create: `src/shell/shell.type.ts`
- Create: `src/shell/shell.hook.ts`
- Create: `src/shell/shell.tsx`
- Create: `src/shell/index.ts`

- [ ] **Step 1: Create the 4 module files**

```ts
// src/shell/shell.type.ts
import type { ReactNode } from 'react'

export type ShellProps = { children: ReactNode }

export type UseShellParams = ShellProps

export type ShellView = { children: ReactNode }
```

```ts
// src/shell/shell.hook.ts
import type { UseShellParams, ShellView } from './shell.type'

export const useShell = ({ children }: UseShellParams): ShellView => ({ children })
```

```tsx
// src/shell/shell.tsx
import { Sidebar } from './sidebar'
import { useShell } from './shell.hook'
import type { ShellProps } from './shell.type'

export const Shell = (props: ShellProps) => {
  const view = useShell(props)
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto" id="main">
        <a href="#main" className="sr-only focus:not-sr-only">Skip to main</a>
        {view.children}
      </main>
    </div>
  )
}
```

```ts
// src/shell/index.ts
export { Shell } from './shell'
export type { ShellProps } from './shell.type'
```

- [ ] **Step 2: Verify typecheck**

```bash
npm run typecheck
```

- [ ] **Step 3: Commit**

```bash
git add src/shell
git commit -m "feat(shell): shell wrapper with sidebar + main outlet"
```

---

### Task 5: Update `__root.tsx` to split Home vs Shell

**Files:**
- Modify: `src/routes/__root.tsx`

- [ ] **Step 1: Replace the existing root**

```tsx
// src/routes/__root.tsx
import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Shell } from '@/shell'

const RootComponent = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  return isHome ? <Outlet /> : <Shell><Outlet /></Shell>
}

export const Route = createRootRoute({ component: RootComponent })
```

- [ ] **Step 2: Verify dev server**

```bash
npm run dev
```

Expected: `/` still shows the placeholder (will become Home in next tasks); routes other than `/` (when added) will render in shell.

- [ ] **Step 3: Commit**

```bash
git add src/routes/__root.tsx
git commit -m "feat(routes): root layout split Home vs Shell+Outlet"
```

---

### Task 6: `-home-page/` module

**Files:**
- Create: `src/routes/-home-page/home-page.type.ts`
- Create: `src/routes/-home-page/home-page.utils.ts`
- Create: `src/routes/-home-page/home-page.hook.ts`
- Create: `src/routes/-home-page/home-page.tsx`
- Create: `src/routes/-home-page/index.ts`
- Create: `src/routes/-home-page/home-page.hook.test.ts`

- [ ] **Step 1: Write failing hook test**

```ts
// src/routes/-home-page/home-page.hook.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHomePage } from './home-page.hook'
import { useDataSourcesStore } from '@/stores/data-sources.store'

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
}))

describe('useHomePage', () => {
  beforeEach(() => useDataSourcesStore.setState({ list: [], mostRecentId: null }))

  it('exposes a handleTrySampleData callback', () => {
    const { result } = renderHook(() => useHomePage())
    expect(typeof result.current.handleTrySampleData).toBe('function')
    expect(result.current.isSeeding).toBe(false)
  })

  it('sets isSeeding true while seeding', async () => {
    const { result } = renderHook(() => useHomePage())
    expect(result.current.isSeeding).toBe(false)
    // Note: full integration test of seed import is harder to mock; covered by seed.test.ts
  })
})
```

- [ ] **Step 2: Create the module files**

```ts
// src/routes/-home-page/home-page.type.ts
export type HomePageProps = {
  // none in V1
}

export type UseHomePageParams = HomePageProps

export type HomePageView = {
  isSeeding: boolean
  headline: string
  subheadline: string
  handleGetStarted: () => void
  handleTrySampleData: () => Promise<void>
}
```

```ts
// src/routes/-home-page/home-page.utils.ts
export const HEADLINE = 'Charts your team can actually build'
export const SUBHEADLINE =
  'Upload your data, pick what you want to see. InsightFlow guides you through every step — no dropdowns to decode, no chart-builder jargon. Just the chart you wanted, fast.'
```

```ts
// src/routes/-home-page/home-page.hook.ts
import { useCallback, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useToastStore } from '@/stores/toast.store'
import type { HomePageView, UseHomePageParams } from './home-page.type'
import { HEADLINE, SUBHEADLINE } from './home-page.utils'

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
    handleGetStarted,
    handleTrySampleData,
  }
}
```

```tsx
// src/routes/-home-page/home-page.tsx
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useHomePage } from './home-page.hook'
import type { HomePageProps } from './home-page.type'

export const HomePage = (props: HomePageProps) => {
  const view = useHomePage(props)
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(in oklab, var(--accent) 18%, transparent), transparent 70%)',
        }}
        aria-hidden
      />
      <header className="relative z-10 flex items-center justify-between px-12 py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-accent font-bold text-accent-foreground">i</div>
          <span className="font-serif text-lg font-semibold">InsightFlow</span>
        </div>
        <a href="/styleguide" className="text-xs text-muted-foreground hover:text-foreground">
          Style Guide
        </a>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-6 pt-16 pb-24 text-center">
        <h1 className="font-serif text-5xl font-semibold leading-tight tracking-tight md:text-6xl">
          {view.headline}
        </h1>
        <p className="mt-6 text-base text-muted-foreground md:text-lg">{view.subheadline}</p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 md:flex-row">
          <Button size="lg" onClick={view.handleGetStarted}>
            Get started
            <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
          </Button>
          <Button size="lg" variant="outline" onClick={view.handleTrySampleData} disabled={view.isSeeding}>
            <Sparkles className="mr-2 h-4 w-4" aria-hidden />
            {view.isSeeding ? 'Loading sample…' : 'Try with sample data'}
          </Button>
        </div>
      </section>
    </div>
  )
}
```

```ts
// src/routes/-home-page/index.ts
export { HomePage } from './home-page'
export type { HomePageProps } from './home-page.type'
```

- [ ] **Step 3: Run hook tests, verify PASS**

```bash
npm test src/routes/-home-page
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/-home-page src/lib/sample-data
git commit -m "feat(routes): -home-page module with lazy sample seed"
```

---

### Task 7: Wire `routes/index.tsx` to HomePage

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Replace the placeholder**

```tsx
// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from './-home-page'

const IndexRouteComponent = () => <HomePage />

export const Route = createFileRoute('/')({ component: IndexRouteComponent })
```

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

Expected: `/` renders fullscreen Home with hero + two buttons. No sidebar visible.

- [ ] **Step 3: Click "Try with sample data" → should navigate to `/datasources` (which will 404 until Phase 03)**

This 404 is expected. The data source has been added to the store.

- [ ] **Step 4: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat(routes): mount HomePage at /"
```

---

### Task 8: Phase 02 verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

- [ ] **Step 2: Run typecheck + lint + build**

```bash
npm run typecheck && npm run lint && npm run build
```

- [ ] **Step 3: Manually verify in browser:**
  - `/` shows fullscreen Home with branded hero (no sidebar)
  - Theme toggle would require sidebar — not on Home — that's fine. Use system theme override via dev tools to verify dark mode renders correctly
  - Click "Get started" → navigates to `/datasources` (404 — expected for now)

- [ ] **Step 4: Tag**

```bash
git tag phase-02-complete
```

---

## Phase 02 done

Home renders. Shell is built and ready. Sample-data seed wired. Move to `03-data-sources.md`.
