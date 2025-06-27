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
const workerJsPath = path.join(srcDir, 'workers', 'specWorker.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
const cssContent = fs.readFileSync(cssPath, 'utf-8');
let mainJsContent = fs.readFileSync(mainJsPath, 'utf-8');
const workerJsContent = fs.readFileSync(workerJsPath, 'utf-8');

// Detect if the developer version already inlines the worker using a Blob
const blobWorkerRegex = /new\s+Worker\(\s*URL\.createObjectURL\(\s*new\s+Blob/;
const externalWorkerRegex = /const\s+specWorker\s*=\s*new\s+Worker\(['"]workers\/specWorker\.js['"]\);/;

if (!blobWorkerRegex.test(mainJsContent) && externalWorkerRegex.test(mainJsContent)) {
  const workerBlobCode = `
const workerCode = \`${workerJsContent.replace(/`/g, '\\`')}\`;
const specWorker = new Worker(URL.createObjectURL(new Blob([workerCode], { type: 'application/javascript' })));
`;
  mainJsContent = mainJsContent.replace(externalWorkerRegex, workerBlobCode.trim());
}

// Inline CSS
let output = htmlContent.replace(
  /<link rel="stylesheet" href="styles\/main.css"\/?>/,
  `<style>\n${cssContent}\n</style>`
);

// Inline main.js and provide worker code variable for offline build
const workerVar = `const WORKER_CODE = \`${workerJsContent.replace(/`/g, '\\`')}\`;`;
output = output.replace(
  /<script type="module" src="scripts\/main.js"><\/script>/,
  `<script type="module">\n${workerVar}\n${mainJsContent}\n<\/script>`
);

fs.writeFileSync(outputFile, output, 'utf-8');

console.log('Build complete: ' + outputFile);
