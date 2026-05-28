# InsightFlow — Screen Specs

Canonical visual + layout reference for each screen. One section per screen. Updated as each is confirmed during brainstorming. Implementation agents read this alongside the whitepaper, style guide, and design spec.

> **Companion artifacts:**
> - HTML mockups: `docs/mockups/<num>-<name>.html` — open in browser for the visual
> - Product spec: `docs/InsightFlow_Whitepaper_v3.md`
> - Visual tokens: `docs/StyleGuide.md`
> - Architecture: `docs/superpowers/specs/2026-05-28-insightflow-design.md`

---

## Global layout principles

These apply to every screen and dialog unless explicitly overridden.

1. **Fluid sizing — no fixed pixel widths/heights for content.** Use fractional units (`fr`, `%`, `flex-1`, `auto`, `fit-content`, `min-content`). Hardcoded `px` only for borders, icons, gaps, focus rings, and the sidebar's chrome width (220px is a deliberate fixed-chrome decision).
2. **Cap with `max-width`, flex with `width: auto` below the cap.** Dialogs use `max-width` (460–960px depending on density) + `max-height: 85vh` + internal scroll for overflow. They shrink gracefully on smaller laptops.
3. **Table columns** use a mix: primary content column takes `width: auto`, secondary columns use percentages or `min-width`, action columns use `width: 1% white-space: nowrap` (fits content, doesn't grow).
4. **Sidebar** is the one fixed-width chrome (220px). Below 1024px, the design spec §13 handles responsive fallback (banner + degraded layout).
5. **Never set fixed heights on content containers.** Min-heights (`min-height`) are acceptable when a state-change otherwise causes layout jump (e.g., Upload dialog's file area — see §3).
6. **Test in light + dark for every screen** — every token swaps automatically; never reference hex values in component code.

## Global data types (4)

| User label | Internal | Used for | Filter input |
|---|---|---|---|
| **Number** | NUMERIC | Measure | Numeric input · exact |
| **Category** | CATEGORICAL | Group / Split / Dropdown filter (low cardinality) | Dropdown of unique values |
| **Text** | TEXTUAL | Identification only · not chartable as group (high cardinality) | Text input · case-insensitive substring |
| **Date** | TEMPORAL | Time axis | Text input · exact (V2: range) |

**Detection order:** Date → Number → Category (unique values ≤ 50 AND unique ratio < 0.5) → Text. User can override any type in the Add Report column-config table.

## Applied filters in the chart (whitepaper §10)

When one or more filters are active, the chart displays them as chips beside/below the chart title in BOTH:
- The Chart Builder live preview (so the user sees the filtered chart while configuring)
- The Report Detail chart card (so the saved chart always tells viewers what data they're looking at)

Chip format: small accent-tinted pill (`bg-accent/10 text-accent`) preceded by a `filter` icon and uppercase "Filtered:" label. Each filter is one chip: `Category = Furniture` · `Customer Name contains "office"`. AND between chips is implicit (no "AND" rendered in the chips).

---

## Foundational mockups (locked, project-wide)

| Mockup | Purpose |
|---|---|
| `mockups/00-theme-direction.html` | Original 4-theme comparison — Warm Editorial picked |
| `mockups/00-foundations.html` | Full foundations preview: color · type · spacing · radius · elevation · shadow · icons · focus · motion · Plotly palette |
| `mockups/00-chart-color-override.html` | 12-swatch curated picker for user color override in Step 4 |
| `mockups/00-architecture-flow.html` | Route map: 5 routes + 3 dialogs + happy path |

---

## Status

| # | Screen | Route | Mockup | Status |
|---|---|---|---|---|
| 1 | Home | `/` | `mockups/01-home.html` | ✅ Confirmed |
| 2 | Data Sources | `/datasources` | `mockups/02-data-sources.html` | ✅ Confirmed |
| 3 | Upload Data Source dialog | (overlay on /datasources) | `mockups/03-upload-dialog.html` | ✅ Confirmed |
| 4 | Reports list | `/reports` | `mockups/04-reports-list.html` | ✅ Confirmed |
| 5 | Add Report dialog | (overlay on /reports) | `mockups/05-add-report-dialog.html` | ✅ Confirmed |
| 6 | Report Detail | `/reports/:id` | `mockups/06-report-detail.html` | ✅ Confirmed |
| 7 | Chart Builder dialog | (overlay on /reports/:id) | `mockups/07-chart-builder.html` | ✅ Confirmed |
| 8 | Style Guide | `/styleguide` | — | ⏸️ Pending |

---

## 1. Home — `/` ✅

**Mockup:** `docs/mockups/01-home.html` · light + dark
**Whitepaper:** §4

### Anatomy

| Region | Contents |
|---|---|
| **Layout** | Fullscreen. **No sidebar.** Same tokens as the rest of the app, marketing-style liberties. |
| **Header** | Logo + "InsightFlow" wordmark left · "Style Guide" link right. Padding `py-6 px-12`. |
| **Hero** | Centered, max-width 720px. **Display headline** in serif at 56px / 600 / 1.1 line-height. Sub-headline in `text-muted-foreground` at 18px. Padding `pt-16 pb-24`. |
| **CTAs** | Two buttons side by side: **primary** "Get started" (orange) + arrow-right icon; **secondary outline** "Try with sample data" + sparkles icon. Gap `gap-3`. |
| **Visual strip** | 3-card row below CTAs in a card with `bg-surface` + `border` + `radius-lg`: 1. Upload your data · 2. Pick what to see · 3. Done. Each card has accent-tinted icon + title + 1-line description. |
| **Background** | Subtle warm gradient at top: `radial-gradient(ellipse 80% 50% at 50% 0%, color-mix(accent 18%), transparent 70%)`. Opacity 60%. |
| **Footer** | Border-top, tiny "InsightFlow · v0.1" in muted text. |

### Copy (locked)

- Headline: **"Charts your team can actually build"**
- Sub-headline: *"Upload your data, pick what you want to see. InsightFlow guides you through every step — no dropdowns to decode, no chart-builder jargon. Just the chart you wanted, fast."*
- Visual strip card 1: **"Upload your data"** — *"CSV or Excel. We figure out the types."*
- Visual strip card 2: **"Pick what to see"** — *"Guided four-step flow. No jargon."*
- Visual strip card 3: **"Done"** — *"Live preview at every step. Always accurate."*

### Interactions

- **"Get started"** → `navigate({ to: '/datasources' })`
- **"Try with sample data"** → dynamically imports `@/lib/sample-data/seed`, seeds Superstore data source, navigates to `/datasources`. Button shows "Loading sample…" while async. On error, shows destructive toast.
- **"Style Guide" link** (top-right) → `/styleguide`

### Dark mode

Same layout. Tokens swap automatically (background `#1c1917`, foreground `#f5f5f4`, accent `#ea580c`). Gradient slightly more intense in dark for visibility (22% accent vs 18%).

---

## 2. Data Sources — `/datasources` ✅

**Mockup:** `docs/mockups/02-data-sources.html` · light (dark uses same tokens — confirmed conceptually)
**Whitepaper:** §5

### Anatomy

| Region | Contents |
|---|---|
| **Layout** | Sidebar on left (220px) · main on right. Sidebar shows: brand · Home · **Data Sources (active)** · Reports · divider · Style Guide · Settings (disabled w/ tooltip "Coming soon") · theme cycler at bottom. |
| **Page header** | Title "Data Sources" (font-serif text-2xl) + subtitle "N files · M rows total". Primary "+ Add data source" button right-aligned. |
| **Table** | shadcn Table inside a `bg-surface` + `border` + `radius-lg` container. Columns: **Name · Size · Type · Uploaded · Actions** (right-aligned). |
| **Type cell** | Tailwind-monospace pill: "CSV" or "XLSX". |
| **Most-recent indicator** | Green tick (`bg-success` rounded-full, 16×16) **beside the file name** of the most-recent. **Exactly one tick** in the entire list. Persists across refresh. |
| **Row action** | "Create Report" (ghost button, accent color) with file-plus icon. No delete in V1. |
| **Empty state** | Centered, py-24. Lucide `Database` icon (40×40, muted at 40% opacity), heading "No data sources yet" (serif text-base), nudge "Click '+ Add data source' to upload a CSV or Excel file." |

### Interactions

- **"+ Add data source"** → opens Upload Dialog (modal)
- **"Create Report"** row action → `navigate({ to: '/reports', search: { dataSourceId: id } })`
- **Row click** (not on action button) → no-op in V1 (open questions left this deferred; can be added later as preview)

### Open questions resolved

- Row entirely clickable? → **No** (action button only). Deferred to V2.
- 10-row preview on file-name click? → **V2.**
- Tick color? → **Success green** (kept, not accent).

### Dark mode

Sidebar uses `bg-surface` (dark `#292524`). Active nav item: `bg-accent/10` + `text-accent` (`#fb923c`). Tick: success in dark (`#22c55e`). Table borders: dark border (`#44403c`).

---

## 3. Upload Data Source dialog — overlay on `/datasources` ✅

**Mockup:** `docs/mockups/03-upload-dialog.html` · light + dark · three states (initial, file selected, error)
**Whitepaper:** §8

### Anatomy

| Region | Contents |
|---|---|
| **Backdrop** | Dim page to 55% black + 4px blur. Dialog floats at L3 elevation. |
| **Dialog** | Single column, max-width 460px, `bg-surface-2` + `radius-xl` + `shadow-lg`. |
| **Header** | Serif title "Add data source" + small muted description "Upload a CSV or Excel file. Limit: 10 MB or 50,000 rows." |
| **Body — File field** | Drop zone (dashed border) in initial state. When file selected, becomes a card with file icon + name + "Size · N rows" + green-check "Ready to add" confirmation + "Change" action. |
| **Body — Name field** | Standard text input. Auto-pre-fills with filename (extension stripped). |
| **Footer** | Cancel (outline) + "Add data source" (primary, with upload icon, disabled until both fields are valid). |

### Critical invariant

**Dialog height stays constant across all states.** The file area has a min-height (~132px) so the dialog doesn't jump when switching between initial / file-selected / error. The selected-file card pads itself + adds the green "Ready to add" line to fill the same vertical space as the drop zone.

### State variants

- **Initial:** drop zone empty, Name placeholder shown, primary disabled
- **File selected:** drop zone replaced by selected-file card (with file icon, name, size + row count, green "Ready to add" confirmation, "Change" link), Name pre-filled, primary enabled
- **File selected (parsing):** progress bar inside the selected-file card while parsing >5,000 rows; Name + actions stay disabled until parse completes
- **Error (oversize):** red drop zone, inline error message *"This file is too large for browser processing. Try a sample of up to 50,000 rows."*, primary disabled
- **Error (unsupported):** drop zone red, inline error message *"Please upload a CSV or Excel file."*
- **Error (empty):** dialog stays open, inline error *"This file appears empty."*
- **Submitting:** primary shows "Uploading…", Cancel disabled

### Open questions — resolved

- ✅ Parse progress indicator for files > 5,000 rows: **Yes** — progress bar inside the selected-file card during parse
- ✅ Empty-file error wording: **"This file appears empty."**
- ✅ Unsupported-type wording: **"Please upload a CSV or Excel file."**

---

## 4. Reports list — `/reports` ✅

**Mockup:** `docs/mockups/04-reports-list.html` · light + dark + empty + delete-confirm overlay
**Whitepaper:** §6

### Anatomy

| Region | Contents |
|---|---|
| **Layout** | Sidebar on left (Reports active) · main on right. |
| **Page header** | Title "Reports" (serif text-2xl) + subtitle "N reports". Primary "+ Add Report" button right-aligned. |
| **Toolbar** | Search input (with magnifying glass icon, max-width 360px) + small "N of M" results count right-aligned. Real-time filter on name + description. |
| **Table** | shadcn Table inside `bg-surface` + `border` + `radius-lg`. 5 columns: **Name · Description · Data source · Last modified · Actions** (right-aligned). |
| **Row** | Entire row clickable → opens `/reports/:id`. Hover state: subtle warm cream background (light) / `bg-muted` (dark). |
| **Description cell** | Truncated to ~80 chars with ellipsis. Empty description shows `"—"`. |
| **Last modified** | Relative time ("2 hours ago", "Yesterday", "Last week"). |
| **Delete action** | Destructive-colored trash icon button, right-aligned. Click stops row navigation propagation; opens ConfirmDialog. |
| **Confirm dialog** | Serif title `"Delete report '<name>'?"` + muted body `"This cannot be undone."` + Cancel (outline) / Delete (destructive) at L3 elevation. |
| **Empty state** | File-text icon (48×48, accent at 40% opacity), heading `"No reports yet"`, nudge `"Click '+ Add Report' to build your first chart."` |

### Sort order

Reports sorted by **`updatedAt` DESC** — most recently modified first.

### Search behavior

Client-side filter. Case-insensitive substring match against the report's `name` OR `description`. Results count updates live ("3 of 12"). Empty search shows all. No "no results" state needed if total is 0 — that falls back to the regular empty state.

### Open questions — resolved

- ✅ Show **Last modified** (not Created) as the date column
- ✅ Empty description shows `"—"`
- ✅ Sort by **most-recently-modified first**
- ✅ Search/filter promoted to **V1** (was V2 in proposal)

### V2 ideas

- Sort options (alphabetical, by data source)
- Filter dropdown by data source
- Show both Created and Last modified
- Multi-select + bulk delete

---

## 5. Add Report dialog — overlay on `/reports` ✅

**Mockup:** `docs/mockups/05-add-report-dialog.html` · light + dark + empty-data-source state
**Whitepaper:** §9

### Anatomy

| Region | Contents |
|---|---|
| **Backdrop** | Dim page to 55% black + 4px blur. Dialog at L3 elevation. |
| **Dialog** | `max-width: 720px` · `max-height: 85vh` · internal scroll · L3 elevation. Wider than Upload (column table needs the room). |
| **Header** | Serif title "Add Report" + small muted description "Pick a data source, name your report, configure columns, then save." Bottom border separates from body. |
| **Body** | Three sections, vertical stack with `gap: 18px`. Scrolls when overflowing. |
| **Section 1 — Data source** | Single dropdown of existing data sources. Pre-selected if dialog opened from `/datasources` → Create Report. **No inline upload in V1** (V2). |
| **Section 2 — Name + Description** | Single-line input + multi-line textarea (`min-height: 56px`, resizable vertical). Description has `(optional)` muted suffix. |
| **Section 3 — Columns** | Compact table inside `bg-surface` + `border` + `radius-md`. 3 columns: **Name (auto-width) · Type (30% / min 160px) · Action (fit-content)**. Each row: rename input + Type select (**Number / Category / Text / Date**) with **sample value below it** (`e.g. 2024-03-15`, `e.g. $1,234.50`, `e.g. West`, `e.g. Claire Gute`) + "Ignore" button. |
| **Ignored columns accordion** | Below the active column table. Header "Ignored columns (N)" with chevron-right when closed (default), chevron-down when open. Click to expand/collapse. Each ignored row has a "Restore" action (accent-colored). |
| **Footer** | Fixed at bottom of dialog (not scrolling). Cancel (outline) + Save report (primary, disabled until data source + name are valid). |
| **Empty data-source state** | When user has zero data sources: body shows a muted card with text + inline link "Add one from the Data Sources page" → routes to /datasources. Save remains disabled. |

### Column table widths (fluid)

```css
.cc-table { table-layout: auto; }
.cc-table th:nth-child(1) { width: auto; }           /* Name: fills */
.cc-table th:nth-child(2) { width: 30%; min-width: 160px; }  /* Type */
.cc-table th:nth-child(3) { width: 1%; white-space: nowrap; }  /* Action: fit */
```

### Save behavior

- Save button enabled when **Data source set** AND **Name non-empty**.
- On save: report is committed to `reports.store`, dialog closes, route navigates to `/reports/:newId` (Phase 05 report detail).

### Open questions — resolved

- ✅ Ignored columns section: **closed by default**
- ✅ Type labels: **Number · Category · Text · Date** (4-type system — see Global section)
- ✅ Show sample value beside Type select: **yes** — `e.g. <sample>` below the dropdown, muted, monospace
- ✅ Action column width: **fluid** (`width: 1%; white-space: nowrap`) — fits content, adapts to screen size

---

## 6. Report Detail — `/reports/:id` ✅

**Mockup:** `docs/mockups/06-report-detail.html` · light + dark · empty + chart-present states
**Whitepaper:** §7

### Anatomy

| Region | Contents |
|---|---|
| **Layout** | Sidebar on left (Reports active) · main on right with `display: flex; flex-direction: column` so canvas grows to fill. |
| **Breadcrumb** | Top of main, small text: `"Reports › <report name>"`. Reports link → `/reports`. |
| **Header row** | Two columns: editable meta on left (flex-1) + primary button on right. |
| **Editable Name** | `<input>` styled as a serif text-2xl. Transparent background, no border. Focus state: thin accent bottom border. Auto-saves on blur. |
| **Editable Description** | `<textarea rows="1">` styled as muted small text. Transparent, no border, no resize. Focus state: thin accent bottom border. **Placeholder when empty: `"No description — click to add"`** (muted). Auto-grows to fit content. Auto-saves on blur. |
| **Metadata row** | Below description: data-source tag (database icon + name, in `bg-muted` pill, `text-caption`) · `·` separator · "Last modified X ago" (muted small). |
| **Primary button** | When `report.chart === undefined`: **"Add Widget"** + plus icon. When chart exists: **"Edit Widget"** + pencil icon. Same button, label/icon swap. |
| **Canvas** | Card at L2 elevation, `flex: 1`, `min-height: 360px`, padding `p-6`, `radius-lg`. Either empty state OR chart fills it. |
| **Chart card** | Serif chart title (auto-generated, e.g., "Sum of Sales by Region") + **applied-filter chips below title** (if any filters active — see Global section) + Plotly chart that fills the available space. Auto-resizes with the window. |
| **Empty state** | Centered, bar-chart icon (48×48, accent at 40% opacity), serif heading "No chart yet", nudge "Click 'Add Widget' to build your first chart for this report." |
| **Edge case banner** | If chart references a column the user has since toggled to "ignored", the column is auto-restored on dialog open with a one-line dismissable banner: *"Column 'X' was restored because this chart needs it."* (See whitepaper §11 edge case.) |

### Inline editing details

- Name and Description are always editable in place — no separate Edit Mode.
- Click anywhere in the field to enter editing.
- Auto-save on blur (`onBlur` calls `reports.store.update`).
- ESC reverts unsaved changes (local state only; updates have already auto-saved by then since blur fires before ESC in most cases — implementation should test).

### Open questions — resolved

- ✅ Primary button label: **"Add Widget"** when no chart · **"Edit Widget"** when chart exists
- ✅ Breadcrumb at top: **keep**
- ✅ Data-source tag in metadata row: **OK placement** (below description)
- ✅ Description placeholder: **"No description — click to add"** (muted; shows when empty whether or not focused)
- ✅ "Last modified" timestamp: **live (re-renders relative time)** — implementation detail, no per-second tick needed; recomputes on any store update

---

## 7. Chart Builder dialog — overlay on `/reports/:id` ✅

**Mockup:** `docs/mockups/07-chart-builder.html` · 4 views: fresh start · bar (all 4 complete) · line (period selector in preview) · dark
**Whitepaper:** §10 · §15 (stepper state machine)

### Anatomy

| Region | Contents |
|---|---|
| **Dialog** | ~90vw × 90vh · L3 elevation · header + body |
| **Header** | Serif title "Create Chart" left · Reset All (ghost) + Cancel (outline) + Save Chart (primary, disabled until Step 2 complete) right |
| **Body grid** | `grid-template-columns: 40% 60%` — config (scrollable) left · preview (no scroll) right |
| **Config column** | **All 4 step cards always visible** in vertical stack with `gap: 12px` |
| **Preview column** | One L2 card with chart title + applied-filter chips (when any) + optional period dropdown (line only) + Plotly chart filling the rest |

### Step card states (the 4-state machine made visual)

| State | Visual | Behavior |
|---|---|---|
| **Locked** | Opacity 55% · padlock icon · header only · body hidden | Previous step not complete; cannot be clicked |
| **Active** | Accent border + soft glow · filled dot icon · body open with controls | Currently editable |
| **Complete** | Green check icon · single-line summary shown (e.g., "Sales ($) grouped by Region") · body hidden | Click summary line or step header to expand for editing; doing so triggers cascade reset per §15 |
| **Reset** | Looks like Active but with italic note inside body: *"Reset — chart type changed"* | An upstream change wiped this step's value |

### Step 3 — Filter system (locked spec)

- Click "+ Add filter" (dashed-bordered accent button) → new filter row appears
- Each row: `[Column dropdown][Value input or dropdown][× remove]`
- **Column type drives value input:**
  - **Category** → dropdown of unique values
  - **Text** → text input · case-insensitive substring (placeholder: `contains…`)
  - **Number** → text input · exact match (V2: range)
  - **Date** → text input · exact match (V2: date picker / range)
- **Multiple rows AND-ed.** Subtle "AND" divider rendered between rows (small uppercase muted text)
- Single value per row in V1. Multi-value within a column (e.g., `Region IN [West, East]`) is V2.
- Step optional — empty rows = no filters applied. Save remains enabled if Step 2 is complete.
- Each column dropdown row shows a tiny type badge after the column name (`CATEGORY` · `TEXT`) for clarity

### Line chart — period dropdown in preview header

For line charts only: a small dropdown in the top-right of the preview card's header (beside the chart title) lets the user switch between Daily · Weekly · Monthly · Quarterly · Yearly. Smart-filtered: invalid buckets are disabled in the open dropdown. System picks a sensible default; user can refine without re-opening the Step 2 config.

This control is **not** in Step 2 — it lives with the chart so the user can swap views quickly while looking at the result.

### Applied-filter chips in preview

When ≥1 filter is active, the preview card's header renders chips below the chart title:

```
[Sum of Sales by Region]
🔍 Filtered: [Category = Furniture] [Customer Name contains "office"]
```

Chip styling per the Global section above (accent-tinted pill, small filter icon, uppercase label). On the Report Detail screen (§6), the same chips render in the saved chart's card so viewers always know what's filtered.

### Save behavior

- Enabled when Step 1 + Step 2 are both **complete** (Steps 3 + 4 optional)
- On save: chart committed to `reports.store` via `setChart()`; dialog closes; user lands back on `/reports/:id` with chart now rendered

### Reset All

- No confirm dialog
- Wipes all 4 steps · emits 5-second toast with **Undo** action that restores the previous state
- After 5s the snapshot is dropped; undo no longer available

### Open questions — resolved

- ✅ All 4 steps visible from the start (with locked/active/complete states), not progressive reveal
- ✅ Period dropdown lives in the **preview pane header (top-right)** for line charts (not Step 2)
- ✅ Filter: explicit "+ Add filter" button · per-row column + value · AND across rows · V1 supports Category (dropdown), Text (input), Number/Date (input — V2 brings ranges)
- ✅ Applied filters shown as chips in the preview card and the saved chart
- ✅ No "Step N of 4" indicator (redundant since all 4 visible)
- ✅ Preview empty-state copy "Make selections to see your chart"
- ⏸️ "Step N · Locked" badge text and complete-step summary format — answered conceptually; final wording in the implementation pass

---

## 8. Style Guide — `/styleguide` ⏸️ Pending

The route renders the canonical `StyleGuide.md` content live (every token, scale, component example). To be specified when reviewed.

---

## How this doc gets updated

1. New screen pushed for review → mockup written to `docs/mockups/<num>-<name>.html`
2. User reviews via the visual companion URL (mockup mirrored into `.superpowers/.../content/` so the running server serves it)
3. On approval, this doc is updated: status `🟡 In review` → `✅ Confirmed`, anatomy + interactions filled in, open questions resolved
4. Implementation agents read this doc + the mockup HTML to implement the screen exactly
