// --- Config & Initialization ---
const META_FIELDS = ['preparedBy', 'recipient', 'version', 'objective'];
const TOGGLE_FIELDS = ['showScenario', 'showConnections', 'showVars', 'showFilters', 'showModuleDetails'];
const DEFAULT_TOGGLES = {
    showScenario: true, showConnections: true, showVars: true,
    showFilters: true, showModuleDetails: true
};

// Persist metadata & toggles
META_FIELDS.forEach(id => {
  const el = document.getElementById(id);
  el.value = localStorage.getItem(id) || '';
  el.addEventListener('input', () => localStorage.setItem(id, el.value));
});

TOGGLE_FIELDS.forEach(id => {
    const el = document.getElementById(id);
    const storedValue = localStorage.getItem(`toggle_${id}`);
    el.checked = storedValue !== null ? (storedValue === 'true') : DEFAULT_TOGGLES[id];
    el.addEventListener('change', () => {
        localStorage.setItem(`toggle_${id}`, el.checked);
        // Re-generate if blueprint is loaded
        if (blueprint && !genBtn.disabled) {
             document.getElementById('generateBtn').click();
        }
    });
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
function sanitizeForHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, '&#039;');
}
function formatJson(data) {
    try {
        return JSON.stringify(data, null, 2);
    } catch (e) {
        return '[Could not format JSON]';
    }
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
const specWorker = new Worker('scripts/worker.js');

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

// Handle worker response
specWorker.onmessage = e => {
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
};
specWorker.onerror = e => {
    progress.textContent = 'Error during processing: ' + e.message;
     progress.style.color = 'var(--error-text)';
    showError(valErr, 'Worker error: ' + e.message);
};


// --- Feature Activation ---
function activateFeatures() {
  tableFilter.oninput = () => {
    const q = tableFilter.value.toLowerCase().trim();
    const table = document.getElementById('modulesTable');
    if (!table) return;
    table.querySelectorAll('tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  // Show buttons if there's content
  if (outArea.innerHTML.trim() !== '') {
      copyBtn.style.display = 'inline-block';
      pdfBtn.style.display = 'inline-block';
      mdBtn.style.display = 'inline-block';
      txtBtn.style.display = 'inline-block';
  }

  copyBtn.onclick = () => navigator.clipboard.writeText(generatePlain());
  pdfBtn.onclick = generatePdf; // Use dedicated function for better options
  mdBtn.onclick  = () => download('spec.md', generateMarkdown());
  txtBtn.onclick = () => download('spec.txt', generatePlain());
}

// --- Export Functions ---
function generatePdf() {
    progress.textContent = 'Generating PDF...';
    const element = outArea; // Select the output area
    const opt = {
      margin:       0.5, // Inches
      filename:     `${blueprint?.name || 'blueprint'}_spec.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true }, // Increase scale for better resolution
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' } // Landscape more likely needed
    };
    html2pdf().from(element).set(opt).save().then(() => {
         progress.textContent = 'PDF generated.';
    }).catch(err => {
        progress.textContent = 'PDF generation failed.';
        showError(valErr, `PDF Error: ${err}`);
    });
}

function generateMarkdown() {
    let md = `# Blueprint Specification: ${blueprint?.name || 'Untitled'}\n\n`;
    const meta = META_FIELDS.reduce((acc, id) => { acc[id] = document.getElementById(id).value; return acc; }, {});
    if (meta.preparedBy) md += `**Prepared By:** ${meta.preparedBy}\n`;
    if (meta.recipient) md += `**Recipient:** ${meta.recipient}\n`;
    if (meta.version) md += `**Version:** ${meta.version}\n`;
    if (meta.objective) md += `**Objective:** ${meta.objective}\n`;
    md += "\n";

    const toggles = TOGGLE_FIELDS.reduce((acc, id) => { acc[id] = document.getElementById(id).checked; return acc; }, {});

    if (toggles.showScenario && blueprint?.metadata?.scenario) {
        md += "## Scenario Details\n";
        const s = blueprint.metadata.scenario;
        md += `- **Type:** ${blueprint.metadata.instant ? 'Instant (Webhook)' : 'Scheduled / On Demand'}\n`;
        md += `- **Sequential:** ${s.sequential ? 'Yes' : 'No'}\n`;
        // Add other scenario details similarly...
        md += "\n";
    }

    if (toggles.showConnections && blueprint?.connections?.length > 0) {
        md += "## Connections Used\n";
        blueprint.connections.forEach(c => {
            md += `- **${c.name || 'Unnamed'}** (Type: ${c.type || '?'}, ID: ${c.id || '?'})\n`;
        });
        md += "\n";
    }

    if (toggles.showVars && blueprint?.variables?.length > 0) {
        md += "## Variables Defined\n";
         blueprint.variables.forEach(v => {
            md += `- **${v.name || 'Unnamed'}** (Type: ${v.type || '?'})\n`; // Don't show value
        });
        md += "\n";
    }

    if (toggles.showModuleDetails && processedModules.length > 0) {
         md += "## Module Details\n\n";
         // Header row
         md += "| ID | Path / Module | Label | Connection |";
         if (toggles.showFilters) md += " Filter |";
         md += " Error Handler |\n";
         // Separator row
         md += "|---|---|---|---|";
         if (toggles.showFilters) md += "---|";
         md += "---|\n";

         // Data rows
         processedModules.forEach(m => {
             let pathDisplay = m.path.replace(/ > $/, '').replace(/\[Router (\d+)\]/g, 'R$1').replace(/\[Error Handler for (\d+)\]/g, 'Err$1');
             let moduleDesc = `${pathDisplay ? pathDisplay + ' → ' : ''} **${m.app}:${m.action}**`;
             let connectionDesc = m.connectionLabel !== 'N/A' ? `${m.connectionLabel} (${m.connectionType})` : '*None*';
             let filterDesc = '*None*';
             if (toggles.showFilters && m.filterConditions) {
                  filterDesc = `${m.filterName ? `*${m.filterName}*:<br/>` : ''}\`\`\`json\n${formatJson(m.filterConditions)}\n\`\`\``;
                  filterDesc = filterDesc.replace(/\|/g, '\\|'); // Escape pipes for markdown table
             }
             let errorDesc = m.errorHandler !== 'None' ? m.errorHandler : '*None*';

             md += `| ${m.id} | ${moduleDesc} | ${m.label || ''} | ${connectionDesc} |`;
             if (toggles.showFilters) md += ` ${filterDesc} |`;
             md += ` ${errorDesc} |\n`;
         });
    }

  return md;
}

function generatePlain() {
   let txt = `Blueprint Specification: ${blueprint?.name || 'Untitled'}\n`;
   txt += "===============================================\n";
   const meta = META_FIELDS.reduce((acc, id) => { acc[id] = document.getElementById(id).value; return acc; }, {});
   if (meta.preparedBy) txt += `Prepared By: ${meta.preparedBy}\n`;
   if (meta.recipient) txt += `Recipient: ${meta.recipient}\n`;
   if (meta.version) txt += `Version: ${meta.version}\n`;
   if (meta.objective) txt += `Objective: ${meta.objective}\n`;
   txt += "\n";

   const toggles = TOGGLE_FIELDS.reduce((acc, id) => { acc[id] = document.getElementById(id).checked; return acc; }, {});

    if (toggles.showScenario && blueprint?.metadata?.scenario) {
        txt += "## Scenario Details\n";
        const s = blueprint.metadata.scenario;
        txt += `- Type: ${blueprint.metadata.instant ? 'Instant (Webhook)' : 'Scheduled / On Demand'}\n`;
        txt += `- Sequential: ${s.sequential ? 'Yes' : 'No'}\n`;
        // Add other scenario details similarly...
        txt += "\n";
    }

    if (toggles.showConnections && blueprint?.connections?.length > 0) {
        txt += "## Connections Used\n";
        blueprint.connections.forEach(c => {
            txt += `- ${c.name || 'Unnamed'} (Type: ${c.type || '?'}, ID: ${c.id || '?'})\n`;
        });
        txt += "\n";
    }

    if (toggles.showVars && blueprint?.variables?.length > 0) {
        txt += "## Variables Defined\n";
         blueprint.variables.forEach(v => {
            txt += `- ${v.name || 'Unnamed'} (Type: ${v.type || '?'})\n`;
        });
        txt += "\n";
    }

    if (toggles.showModuleDetails && processedModules.length > 0) {
         txt += "## Module Details\n";
         processedModules.forEach(m => {
             let indent = '  '.repeat(m.level);
             let pathDisplay = m.path.replace(/ > $/, '').replace(/\[Router (\d+)\]/g, 'R$1').replace(/\[Error Handler for (\d+)\]/g, 'Err$1');
txt += `${indent}[${m.id}] ${pathDisplay ? pathDisplay + ' -> ' : ''}${m.app}:${m.action}\`;`;
             if (m.label) txt += ` (${m.label})`;
             txt += `\n`;
             if (m.connectionLabel !== 'N/A') txt += `${indent}  Connection: ${m.connectionLabel} (${m.connectionType})\n`;
             if (toggles.showFilters && m.filterConditions) {
                  txt += `${indent}  Filter: ${m.filterName || 'Unnamed'}\n${indent}    ${formatJson(m.filterConditions)}\n`;
             }
             if (m.errorHandler !== 'None') txt += `${indent}  Error Handler: ${m.errorHandler}\n`;
             txt += "\n"; // Add space between modules
         });
    }
  return txt;
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' }); // Ensure UTF-8
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Required for Firefox
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Initial Load ---
// Try to validate if there's content on load (e.g., from browser cache)
if (editor.getValue().trim()) {
    tryValidate();
}
