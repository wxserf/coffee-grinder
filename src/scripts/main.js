// --- Config & Initialization ---
const { persistFields, persistToggles, setupExportButtons, toggleExportButtons, generatePdf, generateMarkdown, generatePlain, download } = require("../components/ui/buttons");
const { initFilter, makeSortable } = require("../components/ui/tables");
const { showError, showWarning, clearError, clearAllErrors } = require("../components/ui/modals");
const META_FIELDS = ['preparedBy', 'recipient', 'version', 'objective'];
const TOGGLE_FIELDS = ['showScenario', 'showConnections', 'showVars', 'showFilters', 'showModuleDetails'];
const DEFAULT_TOGGLES = {
    showScenario: true, showConnections: true, showVars: true,
    showFilters: true, showModuleDetails: true
};

// Persist metadata & toggles
persistFields(META_FIELDS);
persistToggles(TOGGLE_FIELDS, DEFAULT_TOGGLES, () => {
  if (blueprint && !genBtn.disabled) document.getElementById("generateBtn").click();
});


// CodeMirror editor
const editor = CodeMirror.fromTextArea(document.getElementById('jsonInput'), {
  mode: 'application/json', lineNumbers: true, theme: 'default' // Use default theme
});

// AJV schema (basic top-level)
const schema = {
  type: 'object',
  required: ['name','flow'],
  properties: {
    name: { type: 'string' },
    flow: { type: 'array' },
    metadata: { type: 'object' } // Expect metadata
  },
  additionalProperties: true
};
const ajv = new Ajv();
const validate = ajv.compile(schema);

// UI refs
const upload = document.getElementById('jsonUpload');
const uploadErr = document.getElementById('uploadError');
const valErr = document.getElementById('validateError');
const parseWarn = document.getElementById('parseWarning');
const genBtn = document.getElementById('generateBtn');
const sampleBtn = document.getElementById('sampleBtn');
const togglesEl = document.getElementById('toggles');
const progress = document.getElementById('progress');
const outArea = document.getElementById('outputArea');
const tableControls = document.getElementById('tableControls');
const tableFilter = document.getElementById('tableFilter');
const copyBtn = document.getElementById('copyBtn');
const pdfBtn = document.getElementById('exportPdfBtn');
const mdBtn = document.getElementById('exportMdBtn');
const txtBtn = document.getElementById('exportTxtBtn');

let blueprint = null;
let processedModules = []; // Store the result of processing

// --- Utility Functions ---
function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}
function showWarning(msg) {
    parseWarn.textContent = msg;
    parseWarn.style.display = 'block';
}
function clearError(el) {
  el.textContent = '';
  el.style.display = 'none';
}
function clearAllErrors() {
    clearError(uploadErr);
    clearError(valErr);
    clearError(parseWarn);
}
let sanitizeForHTML, formatJson;
if (typeof module !== 'undefined' && module.exports) {
    ({ sanitizeForHTML, formatJson } = require('./utils'));
}

// --- Core Logic ---

// Validate editor content
function tryValidate() {
  clearAllErrors();
  let data;
  blueprint = null; // Reset
  processedModules = []; // Reset
  try {
    data = JSON.parse(editor.getValue());
  } catch (e) {
    showError(valErr, 'Invalid JSON: ' + e.message);
    genBtn.disabled = true;
    return;
  }
  if (!validate(data)) {
    showError(valErr, 'Schema validation failed: ' + ajv.errorsText(validate.errors));
    genBtn.disabled = true;
  } else {
    blueprint = data;
    genBtn.disabled = false;
    // Add a simple warning if metadata or scenario details are missing
    if (!blueprint.metadata || !blueprint.metadata.scenario) {
        showWarning("Warning: Blueprint may be missing standard 'metadata' or 'metadata.scenario' structure. Some details might not be extracted.");
    }
  }
}
editor.on('change', tryValidate);

// File upload handler
upload.addEventListener('change', e => {
  clearAllErrors();
  const f = e.target.files[0];
  if (!f) return;
  if (f.type !== 'application/json') {
    showError(uploadErr, 'Please upload a valid JSON file (.json).');
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    editor.setValue(reader.result);
    tryValidate(); // Validate after loading
  };
  reader.onerror = () => {
    showError(uploadErr, 'Error reading file.');
  };
  reader.readAsText(f);
});

// Load sample blueprint
sampleBtn.addEventListener('click', () => {
   const sample = {
    name: 'Sample Recursive Scenario',
    metadata: {
        instant: false,
        scenario: { roundtrips: 1, maxErrors: 3, autoCommit: true, sequential: false }
    },
    connections: [{ name: 'Default HTTP', type: 'http', id: 5678 }],
    variables: [{ name: 'API_KEY', value: '******', type: 'text'}],
    flow: [
        { id: '1', module: 'http:request', label: 'Initial GET', parameters: { "__IMTCONN__": 5678, url: "https://example.com/data" }, metadata: { designer: {x:0, y:0}, restore: { parameters: { "__IMTCONN__": { label: 'Default HTTP' } } } }, filter: null },
        { id: '2', module: 'builtin:BasicRouter', label: 'Check Status', metadata: { designer: {x: 200, y:0}}, routes: [
            { filter: { conditions: [[{a: "{{1.status_code}}", o:"equal", b:"200"}]]}, flow: [
                { id: '3', module: 'json:parse', label: 'Parse Result', mapper: { json: "{{1.data}}"}, metadata: { designer: {x:400, y:-100}}},
                { id: '5', module: 'util:SetVariable2', label: 'Store ID', mapper: { name: "itemID", value: "{{3.id}}"}, metadata: { designer: {x:600, y:-100}}}
            ]},
            { filter: null, flow: [ // Fallback path
                { id: '4', module: 'tools:log', label: 'Log Error Status', mapper: { message: "Non-200 Status: {{1.status_code}}"}, metadata: { designer: {x:400, y:100}}}
            ]}
        ]},
        { id: '6', module: 'http:request', label: 'Process Item', parameters: { "__IMTCONN__": 5678, url: "https://example.com/process/{{5.itemID}}" }, metadata: { designer: {x:800, y:0}, restore: { parameters: { "__IMTCONN__": { label: 'Default HTTP' } } } }, onerror: [
             { id: '7', module: 'builtin:Break', version: 1, label: 'Retry on Error', mapper: { retry: true, count: 3, interval: 5}, metadata: { designer: {x: 1000, y: 100}}}
        ]}
    ]
   };
   editor.setValue(JSON.stringify(sample, null, 2));
   tryValidate();
});

// --- Web Worker for Processing ---
let specWorker = null;

function initWorker() {
    let codePromise;
    if (typeof WORKER_CODE !== 'undefined') {
        codePromise = Promise.resolve(WORKER_CODE);
    } else {
        codePromise = fetch('scripts/worker.js').then(r => r.text());
    }

    return codePromise
        .then(code => {
            const blob = new Blob([code], { type: 'application/javascript' });
            specWorker = new Worker(URL.createObjectURL(blob));
            specWorker.onmessage = handleWorkerMessage;
            specWorker.onerror = handleWorkerError;
        })
        .catch(err => showError(valErr, 'Failed to load worker: ' + err));
}

initWorker();

// --- Event Handlers ---

// Generate spec
genBtn.addEventListener('click', () => {
  if (!blueprint) {
      showError(valErr, "No valid blueprint loaded.");
      return;
  }
  togglesEl.style.display = 'block'; // Show toggles
  progress.textContent = 'Processing blueprint...';
  progress.style.color = 'var(--muted)';
  outArea.innerHTML = ''; // Clear previous output
  tableControls.style.display = 'none'; // Hide table controls initially
  [copyBtn, pdfBtn, mdBtn, txtBtn].forEach(b => b.style.display = 'none'); // Hide export buttons

  const currentToggles = {};
  TOGGLE_FIELDS.forEach(id => currentToggles[id] = document.getElementById(id).checked);

  specWorker.postMessage({ blueprint: blueprint, toggles: currentToggles });
});

// Worker message handlers
function handleWorkerMessage(e) {
    const { html, warnings, processedModules: pm } = e.data;
    processedModules = pm; // Store processed data for export

    outArea.innerHTML = html;
    if (warnings && warnings.length > 0) {
        showWarning('Processing Warnings:\n- ' + warnings.join('\n- '));
    } else {
        clearError(parseWarn); // Clear previous warnings if successful
    }

    // Make table sortable if it exists
    const modulesTable = document.getElementById('modulesTable');
    if (modulesTable) {
         sorttable.makeSortable(modulesTable);
         tableControls.style.display = 'block'; // Show filter
    } else {
         tableControls.style.display = 'none';
    }

    activateFeatures(); // Enable filtering and export buttons
    progress.textContent = 'Specification generated successfully.';
    progress.style.color = 'green'; // Indicate success
}

function handleWorkerError(e) {
    progress.textContent = 'Error during processing: ' + e.message;
    progress.style.color = 'var(--error-text)';
    showError(valErr, 'Worker error: ' + e.message);
}


// --- Feature Activation ---
function activateFeatures() {
  initFilter(tableFilter);
  if (outArea.innerHTML.trim() !== "") {
    toggleExportButtons([copyBtn, pdfBtn, mdBtn, txtBtn], true);
  }
  setupExportButtons({ copyBtn, pdfBtn, mdBtn, txtBtn }, {
    generatePdf,
    generateMarkdown,
    generatePlain,
    download,
  });
}



// --- Initial Load ---
if (editor.getValue().trim()) {
    tryValidate();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sanitizeForHTML, formatJson };
}
