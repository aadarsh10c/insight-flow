# InsightFlow — Refined Product Whitepaper v3
### A guided BI chart builder for business users — multi-document edition

> **What changed from v2:** the single-workspace model becomes a multi-document model. Data sources and reports are now first-class collections with their own list pages. The Chart Builder dialog and its stepper rules carry over unchanged. AI is deferred to V2.

---

## 1. The Problem We Are Solving

Looker Studio and Power BI are built around a blank canvas model. You are handed tools and expected to know what to build. For a business user this means learning vocabulary (dimensions, metrics, aggregations), understanding data structure, and making technical decisions before seeing a single insight.

InsightFlow inverts this. The user is guided step by step. Every technical decision is made by the system. The user only makes business decisions — what they want to see, how they want to group it, what to call it.

The multi-document model in v3 acknowledges a second reality: business users do this work repeatedly. They have several files. They want several views. They want to come back tomorrow and not start over. So the app organizes their work into **data sources** (the raw files) and **reports** (the views built on those files) — both persisted, both managed independently.

The result is the same chart a data analyst would build, reached through a flow a business user can actually complete, organized in a library they can return to.

---

## 2. Core Design Principles

**Guided, not open-ended.** Never present a blank canvas. Every action is prompted.

**System handles data logic, user handles business intent.** The user never selects a column because it is numeric — they select it because it represents what they want to measure. The system figures out compatibility.

**Live feedback at every step.** Every selection is immediately reflected in the chart preview. No "apply" or "render" button.

**Errors prevented, not corrected.** Incompatible selections are never shown. The save button is disabled until valid.

**Editable at any point.** No step is locked after completion. The user can return to any step and change their selection.

**Separate the raw from the analysis.** A data source is the raw upload. A report is one analysis of one data source. The same data source can support many reports, each with its own column treatment, filters, and chart.

---

## 3. Architecture Overview

### Routes (5)

| Path | Page | Notes |
|---|---|---|
| `/` | Home | Branded landing. Renders **without** the sidebar — full-screen. |
| `/datasources` | Data Sources list | List of uploaded files + Add Data Source action. |
| `/reports` | Reports list | List of saved reports + Add Report action. |
| `/reports/:id` | Report detail | Header (name + description) + chart canvas + Add Widget action. |
| `/styleguide` | Style Guide | Read-only — every token, scale, rule rendered live. Tooling, not user flow. |

### Dialogs (3)

| Dialog | Triggered from | Purpose |
|---|---|---|
| Upload Data Source | `/datasources` → "+ Add data source" | Drop file · name it · parse · save |
| Add Report | `/reports` → "+ Add Report" *or* data source row → "Create Report" | Pick data source · name & describe · configure columns · save |
| Chart Builder | `/reports/:id` → "Add Widget" | The 4-step stepper from v2 — unchanged |

### Persistence (one browser, no server, no login)

Two `localStorage` collections:

- **`dataSources`** — every uploaded file, parsed in browser, with system-inferred column types
- **`reports`** — every saved report, each referencing a `dataSourceId` plus its own column overrides and chart config

See §13 for full schema.

### Navigation chrome

A **left sidebar** is present on every route except `/` (Home renders fullscreen). The sidebar contains: Home · Data Sources · Reports · Style Guide · Settings, plus a theme indicator at the bottom.

---

## 4. Screen 1 — Home

A branded landing page that renders **full-screen** (no sidebar).

### Layout
- Logo + brand mark top-left
- Hero: large display-type headline ("Charts your team can actually build")
- Sub-headline: one-paragraph plain-English description of what InsightFlow is and who it's for
- Primary CTA: "Get started" → routes to `/datasources`
- Secondary CTA: "Try with sample data" → seeds a sample data source (bundled Superstore CSV) and routes to `/datasources` with the sample selected and the green tick beside it
- Footer: tiny link to `/styleguide`, theme toggle, copyright

### Visual personality
Same color/font/radius tokens as the product UI (see `StyleGuide.md`), but with marketing-style layout liberties: larger display type, generous whitespace, possibly a subtle gradient and an animated chart visual that demonstrates the live-preview promise.

The transition from Home → `/datasources` must feel cohesive — same colors, same fonts — just less hero, more chrome.

---

## 5. Screen 2 — Data Sources

### What it is
A persistent library of uploaded files. Each file is a "data source." No chart-building happens here.

### List view
A table with columns:

| Column | Notes |
|---|---|
| Name | User-given name (defaults to filename minus extension, editable on upload) |
| Size | Human-readable file size |
| Type | `CSV` or `XLSX` pill |
| Uploaded | Relative time ("Just now" · "2 days ago" · "Last week") |
| Actions | "Create Report" (primary) · *no delete in V1* |

A **green tick mark** appears beside the **most-recently uploaded** data source. There is exactly one tick at any time. The tick persists across page reloads until a newer data source is added.

### Add Data Source
"+ Add data source" button top-right of the list. Opens the Upload Data Source dialog (§8).

### V1 omissions (explicit)
- No delete action. Users can only add. If they need a clean slate, they clear browser storage from Settings.
- No rename after upload. The name is set at upload time and locked.
- No data preview here. Preview only happens in the Add Report dialog's column configuration.

---

## 6. Screen 3 — Reports List

### What it is
A persistent library of every saved analysis the user has built.

### List view
A table with columns:

| Column | Notes |
|---|---|
| Name | User-given report name |
| Description | Truncated to one line; empty shows `"—"` |
| Data source | Name of the referenced data source |
| Last modified | Relative time |
| Actions | "Open" (default on row click) · "Delete" with confirm |

Sort: **most-recently-modified first** (`updatedAt` DESC).

### Search / filter
A search input above the table filters the list in real time by report name OR description (case-insensitive substring match). A small "N of M" count appears beside the search input. Empty search shows all reports.

### Add Report
"+ Add Report" button top-right. Opens the Add Report dialog (§9).

### Delete behavior
Each row has a delete action. Click → confirm dialog: *"Delete report 'Sales Q3'? This cannot be undone."* Confirm → report is removed from storage. The data source is untouched (data sources cannot be deleted in V1 anyway).

### Empty state
*"No reports yet — click 'Add Report' to build your first chart."*

---

## 7. Screen 4 — Report Detail

A single-chart canvas. Lives at `/reports/:id`.

### What is on this screen
- Header row: report name (editable in-line) · description (editable in-line) · last-modified timestamp
- Body: one of two states
  - **No chart yet:** centered prompt — *"Click 'Add Widget' to build your first chart"*
  - **Chart exists:** the rendered Plotly chart, full canvas width, with a small "Edit" icon on hover at top-right of the chart
- Top-right toolbar: "+ Add Widget" button (primary, disabled if chart already exists in V1)

### V1 constraint
**One chart per report.** Multiple charts per report is a V2 feature. The "Add Widget" button is disabled once a chart exists; the user edits the existing one or creates a new report for a different chart.

### Editing a chart
- Click the edit icon on the chart → opens the Chart Builder dialog (§10) with the chart's saved configuration loaded.
- If the referenced column was since marked "Ignore" in the report's column config, it is **auto-restored** on dialog open with a one-line note: *"Column 'Sales' was restored because this chart needs it."*

---

## 8. Dialog — Upload Data Source

Modal dialog. Triggered from `/datasources` "+ Add data source".

### Fields
- **File drop zone** — accepts `.csv`, `.xlsx`. Drag-and-drop or click to browse.
- **Name** — text input. Defaults to the file's name minus extension. Required.

### Behavior
1. User selects file. Drop zone shows filename + size.
2. Name field pre-fills with the cleaned filename.
3. User can edit the name.
4. "Add data source" button enabled once a file is selected and name is non-empty.
5. On click: the file is parsed in the browser using PapaParse (CSV) or SheetJS (Excel). System-inferred column types are computed (see §11) but not shown.
6. On success: dialog closes, list refreshes, the new data source appears at the top with the green tick.

### Upload limits
- Hard cap: **10 MB** file size or **50,000 rows**, whichever is hit first.
- Above either limit, the upload is rejected with a friendly message: *"This file is too large for browser processing. Try a sample of up to 50,000 rows."*
- Below the cap, files parse immediately. Files >5,000 rows show a progress indicator.

### Error states
- **Parse failure (corrupt file or unsupported format):** toast error with parser's reason; dialog stays open for retry.
- **Empty file (<1 data row):** inline error in the dialog: *"This file appears empty."*

---

## 9. Dialog — Add Report

Full-screen dialog. Triggered from `/reports` "+ Add Report" or from a data source row's "Create Report" action.

### Three sections (top to bottom)

**1. Data source**
- If triggered from a data source row, that source is pre-selected.
- Otherwise: dropdown of existing data sources only. **No inline upload from this dialog in V1.** If the user has no data sources yet, the dropdown is disabled with a hint: *"You have no data sources. Add one from the Data Sources page first."*

**2. Name & description**
- Name (required, text input)
- Description (optional, text area)

**3. Column configuration**
- A table of every column in the selected data source.
- Per column:
  - **Name** (editable rename — what the chart will display)
  - **Type** (system-inferred default; user can change between **Number / Category / Text / Date** with a single click) · a small sample value from the data is shown below the dropdown to help the user confirm the type (e.g., `e.g. West`, `e.g. 2024-03-15`)
  - **Ignore for this report** toggle (excludes the column from chart building)
- Ignored columns collapse to an "Ignored columns" section at the bottom, restorable at any time.

### Save behavior
- Save button enabled when: a data source is selected AND name is non-empty.
- On save: the report is persisted with its column overrides; dialog closes; **routes to `/reports/:newId`** (the new report's detail page), where the user immediately sees the empty state inviting them to "Add Widget."

### Constraint
Column configuration is **per-report**. Data sources hold system-inferred types only — they are never edited at the data-source level. The same data source can support many reports, each with its own renames, type overrides, and ignored columns.

---

## 10. Dialog — Chart Builder

This dialog is **unchanged from v2** (preserved as §6 of v2). Summary here; full state machine in §19.

### Layout
Full screen dialog. Two columns:
- Left (40%): step-by-step configuration
- Right (60%): live chart preview

### Steps
1. **Chart type** — Bar · Pie · Line cards. Incompatible cards greyed with explanation.
2. **Data** — Compatible columns only; differs per chart type. Line chart includes a **"View as"** segmented control offering Daily · Weekly · Monthly · Quarterly · Yearly (smart-filtered to only valid buckets for the data).
3. **Filter (optional)** — pick a column + value(s).
4. **Style (optional)** — title, axis/slice labels, color (curated 12-swatch picker — see `StyleGuide.md` §12b), legend toggle.

### Save
Enabled after Step 2 complete. On save: dialog closes, chart appears on the report detail.

### Reset All
Header button. Click → instant reset with a 5-second undo toast (no confirm dialog).

### Color override
Users pick the chart color from a curated **12-swatch palette** (warm / cool / neutral rows, all at 700-shade), pre-validated for both light and dark mode. No free hex input in V1.

---

## 11. Data Type Detection Logic

**Four types.** Detected in this order:

1. **TEMPORAL** (user-facing label: **Date**) — 80%+ of values match any of:
   - `YYYY-MM-DD` / `DD/MM/YYYY` / `MM-DD-YYYY`
   - Year only (`2024`)
   - Month-Year (`Jan 2024`)
   - Quarter (`Q1 2024`)
2. **NUMERIC** (user-facing label: **Number**) — 90%+ of non-empty values parse as a number after stripping `$`, `,`, `%`.
3. **CATEGORICAL** (user-facing label: **Category**) — non-numeric, non-date column where unique values ≤ 50 **AND** unique-ratio < 0.5. Used for grouping, splitting, and dropdown-based filtering.
4. **TEXTUAL** (user-facing label: **Text**) — non-numeric, non-date column with too many unique values for grouping. Identification-only; filterable via text-input substring match.

User sees the column name and detected type. Nothing more. No warning badges, no hints, no annotations. The user decides what to ignore based on their own knowledge of their data; the user can also override any auto-detected type via the Add Report column-config table.

### Filter UX per type (V1)

| Type | Filter input |
|---|---|
| **Number** | Numeric input · exact match |
| **Category** | Dropdown of unique values · exact match |
| **Text** | Text input · case-insensitive substring match |
| **Date** | Text input · exact match (V2: date range picker) |

### Chart compatibility per type

| Chart role | Compatible types |
|---|---|
| Measure (bar Y, pie value, line Y) | **Number only** |
| Group (bar X) / Split (pie) | **Category only** (Text excluded — too high-cardinality) |
| Time axis (line X) | **Date only** |
| Filter column (Step 3) | Number · Category · Text · Date (all four) |

---

## 12. Suggestion Engine

The system does not suggest which chart to build. The user decides.

What the system does instead:
- Detects which chart types are valid given the selected report's column config.
- Greys out invalid chart types with a plain English explanation.
- At each step, shows only columns that are compatible with the chart type selected.
- Handles all aggregation automatically (SUM for bar/pie; ordered sequence for line).

This is the key difference from Looker Studio. The user makes zero data decisions. They make only business decisions.

---

## 13. Persistence (V1)

Two `localStorage` collections, both auto-saved on every write.

### Schema (illustrative — final shape lives in code)

```ts
type DataSource = {
  id: string                  // uuid
  name: string                // user-given
  filename: string            // original filename
  type: 'csv' | 'xlsx'
  sizeBytes: number
  uploadedAt: number          // epoch ms
  columns: { name: string; inferredType: 'text' | 'number' | 'date' }[]
  rows: Record<string, unknown>[]  // parsed data
}

type Report = {
  id: string                  // uuid
  name: string
  description: string
  dataSourceId: string        // ref
  columnConfig: Record<string, {
    label?: string            // rename
    type?: 'text' | 'number' | 'date'  // override
    ignored?: boolean
  }>
  chart?: {
    type: 'bar' | 'pie' | 'line'
    config: { /* per chart type */ }
    filters: { column: string; values: unknown[] }[]
    style: { title?: string; color?: string; legend?: boolean; /* etc */ }
  }
  createdAt: number
  updatedAt: number
}
```

### Most-recent indicator
A separate `lastUploadedDataSourceId` field in storage drives the green tick on the Data Sources list. Updated on every successful upload.

### "Clear all data" action
Lives in Settings. Confirms strongly, then wipes both collections + the most-recent indicator. No selective clear in V1.

---

## 14. AI — Deferred to V2

V1 ships without AI. The stepper, column-compatibility rules, and deterministic guidance are the entire product.

This is a deliberate scope choice. The whitepaper's core thesis is that the system makes technical decisions through *rules*, not predictions — and a free-text natural-language input would reintroduce the open-ended mode the app exists to prevent. Users do not type what they want. They are guided.

V2 may add AI in a *silent augmentation* role — generating chart auto-titles, surfacing one-sentence insights below charts, or ranking which columns are worth charting first. The user would never type a prompt; AI would enrich the guided flow invisibly.

The architecture leaves a clean seam between deterministic logic and any future enhancement layer.

---

## 15. Limitations (V1) — Documented Honestly

| Limitation | Why it exists | How it is addressed |
|---|---|---|
| One chart per report | Scope decision — polish over breadth | V2: multiple widgets per report, drag to rearrange |
| No multi-measure charts | Requires relationship mapping between columns | V2: user can declare related columns |
| Line chart requires Date column | CATEGORICAL has no natural order | Documented in greyed-out state with fix hint |
| Pie chart limited to 6 categories | More slices become unreadable | Auto-group as "Other" for 7–20 values |
| High-cardinality columns not chartable | Region with 800 values produces unreadable charts | Available as filter — user can still narrow by it |
| No computed columns | e.g. Profit Margin = Profit / Sales | V2: with AI key, derived metrics possible |
| CSV and Excel only | Scope decision | V2: Google Sheets connector, database connections |
| Desktop-first design | BI tools are used on laptops; full mobile UI would double scope | Usable at <1024px; friendly notice below 640px without blocking |
| File size cap 10 MB / 50k rows | Browser-side parsing has memory ceilings | Above cap: rejected with sampling guidance |
| Data sources cannot be deleted | V1 scope cut — users can only add | V2: delete with cascade rules |
| Data sources cannot be renamed after upload | V1 scope cut | V2: editable name |
| Free-hex chart color picker | Risk of dark-mode contrast failures | V2: paired with contrast guard |

---

## 16. Tech Stack

| Decision | Choice | Reason |
|---|---|---|
| Framework | React 19 + Vite | Brief mandates React; Vite for fast builds |
| Routing | React Router | 5 routes in v3 model |
| Charts | Plotly.js | Brief mandates Plotly |
| File parsing | PapaParse (CSV) + SheetJS (Excel) | Browser-only |
| State management | Zustand | Lightweight, minimal boilerplate |
| Persistence | `localStorage` (two collections + metadata) | No server, no login |
| Component primitives | shadcn/ui | Locked design choice |
| Icons | Lucide | Locked design choice |
| Styling | Tailwind CSS v4 (CSS-first `@theme` config) | Locked design choice |
| Theme system | Light + Dark (auto/system + override) | Locked design choice |
| Deployment | Vercel | Free tier, one-command deploy |

Full visual rules, tokens, and component-level styling: see `docs/StyleGuide.md`.

---

## 17. What We Build Next (Week 2)

| Feature | Why |
|---|---|
| Multiple charts per report | Complete the report-as-dashboard vision |
| Drag-to-rearrange widgets | Standard dashboard UX |
| Data source delete (with cascade rules) | V1 add-only is friction once a user accumulates files |
| Data source rename | Same |
| Column relationship declaration | Unlocks multi-measure charts |
| AI augmentation (silent) | Auto-titles · one-sentence insights · smart column ranking — never user-typed prompts |
| PDF / image export | Share insights with stakeholders |
| Named saved dashboards | Multiple workspaces with names (V1 already auto-persists one library) |
| Google Sheets connector | Removes the upload step for live data |
| Free-hex color picker (with contrast guard) | More user color freedom without breaking dark mode |
| Inline upload from Add Report dialog | Quicker workflow when creating a report and you realize you need a new source |

---

## 18. Summary

InsightFlow v3 is a guided BI chart builder organized as a small library. A business user lands on a branded home, uploads a data source, builds a report on that source through an Add Report dialog that handles all column treatment, then constructs the single chart through the same step-by-step Chart Builder dialog that made the v2 thesis work.

The library makes the app durable across sessions. The per-report column treatment makes each analysis self-contained. The Chart Builder makes the chart accurate and fast.

Polish over breadth, at every layer.

---

## 19. Chart Builder — Stepper State Machine

### Step States
Every step in the chart builder dialog has one of four states at any time:

| State | Meaning |
|---|---|
| locked | Cannot be accessed — previous step not yet complete |
| active | User is currently on this step |
| complete | Filled in — always revisitable |
| reset | Was complete, cleared because an upstream step changed |

### Forward Flow — Normal Path

```
Start
Step 1 [active]    Step 2 [locked]    Step 3 [locked]    Step 4 [locked]

Complete Step 1 (chart type selected)
Step 1 [complete]  Step 2 [active]    Step 3 [locked]    Step 4 [locked]

Complete Step 2 (columns selected)
Step 1 [complete]  Step 2 [complete]  Step 3 [active]    Step 4 [locked]
                                      ↑
                                 Save button enables here
                                 Steps 3 and 4 are optional

Complete Step 3 (filter set or skipped)
Step 1 [complete]  Step 2 [complete]  Step 3 [complete]  Step 4 [active]
```

Save button enables after Step 2 is complete. Steps 3 (filter) and 4 (style) are optional — the user can save at any point after Step 2.

### Backward Navigation — Cascade Reset Rules

**User goes back to Step 1 and changes chart type:**
- Steps 2, 3, 4 → reset and locked

**User goes back to Step 2 and changes a column:**
- Steps 3, 4 → reset

**User goes back to Step 3 and changes filter:**
- Step 4 stays intact

**User changes Step 4 (style only):**
- Nothing resets

### Cascade Reset Summary

| User changes | Steps reset |
|---|---|
| Step 1 — chart type | 2, 3, 4 |
| Step 2 — any column selection | 3, 4 |
| Step 3 — filter | nothing |
| Step 4 — style | nothing |
| Reset All button | 1, 2, 3, 4 (with 5-second undo toast) |

### Reset All Button
Always visible in the dialog header. Clicking it returns the entire dialog to its initial state.

No confirmation dialog. Instead, an inline toast appears for 5 seconds with an **"Undo"** link that restores the previous state in full.

### Inline Reset Feedback
When a step is reset by an upstream change, a one-line note appears inside that step:

> *"Reset — chart type changed"*

No popup. No modal. Just a subtle inline message so the user understands why their previous selection is gone.

### State in Code — Zustand Store Shape (illustrative)

```ts
{
  currentStep: 1,
  steps: {
    1: { status: 'active',    value: null },        // chart type
    2: { status: 'locked',   value: null },         // columns
    3: { status: 'locked',   value: null },         // filters
    4: { status: 'locked',   value: null }          // style
  },
  canSave: false
}
```

Any upstream change triggers a targeted state wipe — only the affected steps are cleared. The chart preview on the right side of the dialog re-renders on every state change, always reflecting current selections.
