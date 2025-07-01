# Coffee Grinder — Updated Micro-Task Roadmap

## Why this file exists

This roadmap lists every concrete step we need to take to turn Coffee Grinder into a production-ready Make.com tool. Each item is small (a micro-task) and has:

- A clear description of what to do
- The file or behaviour we expect when it is finished
- Any tasks that must be done first

The checklist is grouped by project phase so you can work from the ground up: complete core features, improve security/logging, and finally harden the app for deployment.

## Key for reading the tables

| Field | Meaning | Example |
|-------|---------|---------|
| ID | P.S.T.m → Phase, Section, Task, micro-step | 2.1.3.b = Phase 2, Section 1, Task 3, Step b |
| Priority | Critical › High › Medium › Low | Critical steps block the release |
| Output | What should exist or work when the step is finished | "logger.js added and unit-tested" |
| Dependency | Micro-tasks that must be finished first | depends: 1.1.1.a |
| Status | ⬜ Todo · ⚙ In Progress · ✅ Done | Use these boxes to track progress |

## Current Status Summary

**✅ Phase 1 Foundation:** 90% complete - excellent modular architecture, build system, and tooling
**⚙ Phase 2 Core Features:** 40% complete - basic import/export exists but needs schema validation and enhanced features  
**⚙ Phase 2 Security:** 30% complete - CSP implemented, but missing sanitization and hardening
**⚙ Phase 2 Logging:** 0% complete - critical gap for production readiness
**⚙ Phase 3 API (ahead of schedule):** 50% complete - basic API client implemented with fetch

---

## Phase 1 — Foundation Cleanup (Weeks 1-3) — 90% COMPLETE

### 1.1 Folder Layout and Basic Hygiene (High Priority) — ✅ COMPLETE

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 1.1.1.a | Make new folders: `src/components/`, `src/services/`, `src/workers/`, `src/validators/`, `src/utils/`, `src/templates/`, and `tests/`. | Folders exist; npm test still runs. | — | ✅ |
| 1.1.1.b | Move all DOM code to `src/components/ui/` (split into `buttons.js`, `tables.js`, `modals.js`). Update imports. | ESLint passes. | 1.1.1.a | ✅ |
| 1.1.1.c | Rename the worker to `src/workers/specWorker.js` and export `processBlueprint()` for tests. | Build and Jest are green. | 1.1.1.a | ✅ |
| 1.1.1.d | Add Rollup path aliases (`@components`, `@services`, …) in `rollup.config.js`. | Builds work with new paths. | 1.1.1.b-c | ✅ |
| 1.1.1.e | Draw a simple SVG diagram of the new folder tree and save it as `docs/arch.svg`; link it in the README. | Diagram visible in docs. | 1.1.1.a | ✅ |
| 1.1.2.a | Delete leftover temp files (`*.tmp`), duplicate images, and the old `ecg69.html`. | `git status` shows no stray files. | — | ✅ |
| 1.1.2.b | Add `dist/`, `coverage/`, `logs/`, and `.DS_Store` to `.gitignore`. | Git no longer tracks these. | — | ✅ |
| 1.1.2.c | Run `source-map-explorer` and save the bundle report to `docs/bundle_YYYY-MM-DD.html`. | Report committed. | — | ✅ |
| 1.1.3.a | Run `madge --circular src/` and save results to `docs/circularDeps.txt`. | File created. | 1.1.1.* | ⬜ |
| 1.1.3.b | Add `.dependency-cruiser.js` with rules that forbid backwards imports (e.g., utils must not depend on components). | CI breaks on violation. | 1.1.1.* | ⬜ |
| 1.1.3.c | Use `depcheck` to remove unused packages and update `package.json` and the lockfile. | `npm i` prints no warnings. | — | ⬜ |
| 1.1.3.d | Add `.vscode/extensions.json` recommending ESLint, Prettier, and JavaScript/TypeScript language server. | VSCode prompts to install. | — | ⬜ |

### 1.2 Code Deduplication (High Priority) — ✅ MOSTLY COMPLETE

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 1.2.1.a | Use `jsinspect` to find duplicate patterns across JS files; save results to `docs/duplicates.md`. | Report shows what to refactor. | 1.1.1.* | ⬜ |
| 1.2.1.b | Create `src/utils/jsonProcessor.js` with safe parse/stringify functions; replace all `JSON.parse` calls. | All JSON handling is centralized. | 1.1.1.a | ⚙ |
| 1.2.2.a | Create `src/validators/baseValidator.js` that wraps Ajv with sensible defaults. | Validator exports an Ajv instance. | 1.1.1.a | ✅ |
| 1.2.2.b | Create `src/utils/errorHandler.js` and replace all `alert()` calls with `showError()` or `showWarning()`. | No raw alerts remain. | 1.1.1.a | ✅ |
| 1.2.3.a | Set up ESLint and Prettier; add pre-commit hooks with Husky. | `git commit` runs the linter. | 1.1.1.* | ✅ |
| 1.2.3.b | Run `npm run lint:fix` once to apply consistent formatting. | Code style is uniform. | 1.2.3.a | ✅ |

### 1.3 Build and Tooling Improvements (Medium Priority) — 80% COMPLETE

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 1.3.1.a | Split the bundle: put vendor libs in one file, the main app in another, and the worker separately. Enable tree-shaking. | Three bundle files created. | 1.1.1.c | ✅ |
| 1.3.1.b | Add a build-time plugin to generate a bundle analysis report using `rollup-plugin-analyzer`. | Report exists. | 1.3.1.a | ✅ |
| 1.3.1.c | Generate a Rollup bundle report with `rollup-plugin-analyzer` and commit it as `docs/bundleReport.html`. | Report exists. | 1.3.1.a | ✅ |
| 1.3.2.a | Load heavy libraries from a CDN in production; keep local copies in development. | `index.html` switches based on `NODE_ENV`. | 1.3.1.* | ✅ |
| 1.3.2.b | Add a `vite-preview` script for a lightweight dev server. | `npm run preview` serves the app. | 1.3.1.* | ⬜ |
| 1.3.3.a | Make separate Rollup configs for dev and prod; turn off source maps in prod. | Two config files documented. | 1.3.1.a | ✅ |
| 1.3.3.b | Enable Terser minification in prod; make sure it does not break the worker. | Build works; smoke test passes. | 1.3.3.a | ⬜ |
| 1.3.4.a | Write a release script that bumps the version, builds, and creates a GitHub release with the bundle. | `scripts/release.js` works. | 1.3.3.* | ⬜ |

---

## Phase 2 — Core Features & Production Readiness (Weeks 4-7) — CRITICAL PRIORITY

### 2.1 Make.com Schema Validation & Import/Export (Critical Priority) — 40% COMPLETE

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 2.1.1.a | **[CRITICAL]** Integrate existing JSON Schema into `blueprintImporter.js` using Ajv validation. | Schema validation actually runs on import. | — | ⚙ |
| 2.1.1.b | Create sample blueprint files in `samples/` directory (small, medium, large complexity) and validate against schema. | Coverage table created in `docs/schemaCoverage.md`. | 2.1.1.a | ⬜ |
| 2.1.1.c | Add a CI job `npm run validate:samples` to enforce the schema check. | CI job runs on push. | 2.1.1.b | ⬜ |
| 2.1.2.a | Enhance `src/services/blueprintExporter.js` to preserve module coordinates and handle missing data. | Exporter maintains layout fidelity. | — | ⚙ |
| 2.1.2.b | Implement coordinate auto-placement: if modules lack x/y coords, place them on a fallback grid. | Missing coords get default positions. | 2.1.2.a | ⬜ |
| 2.1.3.a | Enhance `src/services/blueprintImporter.js` with comprehensive error handling and validation feedback. | Importer gives detailed error messages. | 2.1.1.a | ⚙ |
| 2.1.3.b | **[CRITICAL]** Add connection ID remapping option for importing blueprints from different Make.com accounts. | Unit tests cover ID remapping scenarios. | 2.1.3.a | ⬜ |
| 2.1.3.c | Write `docs/importer_howto.md` with examples of CLI and UI usage, including edge cases. | Usage guide complete. | 2.1.3.b | ⬜ |

### 2.2 Security Hardening (Critical Priority) — 30% COMPLETE

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 2.2.1.a | Add a Content Security Policy tag allowing only self resources and `worker-src blob:`. | DevTools shows no CSP errors. | 1.3.* | ✅ |
| 2.2.1.b | Add a random nonce to every inline script on page load. | CSP passes with nonce. | 2.2.1.a | ✅ |
| 2.2.2.a | **[CRITICAL]** Harden Ajv: limit object depth (maxDepth: 10), error count, and string lengths to prevent DoS. | Fuzz tests run clean; no infinite loops. | 2.1.1.* | ⬜ |
| 2.2.2.b | Add an Express rate-limiting middleware template for future API routes. | Middleware file created. | — | ⬜ |
| 2.2.3.a | **[CRITICAL]** Replace custom sanitizer with DOMPurify for all HTML from worker before DOM insertion. | XSS test passes; security audit clean. | — | ⬜ |
| 2.2.3.b | Run `npm audit`, `audit-ci`, and `retire.js`; fix all critical and high severity findings. | Security report shows no critical issues. | 2.2.* | ⬜ |

### 2.3 Logging and Error Tracking (Critical Priority) — 0% COMPLETE

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 2.3.1.a | **[CRITICAL]** Set up Sentry using environment variable for DSN; upload source maps after each build. | Sentry dashboard shows errors with stack traces. | 1.3.4.a | ⬜ |
| 2.3.1.b | Add Sentry breadcrumbs for: blueprint loaded, validation failure, worker error, and export actions. | Breadcrumbs appear in Sentry error reports. | 2.3.1.a | ⬜ |
| 2.3.2.a | **[CRITICAL]** Create `src/utils/logger.js` with structured JSON logging (debug/info/warn/error levels). | Logger unit-tested and documented. | — | ⬜ |
| 2.3.2.b | Replace all direct `console.*` calls with structured logger throughout codebase. | `grep -r "console\." src/` returns nothing. | 2.3.2.a | ⬜ |
| 2.3.3.a | Add a `/health` endpoint template for future server deployment with basic status checks. | Health check template documented. | 2.3.2.a | ⬜ |
| 2.3.3.b | Implement worker heartbeat: post message every 10s, show status indicator in UI. | Green/red dot shows worker health. | 1.1.1.c | ⬜ |

---

## Phase 3 — API Integration & Enhanced Features (Weeks 8-11) — PARTIAL PROGRESS

### 3.1 Make.com API Integration (Medium Priority) — 50% COMPLETE

**Note:** Basic API client already implemented with `fetch` instead of planned `axios` - this is acceptable.

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 3.1.1.a | Enhance existing `makeApiClient.js` with circuit-breaker logic and exponential backoff. | Unit tests show resilience patterns work. | 2.2.2.b | ⚙ |
| 3.1.1.b | Add comprehensive unit tests for API client retry logic and error scenarios using `nock`. | Test coverage > 90% for API client. | 3.1.1.a | ⬜ |
| 3.1.2.a | Implement OAuth PKCE flow for Make.com authentication; store tokens securely in memory. | User can authenticate and deploy scenarios. | 3.1.1.a | ⬜ |
| 3.1.2.b | Add "Deploy to Make" button that sends validated blueprint to Make.com API. | Scenario appears in user's Make account. | 3.1.2.a | ⬜ |
| 3.1.3.a | Create webhook handler template and dead-letter queue for failed API calls. | Failed deployments are queued for retry. | 3.1.1.a | ⬜ |

### 3.2 Performance Improvements (Medium Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 3.2.1.a | Implement worker progress reporting for large blueprint processing (> 100 modules). | Progress bar shows during long operations. | 1.1.1.c | ⬜ |
| 3.2.1.b | Add memory usage monitoring; warn if heap exceeds 100MB during processing. | Warning displayed with memory chart. | 3.2.1.a | ⬜ |
| 3.2.1.c | Implement lazy loading for CodeMirror to reduce initial bundle size. | Initial network requests ≤ 3. | 1.3.1.b | ⬜ |
| 3.2.2.a | Add service worker for offline functionality and asset caching. | App works fully offline after first load. | 1.3.2.a | ⬜ |

### 3.3 Blueprint Enhancement Tools (Low Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 3.3.1.a | Add batch processing: queue multiple blueprints for sequential processing. | CLI demo processes 5 blueprints. | 2.1.* | ⬜ |
| 3.3.2.a | Implement blueprint template system with YAML front-matter and variable substitution. | Template engine processes example template. | 2.1.* | ⬜ |
| 3.3.3.a | Add semantic validation: warn for router depth > 5, module count > 300, deprecated modules. | Warnings appear in spec output. | 2.1.* | ⬜ |

---

## Phase 4 — Testing & Deployment (Weeks 12-16)

### 4.1 Comprehensive Testing (Critical Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 4.1.1.a | Expand Jest test coverage to 80%+ on core modules (importer, exporter, worker logic). | Coverage report meets target. | 2.1.* | ⬜ |
| 4.1.1.b | Add snapshot tests for HTML spec output to catch rendering regressions. | Snapshots prevent UI regressions. | 4.1.1.a | ⬜ |
| 4.1.1.c | Create integration tests for full import → process → export → re-import cycle. | End-to-end pipeline tested. | 2.1.*, 3.1.* | ⬜ |
| 4.1.2.a | Performance baseline: measure processing time for 1000-module blueprint (target < 8s). | Benchmark results documented. | 2.1.* | ⬜ |
| 4.1.2.b | Load testing with Puppeteer: simulate realistic user workflows. | Load test results show acceptable performance. | 4.1.2.a | ⬜ |

### 4.2 Deployment Automation (High Priority)

| ID | What to do | Output when done | Depends on | Status |
|----|------------|------------------|------------|---------|
| 4.2.1.a | Complete release automation: version bump, build, GitHub release creation. | `npm run release` works end-to-end. | 1.3.4.a | ⬜ |
| 4.2.1.b | Set up automated deployment to GitHub Pages on main branch push. | Live demo updates automatically. | 4.2.1.a | ⬜ |
| 4.2.2.a | Create Docker container for server deployment (if API features needed). | Container runs app with health checks. | 3.1.* | ⬜ |

---

## Critical Path for Production Readiness

**Priority 1 (Immediate - Week 1-2):**
1. Complete schema validation integration (2.1.1.a)
2. Implement DOMPurify sanitization (2.2.3.a)
3. Create structured logger (2.3.2.a)

**Priority 2 (Week 2-3):**
1. Add connection ID remapping (2.1.3.b)
2. Set up Sentry error tracking (2.3.1.a)
3. Harden Ajv validation (2.2.2.a)

**Priority 3 (Week 3-4):**
1. Enhance import/export robustness (2.1.2.b, 2.1.3.c)
2. Complete security audit (2.2.3.b)
3. Replace console calls with logger (2.3.2.b)

## Quick Wins (Can be done anytime)

- Minification in production build (1.3.3.b)
- Dependency audit and cleanup (1.1.3.c, 2.2.3.b)
- Worker heartbeat indicator (2.3.3.b)
- Development server improvements (1.3.2.b)

## Deferred Items (Post-Production)

- Template engine and batch processing (3.3.*)
- Advanced performance optimizations (3.2.*)
- Comprehensive E2E testing (4.1.2.*)
- OAuth PKCE implementation (3.1.2.*)

---

**Total Estimated Time to Production:** 4-6 weeks focused development
**Current Completion:** ~60% overall, 40% of critical path items
