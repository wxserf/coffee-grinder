const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const outputFile = path.join(distDir, 'coffee-grinder.html');

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

const htmlPath = path.join(srcDir, 'index.html');
const cssPath = path.join(srcDir, 'styles', 'main.css');
const mainJsPath = path.join(srcDir, 'scripts', 'main.js');
const workerJsPath = path.join(srcDir, 'scripts', 'worker.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
const mainJsContent = fs.readFileSync(mainJsPath, 'utf-8');
const workerJsContent = fs.readFileSync(workerJsPath, 'utf-8');

// Inline CSS
let output = htmlContent.replace(
  /<link rel="stylesheet" href="styles\/main.css"\/?>/,
  `<style>\n${cssContent}\n</style>`
);

// Inline main.js and worker.js
// Remove external script reference to main.js
output = output.replace(
  /<script src="scripts\/main.js"><\/script>/,
  `<script>\n${mainJsContent}\n</script>`
);

// Replace worker instantiation to inline worker code as Blob
const workerBlobCode = `
const workerCode = \`${workerJsContent.replace(/`/g, '\\`')}\`;
const specWorker = new Worker(URL.createObjectURL(new Blob([workerCode], { type:'application/javascript' })));
`;

// Replace the line: const specWorker = new Worker('scripts/worker.js');
output = output.replace(
  /const specWorker = new Worker\('scripts\/worker\.js'\);/,
  workerBlobCode.trim()
);

fs.writeFileSync(outputFile, output, 'utf-8');

console.log('Build complete: ' + outputFile);
