let DOMPurify = null;
if (typeof window !== 'undefined' && window.DOMPurify) {
  DOMPurify = window.DOMPurify;
}

function sanitizeForHTML(str) {
  if (!str) return '';
  if (DOMPurify) {
    return DOMPurify.sanitize(String(str), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const { stringify } = require('./jsonProcessor');

function formatJson(data) {
  try {
    return stringify(data, 2);
  } catch (e) {
    return '[Could not format JSON]';
  }
}

function generateMarkdown({ blueprint = {}, meta = {}, toggles = {}, processedModules = [] }) {
  let md = `# Blueprint Specification: ${blueprint?.name || 'Untitled'}\n\n`;
  if (meta.preparedBy) md += `**Prepared By:** ${meta.preparedBy}\n`;
  if (meta.recipient) md += `**Recipient:** ${meta.recipient}\n`;
  if (meta.version) md += `**Version:** ${meta.version}\n`;
  if (meta.objective) md += `**Objective:** ${meta.objective}\n`;
  md += "\n";

  if (toggles.showScenario && blueprint?.metadata?.scenario) {
    const s = blueprint.metadata.scenario;
    md += '## Scenario Details\n';
    md += `- **Type:** ${blueprint.metadata.instant ? 'Instant (Webhook)' : 'Scheduled / On Demand'}\n`;
    md += `- **Sequential:** ${s.sequential ? 'Yes' : 'No'}\n`;
    md += "\n";
  }

  if (toggles.showConnections && Array.isArray(blueprint.connections) && blueprint.connections.length > 0) {
    md += '## Connections Used\n';
    blueprint.connections.forEach(c => {
      md += `- **${c.name || 'Unnamed'}** (Type: ${c.type || '?'}, ID: ${c.id || '?'})\n`;
    });
    md += "\n";
  }

  if (toggles.showVars && Array.isArray(blueprint.variables) && blueprint.variables.length > 0) {
    md += '## Variables Defined\n';
    blueprint.variables.forEach(v => {
      md += `- **${v.name || 'Unnamed'}** (Type: ${v.type || '?'})\n`;
    });
    md += "\n";
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
      const pathDisplay = (m.path || '').replace(/ > $/, '').replace(/\[Router (\d+)\]/g, 'R$1').replace(/\[Error Handler for (\d+)\]/g, 'Err$1');
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

module.exports = { sanitizeForHTML, formatJson, generateMarkdown };
