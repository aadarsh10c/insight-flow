# InsightFlow — Code Style Guide

Authoritative rules for how every TypeScript/React file in this codebase is written. Mirrors the conventions in the author's primary work codebase; adapted for this single-app project. Every contributor — human or agent — must follow this guide.

> **Companion docs:**
> - `StyleGuide.md` — visual design system (tokens, scales, components)
> - `InsightFlow_Whitepaper_v3.md` — product spec
> - `superpowers/specs/2026-05-28-insightflow-design.md` — implementation spec

---

## 1. Philosophy

1. **Ship clean, maintainable code.** Every choice optimizes for the reader six months from now, not for keystrokes today.
2. **Functional first.** Pure functions, composition, immutable data, data-last helpers. Reach for `map` / `filter` / `reduce` / `flatMap` before imperative loops.
3. **Minimize `useEffect`.** Every effect is a code smell that must be justified. Acceptable: external-system sync, subscription setup/teardown, browser-API integration. Anti-patterns: deriving state, syncing two `useState`s, kicking off fetches, updating parent on child events.
4. **Decisive state management.** One source of truth per piece of state. Server → (n/a in V1). Persistent → Zustand store. URL → route search params. Derived → compute inline. Local UI → `useState` only when truly local.
5. **Advanced TypeScript.** Discriminated unions over boolean flags + optional fields; `as const`; branded types where they pay off; tight signatures at boundaries, never widen with `Omit<T, K>` if it forces casts.
6. **Abstract where it pays.** Reach for shared primitives (`createStorage`, `ConfirmDialog`, `useStableHandlers`) when the second user appears — not preemptively.

---

## 2. Module file pattern (NON-NEGOTIABLE)

Every module folder uses this flat layout:

| File | Purpose |
|---|---|
| `index.ts` | Barrel export. Exports the public surface only. |
| `<module>.tsx` | **Pure JSX only.** Zero inline logic. |
| `<module>.hook.ts` | **ALL** state, derived values, handlers, memos, callbacks. |
| `<module>.type.ts` | All prop interfaces, hook param/return types, derived record shapes. |
| `<module>.utils.ts` | Pure helper functions (formatters, transformers). *Optional* — only when helpers exist. |
| `<child-component>/` | Sibling folders. **No `sub-components/` wrapper folder.** |

**Example:**

```
data-source-table/
├── index.ts
├── data-source-table.tsx
├── data-source-table.hook.ts
├── data-source-table.type.ts
├── data-source-table.utils.ts
└── data-source-row/                 # child at module root (NOT sub-components/data-source-row/)
    ├── index.ts
    ├── data-source-row.tsx
    ├── data-source-row.hook.ts
    └── data-source-row.type.ts
```

When asked to create a module, scaffold all 4-5 files in one pass — not a `.tsx` with inline logic to be "refactored later."

---

## 3. Components are pure presentation

Zero inline logic in `.tsx` files. Concretely:

❌ **Do not write in a `.tsx`:**
- `useState` / `useMemo` / `useCallback`
- Inline ternaries that compute display text (`search.trim() ? "X" : "Y"`)
- Inline arrow functions in event handlers (`onClick={() => doThing(id)}`)
- Per-item lookups in `.map()` (`items.map(i => scores.get(i.id) ?? 0)`)
- Event-to-value adapters (`onChange={(e) => setValue(e.target.value)}`)

✅ **Do write in a `.tsx`:**
- Destructure props from the hook return
- Render JSX
- Pass bound handlers from the hook to event props

**Example — bad:**

```tsx
export const SearchBox = ({ items }) => {
  const [search, setSearch] = useState('')
  const filtered = useMemo(
    () => items.filter(i => i.name.includes(search)),
    [items, search]
  )
  return (
    <input value={search} onChange={(e) => setSearch(e.target.value)} />
    {filtered.length === 0 ? <p>No results</p> : <ul>{filtered.map(i => <li>{i.name}</li>)}</ul>}
  )
}
```

**Example — good:**

```tsx
// search-box.hook.ts
export const useSearchBox = ({ items }: UseSearchBoxParams): SearchBoxView => {
  const [search, setSearch] = useState('')
  const filteredItems = useMemo(
    () => items.filter(i => i.name.includes(search)),
    [items, search]
  )
  const handleSearchChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    []
  )
  const isEmpty = filteredItems.length === 0
  const emptyStateMessage = 'No results'
  return { search, filteredItems, isEmpty, emptyStateMessage, handleSearchChange }
}

// search-box.tsx
export const SearchBox = (props: SearchBoxProps) => {
  const { search, filteredItems, isEmpty, emptyStateMessage, handleSearchChange } = useSearchBox(props)
  return (
    <>
      <input value={search} onChange={handleSearchChange} />
      {isEmpty ? <p>{emptyStateMessage}</p> : <ul>{filteredItems.map(item => <li key={item.id}>{item.name}</li>)}</ul>}
    </>
  )
}
```

---

## 4. Hooks orchestrate everything

The hook signature takes raw inputs and returns a **ready-to-render bundle**:

- Raw state (`search`)
- Event adapters with full types (`handleSearchChange: (e: ChangeEvent<HTMLInputElement>) => void`)
- Derived data (`filteredItems`, `isEmpty`, `emptyStateMessage`)
- Bound handlers (`handleCreateReport`, `handleOpenFilters`) — wrapped in `useCallback` even if stubs
- Pre-enriched arrays for `.map()` — never compute per-item in the component

The component never reaches past its hook return. If the hook didn't expose it, it doesn't exist on this render.

---

## 5. Types live in `.type.ts`

No inline `interface Props {}` in `.tsx` files. The `.type.ts` exports:

- `<Module>Props` — the component's prop interface
- `Use<Module>Params` — the hook's param interface
- `<Module>View` — what the hook returns
- `Enriched<X>` — any per-item shape used by `.map()`
- Sub-component prop interfaces

---

## 6. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `data-source-table.tsx` |
| Folders | `kebab-case` | `add-report-dialog/` |
| Components | `PascalCase` | `DataSourceTable` |
| Types / interfaces | `PascalCase` | `DataSourceTableProps` |
| Hooks | `use*` | `useDataSourceTable` |
| Event handlers (returned by hook) | `handle*` | `handleSearchChange` |
| Event prop names (on components) | `on*` | `onSearchChange` |
| Booleans | `is*` / `has*` / `should*` / `can*` / `will*` | `isEmpty`, `hasData`, `shouldShowToast` |
| Constants | `SCREAMING_SNAKE_CASE` | `MAX_FILE_SIZE_BYTES` |
| Store files | `<domain>.store.ts` | `data-sources.store.ts` |

---

## 7. State management — pick before writing

Before writing any hook, answer: **where does this state live?**

| Scope | Choice |
|---|---|
| App-wide, persistent | Zustand store (`stores/*.store.ts`) |
| Cross-route, transient | Zustand store, in-memory (e.g., `toast.store.ts`) |
| URL-shareable | Route search params via TanStack Router |
| Local to one component instance | `useState` / `useReducer` in the hook |
| Complex state machine local to one component | `useReducer` (preferred over `useState` for >2 transitions) |

Never duplicate state across multiple `useState`s that have to stay in sync — lift to one source.

---

## 8. `useEffect` is a code smell

Default: **find another way.**

| Anti-pattern | Replacement |
|---|---|
| Derive state on input change | Compute inline (`useMemo` only when measurably expensive) |
| Sync two `useState`s | Lift to one source |
| Kick off a fetch on mount | Loader / TanStack Query / store action |
| Update parent on child event | Lift the handler; pass down via props |
| Subscribe to a store | Use the store's `useStore(selector)` hook directly |
| Run setTimeout / setInterval | Wrap in a custom hook or a store action with cleanup |

**Acceptable uses:**
- DOM sync at app boot (theme class on `<html>` — when not solved by inline script)
- External subscription setup/teardown (matchMedia listener if not in store)
- Browser API integration (focus, scroll restoration)

Every `useEffect` in the codebase must have a comment explaining why it's necessary if it's not obvious.

---

## 9. FP patterns to prefer

- **`map` / `filter` / `reduce` / `flatMap`** over imperative `for` loops
- **`Array.from(map.values())`** over `[...iterator]` when readability matters
- **Object spread / `structuredClone`** for immutable updates — never mutate
- **Discriminated unions** for state shapes:

  ```ts
  type FetchState<T> =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: T }
    | { status: 'error'; error: Error }
  ```

- **`as const` assertions** for literal narrowing
- **Branded types** for IDs when they'd otherwise be `string`:

  ```ts
  type DataSourceId = string & { __brand: 'DataSourceId' }
  ```

- **Pipe / compose helpers** (`pipe(value, fn1, fn2)`) if a chain becomes hard to read
- **Lift logic out of components** into `.utils.ts` — pure, testable, reusable

---

## 10. TypeScript discipline

- `strict: true` always
- No `any`. `unknown` is acceptable at boundaries; narrow immediately.
- No `// @ts-ignore`. Use `// @ts-expect-error` with a TODO if absolutely necessary.
- Prefer type narrowing via discriminated unions over `if (x !== undefined)` chains
- Type at the boundary, not in the middle. Don't widen function signatures to accept "anything callers might want."
- Generics with constraints (`<T extends DataSource>`) — never bare `<T>` that swallows type info

---

## 11. File-level patterns

**Barrel exports (`index.ts`):**

```ts
// index.ts of a module
export { DataSourceTable } from './data-source-table'
export type { DataSourceTableProps } from './data-source-table.type'
```

Don't re-export everything by default — be deliberate about the public surface.

**Imports:**

```ts
// 1. Node / std
// 2. Third-party
// 3. Absolute project imports (@/...)
// 4. Relative imports (./...)
// 5. Type-only imports (import type { ... })
```

**Path aliases:** `@/` → `src/`. No deep relative imports (`../../..`).

---

## 12. Testing

- `lib/` — Vitest, target ~80% coverage. Pure functions, easy wins.
- `stores/` — Vitest, target ~70%. Test actions transform state correctly.
- Hooks — RTL + Vitest, key flows only.
- Components — RTL, smoke + critical interactions only (not snapshot tests).
- E2E — Playwright, one happy path.

No snapshot tests. No visual regression (the `/styleguide` route covers that manually). Don't aim for 100% coverage — aim for high signal.

---

## 13. The hard rules (TL;DR)

If you remember nothing else:

1. **Module pattern.** Every folder: `index.ts`, `.tsx`, `.hook.ts`, `.type.ts`, `.utils.ts` (when needed). Children at module root, no `sub-components/`.
2. **Pure presentation.** Zero logic in `.tsx`. No inline `useState`, ternaries computing text, or arrow `onClick`s.
3. **Hook returns ready-to-render data.** Pre-enriched arrays, bound handlers, derived booleans.
4. **Types in `.type.ts`.** Never inline `interface Props {}` in `.tsx`.
5. **`useEffect` is a smell.** Justify every one.
6. **One source of truth per state.** Store / URL / route loader / local — pick before writing.
7. **No `any`.** Discriminated unions, `as const`, branded types.

Violations of these rules block PR merge.
