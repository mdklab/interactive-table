# Interactive Table

An interactive table experience for data exploration, lightweight archival, and rich inspection of user-supplied CSV data.

## Overview

- Users upload tabular data, review it in a high-performing grid, and keep their last dataset in the browser for fast reopen.
- The experience should stay responsive on large datasets by virtualizing rendering and delegating expensive work to hooks/services.
- We ship through GitHub Pages so the experience can be previewed without additional infrastructure.

## Technology stack

- **React 18 + TypeScript** – component architecture with hooks, contexts, and strongly typed contracts for the core table, data loaders, and controls.
- **Vite 5** – zero-config dev server, fast build, and native support for GitHub Pages-friendly static exports.
- **Persisted data service** – a hook-based service manages parsing, validation, derived metadata, and mirrors the latest dataset + filters into `localStorage`.
- **CSS + layout strategy** – scoped CSS modules (or plain `.css` files for now) with CSS variables to control spacing, typography, and theming helpers.
- **Testing via Vitest + Testing Library** – unit tests for hooks/services and lightweight integration tests for rendering + interaction flows.

## Architectural overview

1. **Entry & shell** (`src/main.tsx` → `App`) wires React into the DOM, bootstraps providers (data, UI preferences), and owns the high-level layout (toolbar + table + detail drawer).
2. **Toolbar + controls** handle file uploads, column visibility toggles, sort/filter selectors, and export actions. Controls emit intent that the data service sanitizes.
3. **Data service & hooks** expose APIs such as `useCSVData`, `useSortedData`, and `useColumnVisibility`. The service parses CSV asynchronously, detects schema mismatches, and caches derived summaries (counts, ranges).
4. **Table viewport** renders headers and rows with virtualization (windowing or `IntersectionObserver` guards) so we only paint visible rows. It also surfaces a detail drawer or sidebar for the selected row.
5. **Persistence layer** mirrors the latest dataset, filters, and column toggles into `localStorage` so returning visitors resume where they left off. The service also exposes `reset` commands for QA.
6. **Feature layering** keeps heavy lifting (sorting, filtering, virtualization) inside composable hooks, so we can unit test each concern and keep the UI lean.

## Issue roadmap & acceptance criteria

| Issue | Focus | Acceptance criteria |
| --- | --- | --- |
| **#1 (this issue)** | Stack, architecture, and plan | README and docs capture the chosen stack, architecture overview, issue roadmap with readiness criteria, and a GitHub Pages deployment plan (this document and `docs/plan.md` cover the work). |
| **#2: CSV ingestion & persistence** | Upload, parse, and store datasets | Users can upload CSV/TSV, the service validates headers, stores parsed rows in memory, echoes metadata (row count, column types), and mirrors the dataset + UI state to `localStorage`. Unit tests cover parsing logic. |
| **#3: Interactivity & virtualization** | Sorting, filtering, virtualization, and column controls | Table can sort/filter on at least two column types, virtualization keeps frame rate smooth on 1,000+ rows, and column toggles + export buttons update the service consistently. Integration tests exercise the main toolbar + viewport interactions. |
| **#4: Release & QA automation** | CI/CD, GitHub Pages, and polish | `npm run build` runs in CI, GitHub Actions deploy `dist/` to `gh-pages`, README explains how to visit the live site, and we have at least one smoke test verifying the public build.

For more detail on how these issues break down into tasks, dependencies, and readiness checks, see [`docs/plan.md`](./docs/plan.md).

## Deployment plan (GitHub Pages)

1. The production build lives in `dist/`, created by `npm run build` (Vite handles modern bundling).
2. We deploy via `gh-pages`, either by configuring the `gh-pages` branch manually or by using `peaceiris/actions-gh-pages` in a GitHub Actions workflow.
3. The workflow triggers on pushes to `main` (and on demand for previews), runs `npm ci` → `npm run build`, and publishes `dist/` to `gh-pages` with a deterministic commit.
4. Site visitors access `https://mdklab.github.io/interactive-table` (the URL updates automatically when GitHub Pages deployment succeeds).
5. We continue to run `npm run dev` or `npm run preview` locally for manual testing before each deployment.

## Testing & quality

- `npm run test` exercises Vitest suites, including hook logic and any render snapshots we add.
- PRs should keep scope small, add targeted tests for new interactions, and uphold accessibility best practices (keyboard focus, labels, announcements).
- We rely on the layered architecture to keep logic testable—business rules live in hooks/services rather than in sprawling components.

## Detailed plan

See [`docs/plan.md`](./docs/plan.md) for the architecture timeline, readiness criteria for follow-on issues, deployment steps, and definition-of-done checklists.
