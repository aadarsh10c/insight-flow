import { useState, type ReactNode } from 'react'
import { Clock, Plus, Search, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { TypeBadge } from '@/components/shared/type-badge'
import { AppliedFilterChips } from '@/components/shared/applied-filter-chips'
import { StepCard } from '@/components/shared/step-card'
import { getCategoricalPalette } from '@/lib/plotly-theme'
import type { FilterClause } from '@/types/chart.type'

type SectionProps = { id: string; title: string; description?: string; children: ReactNode }

export const Section = ({ id, title, description, children }: SectionProps) => (
  <section id={id} className="scroll-mt-16 space-y-3">
    <header className="space-y-1">
      <h2 className="text-title">{title}</h2>
      {description && <p className="text-small text-muted-foreground">{description}</p>}
    </header>
    <div>{children}</div>
  </section>
)

// 1. Philosophy
export const SectionPhilosophy = () => (
  <Section id="philosophy" title="1. Philosophy" description="Warm Editorial — designed for humans, not analysts.">
    <ol className="list-decimal space-y-1.5 pl-5 text-body text-foreground">
      <li>Clarity over cleverness — show what the user needs, hide what they don't.</li>
      <li>One job per element — every primitive does one thing well.</li>
      <li>Friendly defaults — soft warmth, generous spacing, calm tones.</li>
      <li>Consistent rhythm — six type sizes, fixed spacing scale, no ad-hoc values.</li>
      <li>Brand-first hierarchy — the InsightFlow mark is the largest text in the app.</li>
      <li>Tokens, not values — never hardcode a color or size that has a token.</li>
    </ol>
  </Section>
)

// 2. Theme
export const SectionTheme = () => (
  <Section id="theme" title="2. Theme" description="Light is the default. Dark mirrors it. Use the sun/moon button in the sidebar to toggle.">
    <div className="rounded-md border border-border bg-surface p-4 text-small text-muted-foreground">
      Tokens are CSS custom properties under <code className="rounded bg-muted px-1 font-mono">:root</code> (light) and <code className="rounded bg-muted px-1 font-mono">.dark</code>. Toggling theme rewrites them and every component on this page updates live — no reload.
    </div>
  </Section>
)

// 3. Color tokens
const COLOR_TOKENS: ReadonlyArray<{ name: string; onSurface?: boolean }> = [
  { name: 'background', onSurface: true },
  { name: 'foreground', onSurface: false },
  { name: 'surface', onSurface: true },
  { name: 'surface-2', onSurface: true },
  { name: 'muted', onSurface: true },
  { name: 'muted-foreground', onSurface: false },
  { name: 'border', onSurface: true },
  { name: 'accent' },
  { name: 'accent-foreground' },
  { name: 'success' },
  { name: 'warning' },
  { name: 'destructive' },
]

export const SectionColors = () => (
  <Section id="colors" title="3. Colors" description="Semantic tokens. Background changes per theme — accents stay close.">
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
      {COLOR_TOKENS.map(({ name, onSurface }) => (
        <div
          key={name}
          className="rounded-md border border-border p-3"
          style={{ background: `var(--${name})` }}
        >
          <div
            className="font-mono text-[11px] font-medium"
            style={{ color: onSurface ? 'var(--foreground)' : 'var(--accent-foreground)' }}
          >
            --{name}
          </div>
        </div>
      ))}
    </div>
  </Section>
)

// 4. Typography
export const SectionTypography = () => (
  <Section id="type" title="4. Typography" description="Six tokens. Brand-first — nothing exceeds 16px.">
    <div className="space-y-2 rounded-md border border-border bg-surface p-5">
      <div>
        <div className="text-display">InsightFlow</div>
        <code className="text-caption text-muted-foreground">text-display · 18px serif 600 · hero / marketing</code>
      </div>
      <div>
        <div className="text-title">Sales Dashboard</div>
        <code className="text-caption text-muted-foreground">text-title · 16px serif 600 · brand · page H1 · dialog titles</code>
      </div>
      <div>
        <div className="text-heading">Card title</div>
        <code className="text-caption text-muted-foreground">text-heading · 15px sans 600 · card titles · section emphasis</code>
      </div>
      <div>
        <div className="text-body">Default body copy goes here.</div>
        <code className="text-caption text-muted-foreground">text-body · 14px sans 400</code>
      </div>
      <div>
        <div className="text-small text-muted-foreground">Helper text and hints.</div>
        <code className="text-caption text-muted-foreground">text-small · 13px sans 400</code>
      </div>
      <div>
        <div className="text-caption text-muted-foreground">Label / tag text</div>
        <code className="text-caption text-muted-foreground">text-caption · 11px sans 600 uppercase</code>
      </div>
    </div>
  </Section>
)

// 5. Spacing
const SPACES = [4, 8, 12, 16, 24, 32, 48] as const

export const SectionSpacing = () => (
  <Section id="spacing" title="5. Spacing" description="4 / 8 / 12 / 16 / 24 / 32 / 48 — never invent intermediates.">
    <div className="space-y-2 rounded-md border border-border bg-surface p-4">
      {SPACES.map((px) => (
        <div key={px} className="flex items-center gap-3">
          <code className="w-16 text-caption text-muted-foreground">{px}px</code>
          <div className="h-2 rounded-sm bg-accent" style={{ width: px }} />
        </div>
      ))}
    </div>
  </Section>
)

// 6. Radius
const RADII = [
  { name: 'sm', px: 4 },
  { name: 'md', px: 8 },
  { name: 'lg', px: 10 },
  { name: 'xl', px: 12 },
  { name: 'full', px: 9999 },
]

export const SectionRadius = () => (
  <Section id="radius" title="6. Radius" description="Five values. Most surfaces use md or lg.">
    <div className="flex flex-wrap gap-3">
      {RADII.map(({ name, px }) => (
        <div
          key={name}
          className="grid h-16 w-20 place-items-center border border-border bg-surface"
          style={{ borderRadius: px === 9999 ? '9999px' : px }}
        >
          <code className="text-caption text-muted-foreground">rounded-{name}</code>
        </div>
      ))}
    </div>
  </Section>
)

// 7. Elevation
export const SectionElevation = () => (
  <Section id="elevation" title="7. Elevation" description="Four levels. Shadows pair with surface tokens.">
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-md border border-border bg-surface p-4">
        <p className="text-heading">L1 · Base</p>
        <p className="text-small text-muted-foreground">Page content, inputs</p>
      </div>
      <div className="rounded-md border border-border bg-surface p-4 shadow-sm">
        <p className="text-heading">L2 · Card</p>
        <p className="text-small text-muted-foreground">Surface cards, tables</p>
      </div>
      <div className="rounded-md border border-border bg-popover p-4 shadow-md">
        <p className="text-heading">L3 · Popover</p>
        <p className="text-small text-muted-foreground">Menus, comboboxes</p>
      </div>
      <div className="rounded-md bg-foreground p-4 text-background shadow-lg">
        <p className="text-heading">L4 · Toast</p>
        <p className="text-small opacity-80">Notifications</p>
      </div>
    </div>
  </Section>
)

// 8. Shadows
export const SectionShadows = () => (
  <Section id="shadows" title="8. Shadows" description="Three weights. Match elevation, don't free-style.">
    <div className="grid gap-4 sm:grid-cols-3">
      {(['shadow-sm', 'shadow-md', 'shadow-lg'] as const).map((cls) => (
        <div key={cls} className={`rounded-md border border-border bg-surface p-4 ${cls}`}>
          <code className="text-caption text-muted-foreground">{cls}</code>
        </div>
      ))}
    </div>
  </Section>
)

// 9. Icons
export const SectionIcons = () => (
  <Section id="icons" title="9. Iconography" description="Lucide. Stroke 1.5 default. Size matches surrounding text + 1 step.">
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-surface p-4">
        <p className="mb-2 text-caption text-muted-foreground">Size scale</p>
        <div className="flex items-end gap-4">
          {[14, 16, 18, 20, 24, 32].map((size) => (
            <div key={size} className="flex flex-col items-center gap-1">
              <Clock style={{ width: size, height: size }} aria-hidden />
              <code className="text-caption text-muted-foreground">{size}px</code>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-md border border-border bg-surface p-4">
        <p className="mb-2 text-caption text-muted-foreground">Stroke comparison</p>
        <div className="flex items-center gap-6">
          <Square strokeWidth={1.5} className="h-6 w-6" aria-hidden />
          <code className="text-caption text-muted-foreground">stroke 1.5 (default)</code>
          <Square strokeWidth={2} className="h-6 w-6" aria-hidden />
          <code className="text-caption text-muted-foreground">stroke 2 (emphasis)</code>
        </div>
      </div>
    </div>
  </Section>
)

// 10. Focus
export const SectionFocus = () => (
  <Section id="focus" title="10. Focus" description="Tab through to see the ring. Inputs swap border + add a 2px inset glow (no offset).">
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-surface p-4">
      <Button>Tab into me</Button>
      <Input placeholder="And me" className="max-w-[200px]" />
    </div>
  </Section>
)

// 11. Motion
export const SectionMotion = () => (
  <Section id="motion" title="11. Motion" description="Hover the boxes — fast / base / slow durations. Honored when prefers-reduced-motion is off.">
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="rounded-md border border-border bg-surface p-6 text-center text-body transition-transform duration-100 hover:scale-[1.03]">
        fast · 100ms
      </div>
      <div className="rounded-md border border-border bg-surface p-6 text-center text-body transition-transform duration-200 hover:scale-[1.03]">
        base · 200ms
      </div>
      <div className="rounded-md border border-border bg-surface p-6 text-center text-body transition-transform duration-500 hover:scale-[1.03]">
        slow · 500ms
      </div>
    </div>
  </Section>
)

// 12. Plotly palette
export const SectionPlotlyPalette = () => {
  const palette = getCategoricalPalette()
  return (
    <Section id="plotly" title="12. Plotly palette" description="Categorical swatches shared between Plotly traces and chart styling.">
      <div className="grid grid-cols-3 gap-2 rounded-md border border-border bg-surface p-4 sm:grid-cols-6">
        {palette.map((hex) => (
          <div
            key={hex}
            className="rounded-sm p-3 text-center font-mono text-[11px] font-medium text-white"
            style={{ background: hex }}
          >
            {hex}
          </div>
        ))}
      </div>
    </Section>
  )
}

// 13. Components
export const SectionComponents = () => {
  const [dialogOpen, setDialogOpen] = useState(false)
  return (
    <Section id="components" title="13. Components" description="Shadcn primitives, themed.">
      <div className="space-y-4 rounded-md border border-border bg-surface p-5">
        <div className="space-y-2">
          <p className="text-caption text-muted-foreground">Buttons</p>
          <div className="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button size="sm">Small</Button>
            <Button size="icon" aria-label="Add">
              <Plus className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="sg-input">Input</Label>
            <Input id="sg-input" placeholder="Type here…" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sg-textarea">Textarea</Label>
            <Textarea id="sg-textarea" placeholder="More text…" rows={2} />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Select</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pick one…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="a">Option A</SelectItem>
                <SelectItem value="b">Option B</SelectItem>
                <SelectItem value="c">Option C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Badges</Label>
            <div className="flex flex-wrap gap-1.5">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-caption text-muted-foreground">Table</p>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow><TableCell>Region</TableCell><TableCell>Category</TableCell><TableCell className="text-right">4</TableCell></TableRow>
              <TableRow><TableCell>Sales</TableCell><TableCell>Number</TableCell><TableCell className="text-right">9,801</TableCell></TableRow>
              <TableRow><TableCell>Order Date</TableCell><TableCell>Date</TableCell><TableCell className="text-right">2014–2017</TableCell></TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm">Hover me</Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>Open dialog</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-title">Sample dialog</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <p className="text-body">Sticky header + scrollable body + sticky footer.</p>
              </DialogBody>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Close</Button>
                <Button onClick={() => setDialogOpen(false)}>OK</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Section>
  )
}

// 14. Shared primitives
const SAMPLE_FILTERS: FilterClause[] = [
  { id: 'p1', column: 'region', predicate: 'equals', values: ['East'] },
  { id: 'p2', column: 'orderDate', predicate: 'between', values: ['2014-01-02', '2015-01-31'] },
]
const SAMPLE_COLUMN_CONFIG = {
  region: { label: 'Region' },
  orderDate: { label: 'Order Date' },
}

export const SectionPrimitives = () => (
  <Section id="primitives" title="14. Shared primitives" description="Cross-feature building blocks.">
    <div className="space-y-5 rounded-md border border-border bg-surface p-5">
      <div className="space-y-2">
        <p className="text-caption text-muted-foreground">TypeBadge</p>
        <div className="flex flex-wrap gap-2">
          <TypeBadge type="number" />
          <TypeBadge type="category" />
          <TypeBadge type="text" />
          <TypeBadge type="date" />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-caption text-muted-foreground">AppliedFilterChips</p>
        <AppliedFilterChips filters={SAMPLE_FILTERS} columnConfig={SAMPLE_COLUMN_CONFIG} />
      </div>

      <div className="space-y-2">
        <p className="text-caption text-muted-foreground">StepCard — 4 states</p>
        <div className="space-y-2">
          <StepCard status="active" stepNumber={1} title="Active step">
            <p className="text-small text-muted-foreground">Body shows for active.</p>
          </StepCard>
          <StepCard status="complete" stepNumber={2} title="Complete step" summary="Bar chart by Region" />
          <StepCard status="reset" stepNumber={3} title="Reset step" resetReason="upstream changed">
            <p className="text-small text-muted-foreground">Body still visible with warning.</p>
          </StepCard>
          <StepCard status="locked" stepNumber={4} title="Locked step" optional />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-caption text-muted-foreground">Popover · Calendar · Skeleton</p>
        <div className="flex flex-wrap items-start gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Search className="mr-1.5 h-3.5 w-3.5" aria-hidden /> Open popover
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <p className="text-small">Themed popover content.</p>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">Open calendar</Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" captionLayout="dropdown" />
            </PopoverContent>
          </Popover>

          <div className="space-y-2">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    </div>
  </Section>
)

// 15. Rulebook
export const SectionRulebook = () => (
  <Section id="rulebook" title="15. Rulebook" description="Six rules. Break them and the system stops being a system.">
    <ol className="list-decimal space-y-1.5 pl-5 text-body text-foreground">
      <li>Use tokens — never hex/px in component code.</li>
      <li>Stay on scale — only 4/8/12/16/24/32/48 for spacing, only the six type sizes.</li>
      <li>Brand is biggest — no in-page heading exceeds the 16px brand.</li>
      <li>Serif is for titles only — body and labels are sans.</li>
      <li>One token, one purpose — don't repurpose `--accent` as a neutral hover.</li>
      <li>If you need a new token, add it here first. Then use it.</li>
    </ol>
  </Section>
)
