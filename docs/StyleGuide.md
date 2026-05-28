# InsightFlow — Style Guide v1

Authoritative reference for every visual decision in InsightFlow. The `/styleguide` route in the app renders this same content at runtime, so agents and humans can always see the live system.

> **The rule:** every component must reference these tokens. Never hardcode a hex, a px size, or a duration. If you need a value not in this guide, add it here first.

---

## 0. Stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Styling | Tailwind CSS v4 (CSS-first `@theme` config) |
| Component primitives | shadcn/ui |
| Icons | Lucide |
| Charts | Plotly.js |
| State | Zustand |
| File parsing | PapaParse (CSV) + SheetJS (Excel) |
| Build / deploy | Vite + Vercel |

---

## 1. Philosophy

1. **Tokens over values.** A component must never contain a hex, px, or ms literal — only token references.
2. **One job per scale entry.** The type scale has 6 sizes; pick the one whose *purpose* matches. Same for spacing, radius, elevation.
3. **Dark mode is first-class, not retrofitted.** Every token has light + dark values. Every screen is tested in both.
4. **Elevation, not arbitrary shadow.** Shadow is a consequence of choosing L1/L2/L3/L4 — never set directly.
5. **Motion is causal.** Animation reinforces *what just happened* — never decorative. Always respect `prefers-reduced-motion`.
6. **Accessibility is non-negotiable.** Keyboard focus, color contrast ≥ AA, `currentColor` icons, focus-visible-only rings.

---

## 2. Theme — Warm Editorial

Personality: friendly, calm, made-for-humans-not-analysts. Serif headings (display + title only) for warmth; sans for all UI.

**Fonts**
- Serif: `Iowan Old Style, "Iowan Old Style", Georgia, "Times New Roman", serif`
- Sans: `Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`
- Mono: `ui-monospace, "Cascadia Code", "Fira Code", monospace`

---

## 3. Color tokens

Defined as HSL CSS custom properties in `:root` (light) and `.dark` (dark mode), then exposed to Tailwind via `@theme inline`. All component code references the semantic name — never the value.

### Semantic palette

| Token | Light | Dark | Use |
|---|---|---|---|
| `--background` | `#fdfbf7` (warm cream) | `#1c1917` (warm stone-900) | App background (L1) |
| `--foreground` | `#1c1917` | `#f5f5f4` | Primary text |
| `--surface` | `#ffffff` | `#292524` | Card / panel background (L2) |
| `--surface-2` | `#fafaf9` | `#363130` | Elevated surface (L3) |
| `--muted` | `#f5f5f4` | `#363130` | Muted backgrounds |
| `--muted-foreground` | `#78716c` | `#a8a29e` | Secondary text, helper text |
| `--border` | `#e7e5e4` | `#44403c` | Default borders |
| `--input` | `#e7e5e4` | `#44403c` | Input borders |
| `--ring` | `rgba(194,65,12,.5)` | `rgba(251,146,60,.5)` | Focus ring |
| `--accent` | `#c2410c` (orange-700) | `#ea580c` (orange-600) | Primary action, brand |
| `--accent-foreground` | `#ffffff` | `#ffffff` | Text on accent |
| `--success` | `#15803d` (green-700) | `#22c55e` (green-500) | Success states |
| `--warning` | `#a16207` (amber-700) | `#eab308` (yellow-500) | Warnings |
| `--destructive` | `#b91c1c` (red-700) | `#ef4444` (red-500) | Errors, delete |

### Usage rules
- Page background = `bg-background`. Cards = `bg-surface`. Modals = `bg-surface-2`.
- Primary CTA = `bg-accent text-accent-foreground`.
- Secondary CTA = `bg-surface border border-border text-foreground`.
- Helper / hint text = `text-muted-foreground`.
- Tags & badges = `bg-muted text-muted-foreground` (neutral) or `bg-accent/10 text-accent` (highlighted).

---

## 4. Type scale

Six sizes. Each has one purpose.

| Token | Size / weight / line-height | Font | Use |
|---|---|---|---|
| `text-display` | 32px / 600 / 1.15 | serif | Screen titles (Dashboard, Upload) |
| `text-title` | 22px / 600 / 1.25 | serif | Dialog & major section titles |
| `text-heading` | 16px / 600 / 1.4 | sans | Card titles, step labels |
| `text-body` | 14px / 400 / 1.5 | sans | Default UI copy, paragraphs |
| `text-small` | 13px / 400 / 1.5 | sans | Helper text, hints, captions |
| `text-caption` | 11px / 600 / 1.3, uppercase, +0.04em tracking | sans | Labels, tag text |

**Rules**
- Serif used **only** for `display` and `title`. Everything else sans.
- Never invent intermediate sizes (no 18px, no 15px).
- Don't combine bold weight with sizes other than the ones above.

---

## 5. Spacing scale

Tailwind's 4px grid. Use only these "blessed" steps.

| Token | Value | Typical use |
|---|---|---|
| `space-1` | 4px | icon ↔ text gap |
| `space-2` | 8px | tag padding, inline gap |
| `space-3` | 12px | input padding-y, small section gap |
| `space-4` | 16px | card padding, default gap between elements |
| `space-6` | 24px | gap between sections inside a card |
| `space-8` | 32px | major section gap |
| `space-12` | 48px | page-level padding, top margin of screen |
| `space-16` | 64px | screen-level breathing room (hero, empty states) |

Never use intermediate values (no 10px, no 20px, no 28px).

---

## 6. Border radius

| Token | Value | Use |
|---|---|---|
| `radius-sm` | 4px | Tags, badges, pills (non-circular) |
| `radius-md` | 8px | Buttons, inputs, chips, small cards |
| `radius-lg` | 10px | Cards, panels (**default for content surfaces**) |
| `radius-xl` | 12px | Modals, dialogs, large feature cards |
| `radius-full` | 9999px | Avatars, dots, pill-shaped buttons |

Pick by element type, not by feeling.

---

## 7. Elevation

Four levels — every "surface" in the app is one of these.

| Level | What it is | Light mechanic | Dark mechanic |
|---|---|---|---|
| **L1** | Page background | Flat — no shadow, no border | Flat — no shadow, no border |
| **L2** | Card / panel | `bg-surface` + 1px border + `shadow-sm` | `bg-surface` + 1px border + inset white ring |
| **L3** | Modal / popover / dropdown | `bg-surface-2` + 1px border + `shadow-lg` | `bg-surface-2` + brighter border + inset ring + soft shadow |
| **L4** | Toast / tooltip | `bg-foreground text-background` + `shadow-md` (floats, no backdrop) | Inverted: light pill on dark page |

**Rule:** never nest L2 inside L2 (no card-in-card). If you need an inner block, use `bg-muted` (flat) instead.

---

## 8. Shadows

Three named tokens, applied via elevation — never inline.

| Token | Light value | Dark value | Used at |
|---|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(28,25,23,.04)` | `0 0 0 1px rgba(255,255,255,.03), 0 2px 6px rgba(0,0,0,.3)` | L2 cards |
| `shadow-md` | `0 4px 12px rgba(28,25,23,.08)` | `0 0 0 1px rgba(255,255,255,.04), 0 4px 12px rgba(0,0,0,.4)` | Hover state, popovers, L4 toasts |
| `shadow-lg` | `0 10px 30px rgba(28,25,23,.12), 0 4px 8px rgba(28,25,23,.06)` | `0 0 0 1px rgba(255,255,255,.05), 0 12px 32px rgba(0,0,0,.5), 0 4px 10px rgba(0,0,0,.3)` | L3 modals, dialogs |

---

## 9. Iconography — Lucide

One library, one stroke, one tone.

**Size scale:** 14 / 16 / 18 / 20 / 24 / 32 px
- 14px: inline with text
- 16px: default UI (default in shadcn)
- 18px: buttons
- 20px: section headers, navbars
- 24px: empty-state hint icons
- 32px: hero / large empty state

**Stroke:** 1.5 default · 2.0 emphasis only (e.g., destructive confirm).

**Color:** always `currentColor`. The icon inherits from the text context — never set explicit `color` or `fill`.

**Library:** Lucide React only. Never mix with Heroicons, Phosphor, Material, etc.

---

## 10. Focus rings (keyboard accessibility)

Two distinct patterns — solid elements get an **outer ring with offset**, inputs get a **border swap + inset glow**. Mixing them up creates the "focus ring floating away from the input with a visible gap" bug.

Always `focus-visible` — never on mouse click.

### Pattern 1 — Buttons / links / solid clickable surfaces

The element has its own clear visual surface (background fill or border). The focus ring sits **outside** the element with a 2px offset gap, drawn against the page background:

```
focus-visible:outline-none
focus-visible:ring-2 focus-visible:ring-ring
focus-visible:ring-offset-2 focus-visible:ring-offset-background
```

**Why offset:** the button already has a clear edge. The ring needs to sit *outside* that edge to be visible. A 2px offset draws the ring on the page background so it doesn't visually merge with the button's surface.

### Pattern 2 — Inputs / textareas / select triggers

The element has a thin border that's the only visual edge. **Do NOT offset the ring — it creates a visible gap between the input border and the ring (looks broken).** Instead: swap the border color to accent and add an inset soft glow.

```
transition-colors duration-150 ease-out
focus-visible:outline-none
focus-visible:border-accent
focus-visible:ring-2 focus-visible:ring-accent/20
```

**Why no offset:** the input has only a border (no background fill visible). An outer offset ring with a gap looks like the input is broken or the ring is floating. Border-swap is the canonical input-focus pattern — the border itself changes color to communicate focus, and a soft glow at 20% accent reinforces it without competing.

**Rules:** never disable focus rings. Never hide them with `outline: none` alone — only when paired with one of the `focus-visible:ring-*` replacements above. Differentiating button vs input pattern is non-negotiable.

---

## 11. Motion

Three duration tokens, two easing tokens. Most things should feel instant; only meaningful transitions are animated.

| Token | Value | Use for |
|---|---|---|
| `duration-fast` | 120ms | Hover, focus, micro state change |
| `duration-base` | 200ms | Dialog open/close, panel slide, step transition |
| `duration-slow` | 320ms | Chart preview re-render, large layout shift |
| `ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Things *appearing* (modal open, toast in) |
| `ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Things *leaving* (modal close, dismiss) |

**Rules**
- Animation reinforces causality. If it doesn't help the user understand what happened, drop it.
- Respect `prefers-reduced-motion: reduce` — set all durations to 0ms.
- Never animate `width`/`height` directly — use `transform: scale()` or `max-height` with a `transform` companion.

---

## 12. Plotly chart palette

Two layers: **system defaults** (what charts render with on first paint) and **user overrides** (what Step 4 of the Chart Builder lets the user pick).

### 12a. System defaults

**Categorical default (used when the chart has multiple groups — pie always, bar when grouped):**

| Slot | Hex | Tailwind name |
|---|---|---|
| 1 | `#c2410c` | orange-700 (matches accent for cohesion) |
| 2 | `#0e7490` | cyan-700 |
| 3 | `#15803d` | green-700 |
| 4 | `#6d28d9` | violet-700 |
| 5 | `#a16207` | amber-700 |
| 6 | `#be185d` | pink-700 |

All sit at the 700-shade for similar visual weight. If a pie has >6 categories, the whitepaper rule kicks in (top 6 + "Other").

**Sequential default (single-series line / bar):** all bars/lines use `--accent`. The chart's interest comes from the data, not multiple colors.

### 12b. User color override (Step 4 of Chart Builder)

The whitepaper grants the user control over chart color in Step 4. We expose this as a **curated swatch picker** — not a free hex input — so every choice stays consistent with the foundations (works in both light + dark mode, sufficient contrast).

**Curated user palette — 12 swatches** (any of these can be picked as a chart's color):

| Row | Colors |
|---|---|
| Warm | orange-700 `#c2410c` · amber-700 `#a16207` · red-700 `#b91c1c` · pink-700 `#be185d` |
| Cool | cyan-700 `#0e7490` · blue-700 `#1d4ed8` · violet-700 `#6d28d9` · teal-700 `#0f766e` |
| Neutral | green-700 `#15803d` · lime-700 `#4d7c0f` · stone-700 `#44403c` · slate-700 `#334155` |

All 12 sit at the 700 shade — same visual weight as the categorical palette, all pass AA contrast on both `--background` light and `--background` dark.

**Override behavior by chart type:**

| Chart | Picker behavior |
|---|---|
| Bar (single measure) | One swatch — applies to all bars. Default = `--accent`. |
| Line (single series) | One swatch — applies to the line + markers. Default = `--accent`. |
| Pie | One swatch picks the **anchor** color; system rotates the categorical palette starting from that anchor's hue family. Default = full categorical palette. |

> **V1 rule:** curated swatches only. Free hex input is explicitly out of scope (it can produce dark-mode contrast failures, which contradicts §1 principle 3). Reconsider for V2.

### 12c. Plotly layout config

A `src/lib/plotly-theme.ts` module (to be created during implementation) maps these tokens into Plotly's `colorway`, `paper_bgcolor`, `plot_bgcolor`, `font.family`, `font.color`, `xaxis.gridcolor`, etc., and toggles based on the active theme mode.

---

## 13. Component-level styling rules

For every shadcn component we use, apply these defaults (overrides go in our wrapper component, not at call sites).

### 13a. Button — full anatomy

The **Button** is the single most-used interactive primitive. It must look unambiguously like a button, in light and dark, in every state.

**Required visual signals (in all variants except `link`):**
1. A clear surface (background fill, border, or both)
2. Adequate contrast against the page
3. A **transition** (150ms ease-out) on every color/transform change
4. An **active scale** of `0.98` so a click feels physical
5. A **focus-visible ring** for keyboard users (per §10)

**Variants (ordered by prominence):**

| Variant | Light state | Dark state | Use |
|---|---|---|---|
| `default` (primary) | `bg-accent` (#c2410c) · white text · `shadow-sm` | `bg-accent` (#ea580c) · white text · `shadow-sm` | Primary CTA — one per screen region |
| `destructive` | `bg-destructive` (#b91c1c) · white text · `shadow-sm` | `bg-destructive` (#ef4444) · white text · `shadow-sm` | Delete, irreversible actions |
| `soft` | `bg-accent/10` · `text-accent` · `border-accent/20` | Same tokens (auto-adapts) | **Medium prominence** — row "Create Report", "+ Add filter", contextual CTAs. Brand-aware but less dominant than primary. |
| `outline` | `bg-surface` · `border-border` · `text-foreground` · `shadow-sm` | `bg-surface` (#292524) · `border-border` (#44403c) · light text | Secondary action beside a primary; Cancel buttons |
| `secondary` | `bg-muted` (#f5f5f4) · `text-foreground` · `shadow-sm` | `bg-muted` (#363130) · `text-foreground` · `shadow-sm` | Tertiary fills — rare |
| `ghost` | transparent · hover `bg-muted` | transparent · hover `bg-muted` (#363130) | Icon-only buttons, toolbar buttons, low-prominence actions |
| `link` | `text-accent` · underline on hover | `text-accent` (#ea580c) · underline on hover | Inline links inside text contexts |

**States (apply to every variant except `link`):**

| State | Visual change |
|---|---|
| Default | Rest state |
| Hover | Background opacity 90% (filled) / `bg-muted` (ghost) / underline (link). Cursor: pointer. |
| Active (pressed) | Scale to 0.98 + background opacity 95% (subtle "pressed" feedback). |
| Focus-visible | 2px ring in `--ring` color + 2px offset against `--background` (keyboard only, never on click). |
| Disabled | `opacity-50` + `pointer-events-none` + scale stays at 1 on click. |

**Sizes:**

| Size | Height | Padding | Text | Use |
|---|---|---|---|---|
| `sm` | 36px (h-9) | px-3 | 14px | Compact toolbars, inline actions |
| `default` | 40px (h-10) | px-4 | 14px | Most buttons |
| `lg` | 44px (h-11) | px-6 | 16px | Hero CTAs, primary screen actions |
| `icon` | 40×40px | (square) | — | Icon-only (use with `aria-label`) |

**Don't:**
- ❌ Use `bg-accent` with `bg-accent/0` (transparent) — looks like a text link, not a button
- ❌ Use `text-accent` without `bg-*` or `border-*` for anything that should look clickable as a button (use `ghost` variant instead — it has hover surface)
- ❌ Override `transition-all` to remove the responsive feel
- ❌ Use `link` variant for primary actions — only for inline-text links
- ❌ Mix size and variant in one button via inline classes — use the variant API or wrap in a feature component

**Do:**
- ✅ Always pair `bg-*` with `text-*-foreground` (avoid hardcoded text colors)
- ✅ Use `soft` for table-row contextual actions like "Create Report" — brand-aware, clearly a button
- ✅ Use `ghost` for icon-only or destructive low-prominence actions (Delete icon button in row)
- ✅ Add `aria-label` for icon-only buttons
- ✅ Use `lg` for the Home hero CTA only

### Best-practices for "responsive feel" (already baked into our `Button`)

Six visual feedbacks combine to make a button feel physical, not flat:

1. **Cursor changes** to `pointer` on hover (Tailwind preflight resets button cursor to default — we add `cursor-pointer` explicitly)
2. **Background shifts** on hover (filled variants: 90% opacity · ghost: muted appears · soft: tint deepens)
3. **Background shifts again** on active/press (95% opacity for filled · 70% for ghost)
4. **Scale to 0.98** on `active:` — subtle "pressed" feedback, 2% smaller for ~50ms
5. **Focus ring** on `:focus-visible` (keyboard only, never on mouse click — uses `--ring` token)
6. **All transitions** are `transition-all duration-150 ease-out` — fast enough to feel snappy (sub-200ms), smooth enough to read

Industry conventions we follow:
- **Duration:** 100-200ms is the sweet spot. <100ms feels jumpy; >200ms feels sluggish.
- **Easing:** `ease-out` (deceleration) for hover/active — the button "settles" into its new state. Linear is robotic; ease-in feels late.
- **Active scale:** 0.97-0.99 (we use 0.98). Bigger scales (0.95) feel cartoonish; <0.99 is imperceptible.
- **Focus ring:** offset from the button by 2px so it's visible against any background. Use brand color at 30-50% opacity.
- **Disabled:** 40-60% opacity (we use 50%) + `cursor-not-allowed` + `pointer-events-none` (prevents both click and hover state).
- **Mobile:** `-webkit-tap-highlight-color: transparent` to suppress the blue flash on tap (our scale + bg shift is enough feedback).
- **Reduced motion:** respect `prefers-reduced-motion` — our global rule in `globals.css` cancels all `transition` and `animation` for that user. Buttons still change color but don't scale.

Loading state (when async): not in V1 default, but the pattern when needed is — disable the button, swap label to "Loading…" or add a spinner, keep width constant to prevent layout shift.

### 13b. Other components

| Component | Default classes / behavior |
|---|---|
| `Input` | `bg-surface border border-input text-foreground` · `radius-md` · focus ring per §10 |
| `Card` | `bg-surface border border-border shadow-sm` · `radius-lg` · `p-6` |
| `Dialog` (full-screen) | `bg-surface-2` · `radius-xl` · `shadow-lg` · backdrop `bg-background/60 backdrop-blur-sm` |
| `Popover` / `Dropdown` | `bg-surface-2 border border-border shadow-lg` · `radius-md` |
| `Toast` | L4 — `bg-foreground text-background shadow-md` |
| `Badge` | `bg-muted text-muted-foreground` (neutral) or `bg-accent/10 text-accent` (highlighted) · `radius-sm` · `text-caption` |

---

## 14. The `/styleguide` route

A read-only route in the app that renders this guide live, using the actual tokens from the live theme. Purposes:

- Visual regression check — if a token drifts, the styleguide route shows it before any feature screen does
- Onboarding — new contributors (or agents) open `/styleguide` to see the system, not docs
- Theme switching demo — toggle light/dark at the top, every section reflows

**Sections rendered (mirroring this doc):** Stack · Philosophy · Color tokens · Type scale · Spacing · Radius · Elevation · Shadow · Icons · Focus · Motion · Plotly palette · Component examples.

The route is part of the v1 ship. It is not optional — it is the contract.

---

## 15. Versioning

This guide is `v1`. Any change to a token, scale, or rule requires:
1. Bumping the version at the top of this file
2. Updating the `/styleguide` route
3. A short note in the relevant section explaining the change

Drift is the enemy of consistency. Treat this guide as the source of truth.
