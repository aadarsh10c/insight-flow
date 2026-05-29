# InsightFlow — Write-Up

**Build a BI Dashboarding Tool · Take-home · Adarsh Kumar**

> A guided BI chart builder for business users with no technical background. Live URL: *(deployment pending — see §5)*. Repo: this folder. Stack: React 19 + TypeScript + Vite + TanStack Router + Zustand + Plotly.

---

## 1 · The analysis — what I studied, what stood out

Per the brief, I limited my study to **Looker Studio** (Google). It's free, browser-based, the most likely tool an actual business user gets handed at work, and the one the brief explicitly calls out. I spent a few hours rebuilding the same chart against a CSV — "sales by category over time" — and watched where I, with full technical background, still hit friction. If I, an engineer, hesitate on a Looker screen, a business user is stuck.

**Three observations from Looker Studio changed the design:**

**a) The blank canvas is the problem.** Looker Studio opens to an empty report page and a right-side panel of tools — Dimensions, Metrics, Date range dimension, Breakdown dimension, Sort, Filter, Blend data. The user's first decision isn't *what do I want to see*, it's *what does "dimension" mean here*. A business user who came to answer a business question is now answering a UI vocabulary question.

**b) Data type is presented as the user's problem.** Looker surfaces column types — `Text`, `Number`, `Date`, plus the `Dimension` vs. `Metric` distinction. To chart something "over time" the user has to know that the date column goes in the *Date range dimension* slot and the numeric column goes in the *Metric* slot. The chart-type picker is reactive — it shows what's *possible* given the columns the user has dragged, not what they should *do*. The system never tells the user what to choose; it only tells them when they've chosen wrong.

**c) "Editing later" is a separate flow.** Once a chart is created in Looker, editing it means clicking the chart, opening the right-side panel again, and using a slightly different surface — the create-time controls don't survive as the edit-time controls. For a business user who comes back tomorrow to tweak the date range, the mental model of *building* and *editing* is split. That split is unnecessary friction.

**The decision I acted on:** invert the model. The user should never see a blank canvas, never need to know column types, and should be able to edit any field at any point in one continuous flow. The system makes the technical decisions; the user makes the business decisions.

---

## 2 · Design decisions — what I built and why

I scoped the prototype to **one feature done well** rather than ten features half-done: **the guided chart builder**. Everything else exists to support it.

### 2.1 · Multi-document model, not a workspace

The app is organized around two persistent collections: **Data Sources** (raw CSV uploads, kept in IndexedDB) and **Reports** (one analysis built on one data source, with one chart). This mirrors how a real business user works — they have several files and several views, and they come back days later. A single-workspace model would have made the demo cleaner but the product unusable.

### 2.2 · The 4-step chart builder

Every chart is built in a dialog with a visible stepper:

1. **Chart type** — Line, Bar, Pie. Pictures, not words.
2. **Configure** — pick what to show and how to group it. Columns are labelled by what they *represent*, not what type they are. The system filters which columns are compatible with the chosen chart type — incompatible options are never shown, so the user can't make a mistake.
3. **Filter** *(optional)* — add row filters. Date columns get a real calendar (range picker), category columns get a searchable combobox, numbers get min/max.
4. **Style** *(optional)* — color, legend name (line charts only).

Two principles I enforced strictly:

- **No "Apply" / "Render" button.** Every selection updates the preview live. The user sees consequence before commitment.
- **Editable in place.** The same dialog opens for create and edit. No mode switch. The footer says "Save Chart" or "Save Changes" — that's the only difference.

### 2.3 · Errors prevented, not corrected

The "Save" button stays disabled until the configuration is valid. The user is never shown an error message — they're shown a disabled button, with the failing step highlighted in the stepper. This is a deliberate inversion: most tools let you build a broken chart and then explain why it broke.

### 2.4 · Column treatment at upload, not at chart time

When a CSV is uploaded, I show a column-config table: detected name, detected type, sample value, and an action (rename or ignore). This is the **one technical moment** I exposed to the user, because the alternative — auto-detecting silently — produces wrong charts later. By front-loading this, every report built on this data source inherits clean columns. The user never sees the raw column name again.

### 2.5 · Visual craft choices that matter

- **Brand-first typography hierarchy.** Nothing in the app is bigger than the brand wordmark (16px serif). Page titles, dialog titles, and the brand are all the same size. This was a deliberate counter-move to the BI-tool convention of giant page headlines that fight for attention with the data. The data should be the loud thing.
- **Warm neutral palette + single accent (orange).** Most BI tools default to cool blue/gray — clinical, "enterprise". I wanted InsightFlow to feel like a tool a human chose to use, not one IT installed. The accent shows up only on actions, focused inputs, and chart highlights.
- **Live skeletons during navigation.** TanStack Router's view transitions + a grayscale filter during `isLoading` makes route changes feel intentional rather than stalled.
- **A Style Guide route built into the app.** `/styleguide` renders every token live — colors, radii, shadows, typography. This is not user-facing; it's a forcing function for consistency. If a value isn't in the style guide, it shouldn't appear in the product.

### 2.6 · What I deliberately *didn't* build

- **Dashboards (multi-chart reports).** Out of scope for one week. A report holds one chart. This kept the demo focused on the builder.
- **AI prompt-to-chart.** Tempting but lower priority than getting the manual flow right. A bad chart from a great prompt is still a bad chart.
- **Authentication, collaboration, sharing.** Single-user, local-first, in-browser.
- **SQL/code editor.** Explicit non-goal per the brief.
- **CSV files larger than ~50 MB.** The UI handles them; the parser doesn't stream. Realistic for the target user.

---

## 3 · State management & data — short version

(Full architecture detail is in `ARCHITECTURE.md`.)

- **Zustand** for all client state, sliced by domain: `data-sources`, `reports`, `theme`, `ui`, `toast`.
- **IndexedDB via `idb-keyval`** for the large persistent stores (data sources hold parsed CSV rows). `localStorage` for the small ones (theme, UI prefs).
- **TanStack Router** with file-based routes, `defaultViewTransition: true`, `defaultPreload: 'intent'`.
- **No backend.** Everything runs in the browser. Cost to operate: $0. Scaling story is honest about this — see Architecture §4.

---

## 4 · AI tools — what I used and where I overrode the output

**Claude Code (Opus 4.7) — primary build partner.** Used for ~80% of code generation, all architecture iteration, and all of this writing. What pushed it past being a smarter autocomplete was its ecosystem of skills — specifically the **brainstorming** skill (which forces a real design conversation before any code is written) and the **writing-plans / executing-plans** pair, which turns every feature into a spec, then a checklist of bite-sized tasks, then execution. That workflow meant each piece of the app arrived as a documented decision and a reviewable diff, not a stream of patches I had to reverse-engineer. The honest tradeoff is cost: this style of work consumes tokens fast. For a one-week prototype that's the right scale; a multi-month project would force a stricter discipline about when to spin up the full skill workflow versus a single targeted prompt.

**Figma + MCP for mockups.** Eight HTML mockups in `/docs/mockups/` were the source of truth for visual decisions before any code was written. Iterating in HTML rather than Figma was faster for me because the same artifact could be the spec *and* the visual reference.

**Cursor for inline edits.** Used for one-line refactors and rename-across-file where Claude Code would have been overkill.

---

## 5 · What I'd build next with another week

Three things, sized to fit a five-day week — not a wishlist. In priority order:

1. **Multi-widget reports.** Drag-and-drop chart layout on the report detail page. The data model already supports `reports[id].widgets[]`, so this is mostly UI: a grid library (`react-grid-layout`), persisted layout, per-widget edit dialog (already exists).
2. **Computed columns.** A formula bar on data sources (`Revenue = Quantity * Price`). Closes the gap where a business user otherwise has to re-export their CSV from a spreadsheet just to derive one new field. Done as a spreadsheet-style expression mini-language — the syntax should match what the user already knows from Excel or Google Sheets, not Python or SQL.
3. **Export.** PNG / PDF for the chart, CSV for the underlying filtered rows.

What I would *not* build, even with a second week: AI prompt-to-chart, multi-user collaboration, in-app SQL. Each is a different product.

---

## 6 · How to evaluate this

Walk the full flow end-to-end — every screen is meant to be tried. A sample `Sample - Superstore.csv` is included in `/docs/` if you need a quick file.

1. **Home (`/`).** Branded landing, full-screen, no sidebar. This is the only route without the shell — a deliberate choice so the app feels like it *starts* somewhere, not like a tool you're dropped into.
2. **Data Sources (`/datasources`) → Add Data Source.** Upload the Superstore CSV. The dialog shows the column-config table — rename a column, ignore one you don't care about, override a detected type if it's wrong. This is the one technical moment exposed to the user; everything downstream inherits these decisions.
3. **Reports (`/reports`) → Add Report.** Pick the data source you just uploaded, name the report, give it a short description. The report is created empty.
4. **Report detail (`/reports/:id`) → Add chart.** This is the **main evaluation surface**. Walk the four steps of the Chart Builder dialog: pick a chart type (Line / Bar / Pie), configure what to show, optionally add a date or category filter, optionally style. Watch how much the system decides for you versus how much you decide — disabled options, smart column picker, live preview at every step, no "Apply" button.
5. **Edit the same chart.** Click the chart's edit affordance and re-open the builder. Same dialog, same controls — no separate edit mode. Change the date range or chart type, save. The point is that *building* and *editing* are the same flow.
6. **Try filters seriously.** Add a date-range filter on a date column (real calendar with year dropdown), a multi-select on a category column (searchable combobox), a numeric range on a number column. These are where most BI tools quietly hand the user a worse experience.
7. **Theme toggle + collapsible sidebar.** Top-right theme toggle (light/dark only — no `'system'`, by design). Sidebar collapses to a 60px icon rail and remembers state across reloads.
8. **`/styleguide`.** Every token, scale, and rule rendered live — colors, radii, shadows, typography, the components themselves. It exists as a forcing function: if a value isn't in here, it shouldn't appear in the product.

For the structural reading, see `ARCHITECTURE.md` — component layout, the Zustand-store split, the IndexedDB adapter, and the two Mermaid diagrams (system overview + chart-builder sequence).
