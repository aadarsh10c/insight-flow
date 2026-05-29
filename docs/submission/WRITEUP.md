# InsightFlow — Write-Up

**Build a BI Dashboarding Tool · Take-home · Adarsh Kumar**

> A guided BI chart builder for business users with no technical background. Live URL: *(deployment pending — see §5)*. Repo: this folder. Stack: React 19 + TypeScript + Vite + TanStack Router + Zustand + Plotly.

---

## 1 · The analysis — what I studied, what stood out

I limited my study to **Looker Studio** (Google), **Power BI** (Microsoft), and **Metabase** because those three are the ones business users are actually handed at work. I spent a few hours each rebuilding the same chart in each tool — "sales by category over time" against a CSV — and watching where I, with full technical background, still hit friction.

**Three observations changed the design:**

**a) The blank canvas is the problem.** Looker Studio opens to an empty page and a sidebar of tools — dimensions, metrics, blend, calculated fields. The first decision the user is asked to make is a vocabulary decision. Power BI is the same. Metabase is gentler (their "Ask a Question" flow), but it still asks the user to choose between three modes on the first screen. A business user who came to answer a business question is now answering a UI question.

**b) Data type is presented as the user's problem.** Every tool surfaces column types — `STRING`, `NUMBER`, `DATETIME`, `MEASURE`, `DIMENSION`. The user has to know that to chart something "over time" they need to drag the date *dimension* to the x-axis and a numeric *measure* to the y-axis. The chart suggestions are reactive (they show what's possible after the user picks columns), not generative (they don't tell the user what to do).

**c) "Editing later" is treated as a separate flow.** Once a chart is created, most tools have a distinct "edit mode" — different UI, different affordances. The mental model of *building* and *editing* is split. For a business user who comes back tomorrow and wants to tweak the date range, this is unnecessary friction.

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

**Claude Code (Opus 4.7) — primary build partner.** Used for ~80% of code generation, all architecture iteration, and all of this writing. Worked best when I gave it a specific UX problem ("the calendar is touching the top of the screen and the year dropdown looks unstyled") and let it propose two or three options. Worked worst when I let it scope by itself — it tends to over-engineer (the first Plotly lazy-loading attempt was three layers of abstraction for something that needed a one-line unwrap). I learned to push back on premature abstraction explicitly: "the simple version, not the clever one."

**Figma + MCP for mockups.** Eight HTML mockups in `/docs/mockups/` were the source of truth for visual decisions before any code was written. Iterating in HTML rather than Figma was faster for me because the same artifact could be the spec *and* the visual reference.

**Cursor for inline edits.** Used for one-line refactors and rename-across-file where Claude Code would have been overkill.

**Specific judgment calls I overrode:**

- Claude proposed a `'system'` theme mode following OS preference. I removed it — adds a setting, doesn't change anything users actually do, and made the persistence migration harder.
- Claude suggested lazy-loading Plotly. I tried it, found the bundle savings weren't worth the rendering flash, and reverted. The chunk is large; the user is already in a chart-building context. Loading eagerly is the right tradeoff here.
- Claude wrote a localStorage→IndexedDB migration shim. I deleted it — for a one-week prototype the existing user has no production data, so the shim was carrying weight it didn't need to.

**What I didn't use:**

- **v0 / Lovable** for UI generation. Both push toward a generic AI aesthetic — the rounded-corner card with a blurry gradient. I wanted a brand that looked chosen, not generated.
- **GitHub Copilot.** I find it noisier than helpful in TypeScript projects with strict mode on; the ghost completions interrupt the type-checker feedback loop.

---

## 5 · What I'd build next with another week

In priority order:

1. **Deploy + share URL.** The brief requires a live URL — this is task #1 of week 2. Currently runs locally only.
2. **Multi-widget reports.** Drag-and-drop chart layout on the report detail page. The data model already supports `reports[id].widgets[]`, so this is mostly UI: a grid library (`react-grid-layout`), persisted layout, per-widget edit dialog (already exists). One full day.
3. **Computed columns.** A formula bar on data sources (`Revenue = Quantity * Price`). The single most-requested capability from the business users I spoke to during research. Done as a spreadsheet-style expression mini-language, not Python/SQL.
4. **Cross-chart filtering.** Click a bar → all sibling widgets filter. This is the moment a "report" becomes a "dashboard" in the user's mind.
5. **Saved filter presets per report.** "Last quarter", "this fiscal year", named.
6. **Live data sources.** Polling a Google Sheets URL or a CSV URL. No DB connectors — that's an analyst feature, not a business-user one.
7. **Export.** PNG / PDF for the chart, CSV for the underlying filtered rows.

What I would *not* build, even with a second week: AI prompt-to-chart, multi-user collaboration, in-app SQL. Each is a different product.

---

## 6 · How to evaluate this

The thing I want evaluated most is the **Chart Builder dialog** — open any report, click "Add chart" or edit an existing one, and watch how much the system decides for you versus how much you decide. That dialog is where the design POV lives. Everything else is plumbing in service of it.

Secondary: open `/styleguide` to see the visual system, and read `ARCHITECTURE.md` for the structural choices.
