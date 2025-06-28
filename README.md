# Erin's Coffee Grinder

## Overview
Erin's Coffee Grinder is a web-based blueprint analyzer that processes automation blueprints and generates detailed specifications. This project has been modularized for easier maintenance and team collaboration.

## Project Structure
- `src/index.html`: Main HTML file referencing external CSS and JS.
- `src/styles/main.css`: Stylesheet extracted from original single-file app.
- `src/scripts/main.js`: Main JavaScript logic for UI and blueprint processing.
- `src/workers/specWorker.js`: Web worker script for blueprint processing.
- `.gitignore`: Specifies files and folders to ignore in Git.

### Architecture Diagram
For a quick overview of the folder layout, see [docs/arch.svg](docs/arch.svg).

## Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.)
- Optional: Node.js and npm for running local servers and build scripts.

### Running Locally
You can serve the `src` directory using a simple HTTP server or the provided npm script:

#### Using Python 3
```bash
python -m http.server 8080 --directory src
```

#### Using Node.js (with `serve` package)
```bash
npx serve src -p 8080
```

#### Using npm
```bash
npm run dev
```

Then open your browser at `http://localhost:8080`.

### Development
- Edit source files in `src/`.
- The app will load the modularized CSS and JS files.
- Start a local dev server with:
   ```bash
   npm run dev
   ```

### Building for Distribution
Build artifacts are generated in `dist/`:

1. Bundle scripts with Rollup:
   ```bash
   npm run build
   ```
2. Inline assets and create `dist/coffee-grinder.html`:
   ```bash
   node build.js
   ```
3. Preview the built file:
   ```bash
   npm run serve
   ```

### Running Tests
Before running tests, install dependencies with:
```bash
npm ci
```
Then execute the unit tests with:
```bash
npm test
```

## Contributing
Contributions are welcome! Fork the repository and create a feature branch
from `main`. When you're ready, open a pull request. See
[`CONTRIBUTING.md`](CONTRIBUTING.md) for full guidelines.

## License
This project is licensed under the [MIT License](LICENSE).
