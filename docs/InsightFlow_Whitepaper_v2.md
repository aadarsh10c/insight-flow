# InsightFlow — Refined Product Whitepaper v2
### A chart builder for business users who want accurate insights without learning a tool

---

## 1. The Problem We Are Solving

Looker Studio and Power BI are built around a blank canvas model. You are handed tools and expected to know what to build. For a business user this means learning vocabulary (dimensions, metrics, aggregations), understanding data structure, and making technical decisions before seeing a single insight.

InsightFlow inverts this. The user is guided step by step. Every technical decision is made by the system. The user only makes business decisions — what they want to see, how they want to group it, what to call it.

The result is the same chart a data analyst would build, reached through a flow a business user can actually complete.

---

## 2. Core Design Principles

**Guided, not open-ended**
Never present a blank canvas and expect the user to know what to do. Every action is prompted.

**System handles data logic, user handles business intent**
The user never selects a column because it is numeric. They select it because it represents what they want to measure. The system figures out compatibility.

**Live feedback at every step**
Every selection the user makes is immediately reflected in the chart preview. There is no "apply" or "render" button. The chart is always showing the current state.

**Errors prevented, not corrected**
Incompatible selections are never shown. The save button is disabled until the chart is valid. The user cannot build a broken chart.

**Editable at any point**
No step is locked after completion. The user can return to any step and change their selection. The chart updates immediately.

---

## 3. Three Screens, One Flow

```
Screen 1: Upload          Screen 2: Dashboard        Dialog: Chart Builder
──────────────────────    ──────────────────────────  ──────────────────────────────
Upload CSV/Excel          Blank canvas                Full screen dialog
↓                         "Add Widget" top right      Left: step by step config
Columns appear            ↓                           Right: live chart preview
with inferred types       Opens Chart Builder         ↓
↓                         dialog                      On Save → chart appears
User edits types                                      on dashboard
↓
"Generate Report"
→ Dashboard
```

---

## 4. Screen 1 — Upload & Column Types

### What happens
User uploads a CSV or Excel file. The system parses it immediately in the browser using PapaParse (CSV) or SheetJS (Excel). No data is sent to a server at this point.

### Try with sample data
A secondary "Try with sample data" button on the empty Upload screen loads a bundled Superstore CSV with one click. This removes first-touch friction for evaluators and demo recordings. The flow afterwards is identical to a user-uploaded file.

### Upload limits
- Hard cap: **10 MB** file size or **50,000 rows**, whichever is hit first.
- Above either limit, the file is rejected with a friendly message: *"This file is too large for browser processing. Try a sample of up to 50,000 rows."*
- Files below the cap parse immediately with progress feedback for >5,000 rows.

### Error & empty states
- **Parse failure (corrupt file or unsupported format):** toast error with the parser's reason, plus a "Try again" affordance. The Upload screen stays as-is so the user can re-drop.
- **Empty file (< 1 data row):** inline error on the Upload screen: *"This file appears empty. Please check your data and try again."*
- **No NUMERIC columns detected:** the user can still proceed to Dashboard, but all three chart cards will be greyed (see §6 Step 1) with a hint pointing back to type editing.

Columns are displayed in a clean table with two pieces of information:
- Column name
- Inferred data type

### Three data types only
The user sees exactly three types. No more.

| Type shown to user | What it means internally | Used for |
|---|---|---|
| Text | CATEGORICAL | Grouping, filtering |
| Number | NUMERIC | Measuring, calculating |
| Date | TEMPORAL | Time axis on line charts |

These map directly to what the three chart types need. Nothing else is exposed.

### Why user can edit types
Automatic inference is imperfect. A column called `Cost` containing `$25.00` may be read as Text. A column called `Quarter` containing `Q1, Q2, Q3` is technically text but the user knows it is ordered time data.

The user sees the inferred type and can change it with a single click. This one step prevents the majority of wrong chart suggestions downstream.

### All columns are shown — user decides what to ignore
Every column from the uploaded file is displayed. The system never silently removes anything. The user has full visibility of their data.

For columns the system is less confident about — an ID column, a column with only one unique value, or a column where unique values exceed 80% of total rows — a subtle warning tag is shown next to the inferred type:

> *"May not be useful for charting"*

This is a hint, not a decision. The column remains fully included unless the user explicitly ignores it.

Each column row has an **"Ignore for this report"** toggle. When toggled off:
- The column is excluded from all chart building steps
- It moves to a collapsed "Ignored columns" section at the bottom of the screen
- It can be restored at any time by expanding that section and toggling it back on
- The underlying data is never affected — ignoring is per-report only

This keeps the system transparent. The user always knows what data they are working with and what they have chosen to exclude.

### Exit
"Generate Report" button navigates to the Dashboard. This button is always enabled once a file is uploaded.

---

## 5. Screen 2 — Dashboard

### What it is
A clean display canvas. Its only job is to show charts and let the user manage them. It is not where charts are built.

In V1: one chart maximum.

### What is on this screen
- Top right: "Add Widget" button (primary action)
- If a chart exists: the chart, with an edit icon on hover
- **Empty state (no chart yet):** centered prompt — *"Click 'Add Widget' to build your first chart"* — large enough to feel like an intentional zero-state, not a missing element.

### What is not on this screen
No column selectors. No chart type pickers. No configuration of any kind. All of that lives in the Chart Builder dialog.

### Add Widget / Edit
- Clicking "Add Widget" opens the Chart Builder dialog
- Clicking edit on an existing chart reopens the Chart Builder with all previous selections loaded
- On save, the chart on the dashboard updates immediately

---

## 6. The Chart Builder Dialog

### Layout
Full screen dialog (not a drawer, not a small modal). Two columns:

```
┌──────────────────────────┬───────────────────────────────┐
│  LEFT — Configuration    │  RIGHT — Live Chart Preview   │
│  (40% width)             │  (60% width)                  │
│                          │                               │
│  Step 1: Chart Type      │  Chart renders here           │
│  Step 2: Data            │  Updates on every change      │
│  Step 3: Filter          │  Shows placeholder state      │
│  Step 4: Style           │  when required fields         │
│                          │  are not yet filled           │
│  [Save Chart] ← disabled │                               │
│  until Step 2 complete   │                               │
└──────────────────────────┴───────────────────────────────┘
```

The right side is always visible. The user always sees the consequence of their choices in real time. This is the core UX differentiator.

---

### Step 1 — Chart Type

Three options displayed as cards with plain English descriptions. Not "chart type" labels — what they mean for the user.

| Card | Description | When it is greyed out |
|---|---|---|
| Bar chart | "Compare values across categories" | Never — always available if NUMERIC + CATEGORICAL exist |
| Pie chart | "See how a total is split" | If no CATEGORICAL column with ≤ 6 unique values exists |
| Line chart | "See how a value changes over time" | If no Date (TEMPORAL) column exists |

Greyed out cards show a one-line explanation:
> *"No date column found — go back to edit column types to enable this"*

This surfaces the type editing step as the fix, not a dead end.

---

### Step 2 — Data

This step changes based on the chart type selected. The user only sees columns that are compatible. Incompatible columns are never shown.

**Bar chart:**
- "What do you want to measure?" → shows NUMERIC columns only
- "How do you want to group it?" → shows CATEGORICAL columns only

**Pie chart:**
- "What do you want to measure?" → shows NUMERIC columns only
- "How do you want to split it?" → shows CATEGORICAL columns with ≤ 6 unique values only
- If a CATEGORICAL column has 7–20 unique values: show it with a note *"Top 6 values will be shown, rest grouped as Other"*

**Line chart:**
- "What do you want to track?" → shows NUMERIC columns only
- "Over what period?" → shows TEMPORAL (Date) columns only
- **"View as"** — a segmented control offers Daily · Weekly · Monthly · Quarterly · Yearly. The system auto-picks a default based on data range; the user can switch granularity at any time.
- **Smart filtering:** only buckets that produce a readable chart for the current data are enabled. e.g., 30 unique dates disables Quarterly/Yearly; 10 years of daily data disables Daily. Buckets that would produce <2 points or >500 points are hidden.
- This is the one place V1 lets the user adjust a view-shape decision. The whitepaper's broader rule ("system handles data logic") still holds — the user is choosing a granularity of view, not picking how to compute it.

---

### Step 3 — Filter (Optional)

One skippable step. Always optional.

> *"Want to narrow your data?"*

User picks a column to filter by (any CATEGORICAL column from the dataset, including high-cardinality ones like Customer Name).

Then picks a value from a dropdown of that column's unique values.

Multiple filters can be added. Each appears as a removable tag.

Skip button is prominent. Most users will skip this on first use.

---

### Step 4 — Style

Minimal. Only options that a business user would actually care about.

| Option | What it does |
|---|---|
| Chart title | Rename the chart (defaults to auto-generated name e.g. "Sales by Region") |
| Axis / slice labels | Rename column labels as they appear on the chart |
| Color | Pick a color for bars, line, or pie slices |
| Legend | Toggle on or off |

No font pickers. No border options. No opacity sliders. Those add complexity without business value.

---

### Save Behaviour

Save button is disabled until Step 1 and Step 2 are both complete.

On save:
- Dialog closes
- Chart appears on the dashboard
- Dashboard is the source of truth

---

## 7. Data Type Detection Logic

Three types. Detected in this order:

**TEMPORAL** — 80%+ of values match any of:
```
YYYY-MM-DD / DD/MM/YYYY / MM-DD-YYYY
Year only (2024)
Month-Year (Jan 2024)
Quarter (Q1 2024)
```

**NUMERIC** — 90%+ of non-empty values parse as a number after stripping `$`, `,`, `%`

**TEXT (CATEGORICAL)** — everything else

**Warning hints shown to user — column still included, never removed automatically:**
- Column name contains `id`, `code`, `zip`, `postal`, `phone` → tagged *"May not be useful for charting"*
- Column has only 1 unique value → tagged *"Only one value — limited use"*
- Column unique ratio > 0.8 → tagged *"Too many unique values to chart — better as a filter"*

User sees all columns. User decides what to ignore.

---

## 8. Suggestion Engine

The system does not suggest which chart to build. The user decides.

What the system does instead:
- Detects which chart types are valid given the uploaded data
- Greyed out invalid chart types with a plain English explanation
- At each step, shows only columns that are compatible with the chart type selected
- Handles all aggregation automatically (sum for bar/pie, ordered sequence for line)

This is the key difference from Looker Studio. The user makes zero data decisions. They make only business decisions.

---

## 9. Limitations (V1) — Documented Honestly

| Limitation | Why it exists | How it is addressed |
|---|---|---|
| One chart per dashboard | Scope decision — polish over breadth | V2: multiple charts, drag to rearrange |
| No multi-measure charts | Requires relationship mapping between columns | V2: user can declare related columns |
| Line chart requires Date column | CATEGORICAL has no natural order | Documented in greyed-out state with fix hint |
| Pie chart limited to 6 categories | More slices become unreadable | Auto-group as "Other" for 7–20 values |
| High-cardinality columns not chartable | Region with 800 values produces unreadable charts | Available as filter — user can still narrow by it |
| No computed columns | e.g. Profit Margin = Profit / Sales | V2: with AI key, derived metrics possible |
| CSV and Excel only | Scope decision | V2: Google Sheets connector, database connections |
| Desktop-first design | BI tools are used on laptops; full mobile UI would double scope | Usable at <1024px; friendly notice below 640px without blocking |
| File size cap 10 MB / 50k rows | Browser-side parsing has memory ceilings | Above cap: rejected with sampling guidance |

---

## 10. AI — Deferred to V2

V1 ships without AI. The stepper, column-compatibility rules, and deterministic guidance are the entire product.

This is a deliberate scope choice. The whitepaper's core thesis is that the system makes technical decisions through *rules*, not predictions — and a free-text natural-language input would reintroduce the open-ended mode the app exists to prevent. Users do not type what they want. They are guided.

V2 may add AI in a *silent augmentation* role — generating chart auto-titles, surfacing one-sentence insights below charts, or ranking which columns are worth charting first. In any V2 form, the user never types a prompt and AI never asks "what do you want?"; it enriches the guided flow invisibly.

The architecture leaves a clean seam between deterministic logic and any future enhancement layer.

---

## 11. Persistence (V1)

The active workspace persists to browser `localStorage` while the user is on the same browser. A page refresh restores:

- the parsed dataset
- user-edited column types
- the list of ignored columns
- the current chart configuration

The user does not lose work to an accidental reload.

This is intentionally **not** the V2 "named saved dashboards" feature. There is only one workspace per browser. A "Start over" action in the app shell clears it explicitly with confirmation.

No server. No login. No multi-dashboard history. Just durable in-progress state.

### Edge case: editing a chart whose column was ignored
If the user opens an existing chart for editing, and the chart references a column that was since toggled "Ignore for this report", the column is **automatically restored** on dialog open. A subtle inline note appears once:
> *"Column 'Sales' was restored because this chart needs it."*

This prevents a broken edit flow and respects the "errors prevented, not corrected" principle.

---

## 12. Tech Stack

| Decision | Choice | Reason |
|---|---|---|
| Framework | React + Vite | Fast builds, component model fits the stepper |
| Charts | Plotly.js | Required by brief. Handles bar, line, pie cleanly |
| File parsing | PapaParse (CSV) + SheetJS (Excel) | Browser-only, no server needed |
| State management | Zustand | Lightweight, minimal boilerplate, easy to explain |
| Styling | Tailwind CSS | Utility-first, fast to build, consistent |
| Deployment | Vercel | Free tier, one command deploy |

---

## 13. What We Build Next (Week 2)

| Feature | Why |
|---|---|
| Multiple charts on dashboard | Complete the dashboard vision |
| Drag to rearrange charts | Standard dashboard UX |
| Column relationship declaration | Unlocks multi-measure charts |
| AI natural language input | Shortcut for power users |
| PDF / image export | Share insights with stakeholders |
| Named saved dashboards | Multiple workspaces, give them names (V1 already auto-persists one workspace) |
| AI augmentation (silent) | Auto-titles, one-sentence insights, smart column ranking — never user-typed prompts |
| Google Sheets connector | Removes the upload step for live data |

---

## 14. Summary

InsightFlow is a chart builder, not a BI platform. Its scope is deliberately narrow.

A business user uploads their data, confirms how their columns should be interpreted, and builds a chart through a guided four-step flow — without selecting a single dropdown that requires understanding data structure.

The result is accurate because the system constrains every choice to what is valid. The result is fast because every step is focused. The result is trustworthy because the user sees the chart update in real time and confirms it before it lands on their dashboard.

That is the entire product. Done well.


---

## 15. Chart Builder — Stepper State Machine

### Step States
Every step in the chart builder dialog has one of four states at any time:

| State | Meaning |
|---|---|
| locked | Cannot be accessed — previous step not yet complete |
| active | User is currently on this step |
| complete | Filled in — always revisitable |
| reset | Was complete, cleared because an upstream step changed |

---

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

---

### Backward Navigation — Cascade Reset Rules

**User goes back to Step 1 and changes chart type:**
- Steps 2, 3, 4 → reset and locked
- Chart type determines column compatibility — nothing downstream is trustworthy after this change
- After Step 1 is re-completed, Step 2 becomes active again

**User goes back to Step 2 and changes a column:**
- Steps 3, 4 → reset
- Filter may reference a column that is no longer selected
- Style axis label renames are tied to column names — they reset too

**User goes back to Step 3 and changes filter:**
- Step 4 stays intact
- Title and colors do not depend on filter selections

**User changes Step 4 (style only):**
- Nothing resets

---

### Cascade Reset Summary

| User changes | Steps reset |
|---|---|
| Step 1 — chart type | 2, 3, 4 |
| Step 2 — any column selection | 3, 4 |
| Step 3 — filter | nothing |
| Step 4 — style | nothing |
| Reset All button | 1, 2, 3, 4 |

---

### Reset All Button
Always visible in the dialog header. Clicking it returns the entire dialog to its initial state — Step 1 active, all others locked, chart preview shows empty placeholder.

No confirmation dialog. Instead, an inline toast appears for 5 seconds with an **"Undo"** link that restores the previous state in full. Frictionless if intentional, recoverable if not.

---

### Inline Reset Feedback
When a step is reset by an upstream change, a one-line note appears inside that step:

> *"Reset — chart type changed"*

No popup. No modal. Just a subtle inline message so the user understands why their previous selection is gone. Prevents confusion without interrupting the flow.

---

### State in Code — Zustand Store Shape

```javascript
{
  currentStep: 1,
  steps: {
    1: { status: 'active',    value: null },        // chart type
    2: { status: 'locked',   value: null },        // columns
    3: { status: 'locked',   value: null },        // filters
    4: { status: 'locked',   value: null }         // style
  },
  canSave: false
}
```

Any upstream change triggers a targeted state wipe — only the affected steps are cleared. The chart preview on the right side of the dialog re-renders on every state change, always reflecting current selections.

