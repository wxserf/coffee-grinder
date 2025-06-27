# Changelog

All notable changes to this project will be documented in this file.

## [7.0.0-baseline] - 2025-06-25
### Added
- Initial modularization of Coffee Grinder into separate HTML, CSS, and JavaScript files under `src/`.
- Web worker extracted into `src/workers/specWorker.js`.
- Build pipeline using Rollup (`build.config.js`) and a custom Node build script (`build.js`) to produce a single-file distribution in `dist/`.
- Development scripts in `package.json` for serving the modular code and building the bundled release.

