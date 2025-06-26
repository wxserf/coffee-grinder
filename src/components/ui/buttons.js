function persistFields(fields) {
  fields.forEach(id => {
    const el = document.getElementById(id);
    el.value = localStorage.getItem(id) || '';
    el.addEventListener('input', () => localStorage.setItem(id, el.value));
  });
}

function persistToggles(toggles, defaults, regenerate) {
  toggles.forEach(id => {
    const el = document.getElementById(id);
    const storedValue = localStorage.getItem(`toggle_${id}`);
    el.checked = storedValue !== null ? storedValue === 'true' : defaults[id];
    el.addEventListener('change', () => {
      localStorage.setItem(`toggle_${id}`, el.checked);
      if (typeof regenerate === 'function') regenerate();
    });
  });
}

function setupExportButtons({ copyBtn, pdfBtn, mdBtn, txtBtn }, handlers) {
  if (!copyBtn || !pdfBtn || !mdBtn || !txtBtn) return;
  const { generatePdf, generateMarkdown, generatePlain, download } = handlers;
  copyBtn.onclick = () => navigator.clipboard.writeText(generatePlain());
  pdfBtn.onclick = generatePdf;
  mdBtn.onclick = () => download('spec.md', generateMarkdown());
  txtBtn.onclick = () => download('spec.txt', generatePlain());
}

function toggleExportButtons(buttons, show) {
  buttons.forEach(btn => {
    btn.style.display = show ? 'inline-block' : 'none';
  });
}

module.exports = {
  persistFields,
  persistToggles,
  setupExportButtons,
  toggleExportButtons,
};

function generatePdf(outArea, blueprint, progressEl, showErr) {
  progressEl.textContent = 'Generating PDF...';
  const opt = {
    margin: 0.5,
    filename: `${blueprint?.name || 'blueprint'}_spec.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' },
  };
  return html2pdf()
    .from(outArea)
    .set(opt)
    .save()
    .then(() => {
      progressEl.textContent = 'PDF generated.';
    })
    .catch(err => {
      progressEl.textContent = 'PDF generation failed.';
      if (showErr) showErr(`PDF Error: ${err}`);
    });
}

function generateMarkdown({ blueprint, meta, toggles, processedModules, formatJson }) {
  let md = `# Blueprint Specification: ${blueprint?.name || 'Untitled'}\n\n`;
  if (meta.preparedBy) md += `**Prepared By:** ${meta.preparedBy}\n`;
  if (meta.recipient) md += `**Recipient:** ${meta.recipient}\n`;
  if (meta.version) md += `**Version:** ${meta.version}\n`;
  if (meta.objective) md += `**Objective:** ${meta.objective}\n`;
  md += '\n';

  if (toggles.showScenario && blueprint?.metadata?.scenario) {
    const s = blueprint.metadata.scenario;
    md += '## Scenario Details\n';
    md += `- **Type:** ${blueprint.metadata.instant ? 'Instant (Webhook)' : 'Scheduled / On Demand'}\n`;
    md += `- **Sequential:** ${s.sequential ? 'Yes' : 'No'}\n`;
    md += '\n';
  }

  if (toggles.showConnections && blueprint?.connections?.length > 0) {
    md += '## Connections Used\n';
    blueprint.connections.forEach(c => {
      md += `- **${c.name || 'Unnamed'}** (Type: ${c.type || '?'}, ID: ${c.id || '?'})\n`;
    });
    md += '\n';
  }

  if (toggles.showVars && blueprint?.variables?.length > 0) {
    md += '## Variables Defined\n';
    blueprint.variables.forEach(v => {
      md += `- **${v.name || 'Unnamed'}** (Type: ${v.type || '?'})\n`;
    });
    md += '\n';
  }

  if (toggles.showModuleDetails && processedModules.length > 0) {
    md += '## Module Details\n\n';
    md += '| ID | Path / Module | Label | Connection |';
    if (toggles.showFilters) md += ' Filter |';
    md += ' Error Handler |\n';
    md += '|---|---|---|---|';
    if (toggles.showFilters) md += '---|';
    md += '---|\n';
    processedModules.forEach(m => {
      let pathDisplay = m.path.replace(/ > $/, '').replace(/\[Router (\d+)\]/g, 'R$1').replace(/\[Error Handler for (\d+)\]/g, 'Err$1');
      const moduleDesc = `${pathDisplay ? pathDisplay + ' \u2192 ' : ''} **${m.app}:${m.action}**`;
      const connectionDesc = m.connectionLabel !== 'N/A' ? `${m.connectionLabel} (${m.connectionType})` : '*None*';
      let filterDesc = '*None*';
      if (toggles.showFilters && m.filterConditions) {
        filterDesc = `${m.filterName ? `*${m.filterName}*:<br/>` : ''}\`\`\`json\n${formatJson(m.filterConditions)}\n\`\`\``;
        filterDesc = filterDesc.replace(/\|/g, '\\|');
      }
      const errorDesc = m.errorHandler !== 'None' ? m.errorHandler : '*None*';
      md += `| ${m.id} | ${moduleDesc} | ${m.label || ''} | ${connectionDesc} |`;
      if (toggles.showFilters) md += ` ${filterDesc} |`;
      md += ` ${errorDesc} |\n`;
    });
  }
  return md;
}

function generatePlain({ blueprint, meta, toggles, processedModules, formatJson }) {
  let txt = `Blueprint Specification: ${blueprint?.name || 'Untitled'}\n`;
  txt += '===============================================\n';
  if (meta.preparedBy) txt += `Prepared By: ${meta.preparedBy}\n`;
  if (meta.recipient) txt += `Recipient: ${meta.recipient}\n`;
  if (meta.version) txt += `Version: ${meta.version}\n`;
  if (meta.objective) txt += `Objective: ${meta.objective}\n`;
  txt += '\n';

  if (toggles.showScenario && blueprint?.metadata?.scenario) {
    const s = blueprint.metadata.scenario;
    txt += '## Scenario Details\n';
    txt += `- Type: ${blueprint.metadata.instant ? 'Instant (Webhook)' : 'Scheduled / On Demand'}\n`;
    txt += `- Sequential: ${s.sequential ? 'Yes' : 'No'}\n`;
    txt += '\n';
  }

  if (toggles.showConnections && blueprint?.connections?.length > 0) {
    txt += '## Connections Used\n';
    blueprint.connections.forEach(c => {
      txt += `- ${c.name || 'Unnamed'} (Type: ${c.type || '?'}, ID: ${c.id || '?'})\n`;
    });
    txt += '\n';
  }

  if (toggles.showVars && blueprint?.variables?.length > 0) {
    txt += '## Variables Defined\n';
    blueprint.variables.forEach(v => {
      txt += `- ${v.name || 'Unnamed'} (Type: ${v.type || '?'})\n`;
    });
    txt += '\n';
  }

  if (toggles.showModuleDetails && processedModules.length > 0) {
    txt += '## Module Details\n';
    processedModules.forEach(m => {
      let indent = '  '.repeat(m.level);
      let pathDisplay = m.path.replace(/ > $/, '').replace(/\[Router (\d+)\]/g, 'R$1').replace(/\[Error Handler for (\d+)\]/g, 'Err$1');
      txt += `${indent}[${m.id}] ${pathDisplay ? pathDisplay + ' -> ' : ''}${m.app}:${m.action}`;
      if (m.label) txt += ` (${m.label})`;
      txt += `\n`;
      if (m.connectionLabel !== 'N/A') txt += `${indent}  Connection: ${m.connectionLabel} (${m.connectionType})\n`;
      if (toggles.showFilters && m.filterConditions) {
        txt += `${indent}  Filter: ${m.filterName || 'Unnamed'}\n${indent}    ${formatJson(m.filterConditions)}\n`;
      }
      if (m.errorHandler !== 'None') txt += `${indent}  Error Handler: ${m.errorHandler}\n`;
      txt += '\n';
    });
  }
  return txt;
}

function download(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

module.exports.generatePdf = generatePdf;
module.exports.generateMarkdown = generateMarkdown;
module.exports.generatePlain = generatePlain;
module.exports.download = download;
