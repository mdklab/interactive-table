# Implementation plan

This document expands on Issue #1 by clarifying how we move from stack decisions to an interactive, deployable experience. It highlights the work breakdown, acceptance criteria, and deployment details.

## Completed work (Issue #1: Stack + plan)

- Chose React 18 + TypeScript + Vite, explained the persistence strategy, and committed the core architectural ideas to `README.md`.
- Captured the issue roadmap plus readiness criteria in `README.md`'s table.
- Documented the GitHub Pages deployment playbook so future issues know how release works.

## Issue breakdown

| Issue | Outcome focus | Acceptance criteria |
| --- | --- | --- |
| **#1: Stack & plan (current)** | Foundation | This document, `README.md`, and the deployment notes capture the stack, architecture, issue roadmap, and GhPages plan. |
| **#2: CSV ingestion & persistence** | File uploads & storage | Upload flow accepts CSV/TSV, validates headers, parses rows asynchronously, buffers a summary (row count, column types), and mirrors data + UI state into `localStorage`. Hook-level tests prove parsing + persistence. |
| **#3: Interactivity & virtualization** | Sorting, filtering, controls | The toolbar exposes sort/filter toggles, column visibility, and export actions; the table uses virtualization to stay responsive on 1,000+ rows; integration tests cover the toolbar + viewport interactions. |
| **#4: Release automation & QA** | CI/CD, GH Pages, polish | GitHub Actions runs `npm ci && npm run build`, publishes the `dist/` folder to `gh-pages`, and the README links to the live URL. Smoke tests confirm the deployed build renders the main view. |

Additional issues will be created once the above acceptance criteria are met and will cover: accessibility improvements, analytics/telemetry, design system polish, or data export enhancements. Each new issue will include a definition of done and QA checklist before merging.

## GitHub Pages deployment plan

1. **Build configuration** – `npm run build` (Vite) emits static `dist/` assets. Keep `homepage` or router configuration minimal so we ship a static SPA.
2. **Workflow** – Add a GitHub Actions workflow (e.g., `.github/workflows/deploy.yml`) that triggers on pushes to `main` and optionally on pulls. Steps:
   - `npm ci`
   - `npm run build`
   - `peaceiris/actions-gh-pages@v4` (or equivalent) deploys `dist/` to the `gh-pages` branch using a token tied to the repo.
3. **Branch strategy** – The `gh-pages` branch becomes the deployment target. The workflow pushes built assets there; the live site is then `https://mdklab.github.io/interactive-table`.
4. **Verification** – After deployment we run a smoke test (locally or via GitHub Actions) that fetches the published URL and ensures the table shell renders.
5. **Rollback & monitoring** – Issues mention `gh-pages` history, so we can roll back by re-deploying a previous commit if the new build misbehaves.

## Quality & readiness

- We rely on hook/service testing (Vitest + Testing Library) to verify parsers, filters, and virtualization helpers, keeping UI tests lightweight.
- Each issue will include a `Definition of Done` section in its description with clear acceptance criteria and verification steps.
- Documentation (README + docs/) will stay synced with the code—if deployment changes, the README updates too.

## Next steps

1. Implement Issue #2 (data ingestion) with a failing test first, then wiring the toolbar.
2. Layer Issue #3 (interactions & virtualization), keeping logic in pure hooks for testability.
3. Set up GitHub Actions and GH Pages deployment for Issue #4 before the first release.
4. Add instrumentation (e.g., analytics placeholders) once the core table is stable.
