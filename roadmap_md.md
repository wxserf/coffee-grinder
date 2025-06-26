# Coffee Grinder — Micro-Task Roadmap

## Why this file exists

This roadmap lists every concrete step we need to take to turn Coffee Grinder into a production-ready Make.com tool. Each item is small (a micro-task) and has:

- A clear description of what to do
- The file or behaviour we expect when it is finished
- Any tasks that must be done first

The checklist is grouped by project phase so you can work from the ground up: clean up the repo, add core features, improve performance, and finally harden the app for deployment.

## Key for reading the tables

| Field | Meaning | Example |
|-------|---------|---------|
| ID | P.S.T.m → Phase, Section, Task, micro-step | 2.1.3.b = Phase 2, Section 1, Task 3, Step b |
| Priority | Critical › High › Medium › Low | Critical steps block the release |
| Output | What should exist or work when the step is finished | "logger.js added and unit-tested" |
| Dependency | Micro-tasks that must be finished first | depends: 1.1.1.a |
| Status | ⬜ Todo · ⚙ In Progress · ✅ Done | Use these boxes to track progress |

---

## Phase 1 — Foundation Cleanup (Weeks 1-3)

### 1.1 Folder Layout and Basic Hygiene (High Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 1.1.1.a | Make new folders: `src/components/`, `src/services/`, `src/workers/`, `src/validators/`, `src/utils/`, `src/templates/`, and `tests/`. | Folders exist; npm test still runs. | — | ⬜ |
| 1.1.1.b | Move all DOM code to `src/components/ui/` (split into `buttons.js`, `tables.js`, `modals.js`). Update imports. | ESLint passes. | 1.1.1.a | ⬜ |
| 1.1.1.c | Rename the worker to `src/workers/specWorker.js` and export `processBlueprint()` for tests. | Build and Jest are green. | 1.1.1.a | ⬜ |
| 1.1.1.d | Add Rollup path aliases (`@components`, `@services`, …) in `rollup.config.js`. | Builds work with new paths. | 1.1.1.b-c | ⬜ |
| 1.1.1.e | Draw a simple SVG diagram of the new folder tree and save it as `docs/arch.svg`; link it in the README. | Diagram visible in docs. | 1.1.1.a | ⬜ |
| 1.1.2.a | Delete leftover temp files (`*.tmp`), duplicate images, and the old `ecg69.html`. | `git status` shows no stray files. | — | ⬜ |
| 1.1.2.b | Add `dist/`, `coverage/`, `logs/`, and `.DS_Store` to `.gitignore`. | Git no longer tracks these. | — | ⬜ |
| 1.1.2.c | Run `source-map-explorer` and save the bundle report to `docs/bundle_YYYY-MM-DD.html`. | Report committed. | — | ⬜ |
| 1.1.3.a | Run `madge --circular src/` and save results to `docs/circularDeps.txt`. | File created. | 1.1.1.* | ⬜ |
| 1.1.3.b | Add `.dependency-cruiser.js` with rules that forbid backwards imports (e.g., utils must not depend on components). | CI breaks on violation. | 1.1.1.* | ⬜ |
| 1.1.3.c | Use `depcheck` to remove unused packages and update `package.json` and the lockfile. | `npm i` prints no warnings. | 1.1.2.a | ⬜ |
| 1.1.3.d | Add a VS Code workspace (`.vscode/extensions.json`) with ESLint and Prettier recommended. | Extensions file committed. | — | ⬜ |

### 1.2 Remove Duplicate Code (High Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 1.2.1.a | Run `jsinspect -t 20 -m 2 src/` and save the duplicate report to `docs/duplicates.md`. | Report added. | 1.1.* | ⬜ |
| 1.2.1.b | Create `src/utils/jsonProcessor.js` with `safeParse` and `safeStringify`; replace duplicate parsing code. | All parsing now uses the helper. | 1.2.1.a | ⬜ |
| 1.2.1.c | Write unit tests for `jsonProcessor.js` in `tests/utils/`. | Tests pass. | 1.2.1.b | ⬜ |
| 1.2.2.a | Add `src/validators/baseValidator.js` that wraps Ajv with default options. | Validator file created and exported. | 1.1.* | ⬜ |
| 1.2.2.b | Replace ad-hoc `alert()` calls with a common UI error handler in `src/utils/errorHandler.js`. | No raw `alert()` left. | 1.2.2.a | ⬜ |
| 1.2.3.a | Add ESLint, Prettier, `eslint-plugin-sonarjs`, and a Husky pre-commit hook. | `npm run lint` passes in CI. | — | ⬜ |
| 1.2.3.b | Run `npm run lint:fix` to auto-format the repo with Prettier. | Style is consistent. | 1.2.3.a | ⬜ |

### 1.3 Better Build Process (Medium Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 1.3.1.a | Upgrade Rollup and set `treeshake.moduleSideEffects=false` in the config. | Bundle size drops by ~5%. | 1.1.* | ⬜ |
| 1.3.1.b | Split the vendor libraries (ajv, html2pdf) and the worker into separate chunks. | `dist/vendor.js` and `dist/worker.bundle.js` created. | 1.3.1.a | ⬜ |
| 1.3.1.c | Add `rollup-plugin-analyzer`; save its HTML output to `docs/bundleReport.html`. | Report exists. | 1.3.1.a | ⬜ |
| 1.3.2.a | Load heavy libraries from a CDN in production; keep local copies in development. | `index.html` switches based on `NODE_ENV`. | 1.3.1.* | ⬜ |
| 1.3.2.b | Add a `vite-preview` script for a lightweight dev server. | `npm run preview` serves the app. | 1.3.1.* | ⬜ |
| 1.3.3.a | Make separate Rollup configs for dev and prod; turn off source maps in prod. | Two config files documented. | 1.3.1.a | ⬜ |
| 1.3.3.b | Enable Terser minification in prod; make sure it does not break the worker. | Build works; smoke test passes. | 1.3.3.a | ⬜ |
| 1.3.4.a | Write a release script that bumps the version, builds, and creates a GitHub release with the bundle. | `scripts/release.js` works. | 1.3.3.* | ⬜ |

---

## Phase 2 — Core Features (Weeks 4-7)

### 2.1 Make.com Compatibility (Critical Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 2.1.1.a | Write a full JSON Schema for Make blueprints covering scenarios, modules, connections, routes, variables, and metadata. | `src/schemas/makeBlueprintSchema.js`. | — | ⬜ |
| 2.1.1.b | Validate three sample blueprints (small, medium, large) with the new schema. Summarize results in `docs/schemaCoverage.md`. | Coverage table created. | 2.1.1.a | ⬜ |
| 2.1.1.c | Add a CI job `npm run validate:samples` to enforce the schema check. | CI job runs on push. | 2.1.1.b | ⬜ |
| 2.1.2.a | Write `src/services/blueprintExporter.js` that builds a Make blueprint JSON from our internal data structures. | Exporter returns valid JSON. | 1.2.1.b | ⬜ |
| 2.1.2.b | Make sure x/y coordinates are preserved; if missing, place modules on a fallback grid. | Imported blueprint keeps its layout. | 2.1.2.a | ⬜ |
| 2.1.3.a | Write `src/services/blueprintImporter.js` to read a Make JSON file and build our internal tree. | Importer passes unit tests. | 1.1.* | ⬜ |
| 2.1.3.b | Add an option to remap connection IDs when importing from another account. | Unit tests cover remap. | 2.1.3.a | ⬜ |
| 2.1.3.c | Write `docs/importer_howto.md` showing CLI and UI examples. | Guide added. | 2.1.3.a | ⬜ |

### 2.2 Security Basics (Critical Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 2.2.1.a | Add a Content Security Policy tag allowing only self resources and `worker-src blob:`. | DevTools shows no CSP errors. | 1.3.* | ⬜ |
| 2.2.1.b | Add a random nonce to every inline script on page load. | CSP passes with nonce. | 2.2.1.a | ⬜ |
| 2.2.2.a | Harden Ajv: limit object depth, error count, and string lengths. | Fuzz tests run clean. | 2.1.1.* | ⬜ |
| 2.2.2.b | Add an Express rate-limiting middleware for future API routes. | Middleware file created. | — | ⬜ |
| 2.2.3.a | Use DOMPurify to sanitize all HTML coming from the worker before inserting it. | XSS test passes. | 1.2.2.b | ⬜ |
| 2.2.3.b | Run `npm audit`, `audit-ci`, and `retire.js`; fix all critical findings. | Security report saved. | 2.2.* | ⬜ |

### 2.3 Logging and Monitoring (High Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 2.3.1.a | Set up Sentry using an environment variable for the DSN; upload source maps after each build. | Sentry shows errors with stack traces. | 1.3.4.a | ⬜ |
| 2.3.1.b | Add breadcrumbs for: blueprint loaded, validation failure, and export click. | Breadcrumbs appear in Sentry. | 2.3.1.a | ⬜ |
| 2.3.2.a | Create `src/utils/logger.js` that logs in JSON format with levels debug/info/warn/error. | Logger unit-tested. | 1.2.2.b | ⬜ |
| 2.3.2.b | Replace all direct `console.*` calls with the new logger. | `grep` finds none. | 2.3.2.a | ⬜ |
| 2.3.3.a | If we wrap the app in Electron or serve via Node, add a `/health` endpoint that returns basic status JSON. | `curl` shows 200 OK. | 2.3.2.a | ⬜ |
| 2.3.3.b | Implement a heartbeat: the worker posts a message every 5s. Show a green dot when healthy, red when missed. | Heartbeat indicator works. | 1.1.1.c | ⬜ |

---

## Phase 3 — Performance and New Features (Weeks 8-11)

### 3.1 Speed Improvements (High Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 3.1.1.a | Change the worker to send blueprint data as a Transferable ArrayBuffer. | Parse time drops by ~30%. | 1.1.1.c | ⬜ |
| 3.1.1.b | Add `workerManager.js` that spins up a pool with one worker per CPU core minus one. | CPU stays ~80% without freezing UI. | 3.1.1.a | ⬜ |
| 3.1.1.c | Send progress events (start, percentage, done) from the worker; draw a progress bar. | Progress bar matches workload. | 3.1.1.a | ⬜ |
| 3.1.2.a | Add a service worker to cache core assets so the app works offline. | Lighthouse offline check passes. | 1.3.2.a | ⬜ |
| 3.1.2.b | Load CodeMirror modes only when the user opens the JSON editor. | Initial network requests ≤ 3. | 1.3.1.b | ⬜ |
| 3.1.3.a | Watch heap usage after each parse; warn if it exceeds 100 MB. | Warning displayed; memory chart added. | 3.1.* | ⬜ |

### 3.2 Better Blueprint Tools (Medium Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 3.2.1.a | Add `batchProcessor.js` so users can queue several blueprints to process one after another. | CLI demo processes 5 blueprints. | 3.1.1.b | ⬜ |
| 3.2.1.b | Write unit tests for queue timeouts and cancel actions. | All tests green. | 3.2.1.a | ⬜ |
| 3.2.2.a | Write a template engine: each template has YAML front-matter plus JSON skeleton with `${var}` placeholders. | Example template renders. | 1.1.1.a | ⬜ |
| 3.2.2.b | Build a modal that lists templates and lets you search by tag. | Modal opens and filters. | 3.2.2.a | ⬜ |
| 3.2.2.c | Auto-generate a form for template parameters and inject values into JSON. | Form saves and exports. | 3.2.2.b | ⬜ |
| 3.2.3.a | Add semantic checks: warn if router depth > 5 or module count > 300. | Warnings appear in output. | 2.1.* | ⬜ |
| 3.2.3.b | Flag deprecated module types with tooltips. | Tooltip shows on hover. | 3.2.3.a | ⬜ |

### 3.3 API and Deployment (Medium Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 3.3.1.a | Create `apiClient.js` using axios with retry and circuit-breaker logic. | Unit tests with nock pass. | 2.2.2.b | ⬜ |
| 3.3.1.b | Add a unit test that verifies exponential backoff works. | Test passes. | 3.3.1.a | ⬜ |
| 3.3.2.a | Implement OAuth PKCE flow for Make.com; store the token securely. | User can sign in. | 3.3.1.a | ⬜ |
| 3.3.2.b | Add a "Deploy Scenario" button that sends the JSON to the Make API. | Scenario appears in Make. | 3.3.2.a | ⬜ |
| 3.3.3.a | Create an Express webhook handler and dead-letter queue (DLQ) using local-forage. | Failed events queued. | 3.3.1.a | ⬜ |

---

## Phase 4 — Release and QA (Weeks 12-16)

### 4.1 Comprehensive Testing (Critical Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 4.1.1.a | Configure Jest with jsdom-worker; reach at least 90% coverage on core code. | Coverage report saved. | 1.2.* | ⬜ |
| 4.1.1.b | Create snapshot tests for the HTML spec output using pretty-html. | Snapshots pass. | 4.1.1.a | ⬜ |
| 4.1.2.a | Write integration tests that hit the Make sandbox API (`.env.test` for secrets). | GitHub Actions job passes. | 3.3.* | ⬜ |
| 4.1.2.b | Full E2E test: import blueprint → generate spec → export → re-import into Make. | Criteria doc shows all ✔. | 2.1., 3.2. | ⬜ |
| 4.1.3.a | Load-test with Puppeteer: load a 1,000-module blueprint, measure < 8s processing time. | Results in `docs/Perf.md`. | 3.1.* | ⬜ |

### 4.2 User Experience Polish (High Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 4.2.1.a | Add a Web App Manifest and icons; confirm "Add to Home Screen" works in Chrome. | Lighthouse PWA score 100. | 3.1.2.a | ⬜ |
| 4.2.1.b | Add a light/dark theme toggle and store the choice in localStorage. | Theme persists after refresh. | 1.2.2.b | ⬜ |
| 4.2.2.a | Run an axe-core audit and fix ARIA labels and colour contrast issues (> 4.5:1). | Axe score 100. | 4.2.1.b | ⬜ |
| 4.2.3.a | Add swipe gestures (left/right) on mobile to move through history items. | Works in Mobile Safari. | 1.2.2.b | ⬜ |

### 4.3 Deployment and Monitoring (Critical Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 4.3.1.a | Set up GitHub Actions to lint, test, build, and deploy to GitHub Pages. | Pipeline passes on main. | 1.3.4.a | ⬜ |
| 4.3.2.a | Add Grafana (or another APM) dashboards for performance and error rate. | Dashboard reachable. | 2.3.1.a | ⬜ |
| 4.3.3.a | Enable basic rate-limiting and add standard security headers in any Node wrapper. | OWASP scan finds no critical issues. | 2.2.2.b | ⬜ |

---

## Quick Wins (≤ 2 days each)

- Remove temp files (1.1.2.a)
- Shrink bundle by loading vendor scripts from CDN (1.3.2.a)
- Add Sentry for error tracking (2.3.1.a)
- Offline support with service worker (3.1.2.a)

## Critical Path

1. Schema + importer (Phase 2)
2. Security baseline (Phase 2.2)
3. High test coverage (Phase 4.1)
4. CI/CD pipeline (Phase 4.3)

---

When this list is complete, Coffee Grinder will support both Make.com blueprint import and export, run fast on large files, work offline, and be safe for public use.