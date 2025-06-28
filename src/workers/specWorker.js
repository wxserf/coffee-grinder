let sanitizeForHTML, formatJson;

if (typeof module !== 'undefined' && module.exports) {
  ({ sanitizeForHTML, formatJson } = require('../scripts/utils'));
} else {
  sanitizeForHTML = str => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  formatJson = data => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (_) {
      return '[Could not format JSON]';
    }
  };
}

function processBlueprint(blueprint, toggles = {}) {
  const processedModules = [];
  const warnings = [];

  function findConnectionDetails(connId) {
      if (!blueprint.connections || !connId) return { type: 'N/A', label: 'N/A (No ID)' };
      const conn = blueprint.connections.find(c => c.id === connId);
      return conn ? { type: conn.type || '?', label: conn.name || '?' } : { type: '?', label: `Not Found (ID: ${connId})` };
  }

  function getModuleLabel(moduleData) {
      // Prioritize top-level label, then metadata label
      return moduleData.label || (moduleData.metadata && moduleData.metadata.label) || '';
  }

   function getConnectionInfo(moduleData) {
      let connLabel = 'N/A';
      let connType = 'N/A';
      let connId = null;

      // 1. Check parameters for __IMTCONN__ (most common)
      if (moduleData.parameters && moduleData.parameters.__IMTCONN__) {
          connId = moduleData.parameters.__IMTCONN__;
          // Try getting label from restore metadata first
          if (moduleData.metadata?.restore?.parameters?.__IMTCONN__?.label) {
              connLabel = moduleData.metadata.restore.parameters.__IMTCONN__.label;
          }
          const details = findConnectionDetails(connId, blueprint);
           connType = details.type;
           // If label wasn't in restore, use the one from connection list (or keep 'Not Found')
           if (connLabel === 'N/A' || connLabel.startsWith('Not Found')) {
              connLabel = details.label;
           }

      // 2. Check for __IMTHOOK__ (webhooks)
      } else if (moduleData.parameters && moduleData.parameters.__IMTHOOK__) {
          connType = 'Webhook'; // Assume type
          connId = moduleData.parameters.__IMTHOOK__;
           // Webhook labels are usually in restore metadata
           if (moduleData.metadata?.restore?.parameters?.__IMTHOOK__?.label) {
              connLabel = moduleData.metadata.restore.parameters.__IMTHOOK__.label;
           } else {
               connLabel = `Webhook (${connId})`; // Fallback label
           }

      // 3. Check metadata directly for connection (less common)
       } else if (moduleData.metadata?.connection) {
            connLabel = moduleData.metadata.connection.label || 'Unknown (Metadata)';
            connType = moduleData.metadata.connection.type || '? (Metadata)';
       }

       // Ensure N/A if no ID found
       if (connId === null && connLabel === 'N/A') {
           connType = 'N/A';
       } else if (connLabel === 'N/A') {
          // If we have an ID but no label found anywhere
          connLabel = `ID: ${connId || '?'}`;
       }


      return { type: connType, label: connLabel };
  }

  function getFilterDetails(moduleData) {
      if (!moduleData.filter) return { name: '', conditions: null };
      return {
          name: moduleData.filter.name || '',
          conditions: moduleData.filter.conditions || null
      };
  }

   function getErrorHandlerType(moduleData) {
       if (!moduleData.onerror || moduleData.onerror.length === 0) return 'None';
       // Simple check for common directives - more complex logic could be added
       const firstHandler = moduleData.onerror[0];
       if (!firstHandler || !firstHandler.module) return 'Custom/Unknown';
       if (firstHandler.module === 'builtin:Break') return 'Break (Retry/Fail)';
       if (firstHandler.module === 'builtin:Resume') return 'Resume (Ignore)';
       if (firstHandler.module === 'builtin:Commit') return 'Commit';
       if (firstHandler.module === 'builtin:Rollback') return 'Rollback';
       return 'Custom (' + (firstHandler.label || firstHandler.module) + ')';
   }


  // Recursive function to process modules
  function processModules(moduleList, pathPrefix = '', level = 0) {
      if (!moduleList || !Array.isArray(moduleList)) {
           warnings.push(`Invalid module list encountered at path: ${pathPrefix || 'root'}`);
           return;
      }

      moduleList.forEach((mod, index) => {
          if (!mod || typeof mod !== 'object' || !mod.id) {
              warnings.push(`Skipping invalid module data at index ${index}, path: ${pathPrefix || 'root'}`);
              return; // Skip invalid module entries
          }

          const moduleParts = (mod.module || 'unknown:unknown').split(':');
          const app = moduleParts[0];
          const action = moduleParts[1] || 'unknown';
          const connection = getConnectionInfo(mod, blueprint);
          const filter = getFilterDetails(mod);
          const errorHandlerType = getErrorHandlerType(mod);
          const label = getModuleLabel(mod);

          processedModules.push({
              id: mod.id,
              app: app,
              action: action,
              label: label,
              connectionType: connection.type,
              connectionLabel: connection.label,
              filterName: filter.name,
              filterConditions: filter.conditions,
              errorHandler: errorHandlerType,
              path: pathPrefix,
              level: level,
              hasRoutes: mod.routes && mod.routes.length > 0,
              hasErrorHandlerModules: mod.onerror && mod.onerror.length > 0
          });

          // Recurse for Routers
          if (mod.routes && mod.routes.length > 0) {
            mod.routes.forEach((route, routeIndex) => {
                const routePath = `${pathPrefix}[Router ${mod.id}] Path ${routeIndex + 1}`;
                  // Add a pseudo-module entry for the path itself? Maybe not, keep it clean.
                  // Process modules within this route's flow
                  processModules(route.flow, routePath + ' > ', level + 1);
              });
          }

          // Recurse for Error Handlers
          if (mod.onerror && mod.onerror.length > 0) {
               const errorPath = `${pathPrefix}[Error Handler for ${mod.id}]`;
               // Process modules within the error handler
               processModules(mod.onerror, errorPath + ' > ', level + 1);
          }
      });
  }

  // Start processing from the top-level flow
  processModules(blueprint.flow);

  // --- Generate HTML Output ---
  let html = '';

  // Scenario Details Panel
  if (toggles.showScenario) {
    html += '<div class="panel"><h3>Scenario Details</h3>';
    html += `<p><strong>Name:</strong> ${sanitizeForHTML(blueprint.name)}</p>`;
    if (blueprint.metadata && blueprint.metadata.scenario) {
        const s = blueprint.metadata.scenario;
        html += `<p><strong>Type:</strong> ${blueprint.metadata.instant ? 'Instant (Webhook)' : 'Scheduled / On Demand'}</p>`;
        html += `<p><strong>Sequential:</strong> ${s.sequential ? 'Yes' : 'No'}`;
        html += `<p><strong>Max Errors:</strong> ${s.maxErrors ?? 'Default'}`;
        html += `<p><strong>Auto Commit:</strong> ${s.autoCommit ? 'Yes' : 'No'}`;
        if(s.autoCommitTriggerLast !== undefined) html += `<p><strong>Commit on Last Trigger:</strong> ${s.autoCommitTriggerLast ? 'Yes' : 'No'}`;
        if(s.confidential !== undefined) html += `<p><strong>Confidential:</strong> ${s.confidential ? 'Yes' : 'No'}`;
        if(s.dataloss !== undefined) html += `<p><strong>Data Loss Risk:</strong> ${s.dataloss ? 'Yes' : 'No'}`;
        if(s.dlq !== undefined) html += `<p><strong>DLQ Enabled:</strong> ${s.dlq ? 'Yes' : 'No'}`;
    } else {
        html += '<p><em>Scenario metadata details not found or incomplete.</em></p>';
    }
    html += '</div>';
  }

  // Connections Panel
  if (toggles.showConnections && blueprint.connections && blueprint.connections.length > 0) {
      html += '<div class="panel"><h3>Connections Used</h3><ul>';
      blueprint.connections.forEach(c => {
           html += `<li><strong>${sanitizeForHTML(c.name || 'Unnamed')}</strong> (Type: ${sanitizeForHTML(c.type || '?')}, ID: ${c.id || '?'})</li>`;
      });
      html += '</ul></div>';
  } else if (toggles.showConnections) {
       html += '<div class="panel"><h3>Connections Used</h3><p><em>No top-level connections defined in the blueprint.</em></p></div>';
  }

  // Variables Panel
  if (toggles.showVars && blueprint.variables && blueprint.variables.length > 0) {
      html += '<div class="panel"><h3>Variables Defined</h3><ul>';
      blueprint.variables.forEach(v => {
          html += `<li><strong>${sanitizeForHTML(v.name || 'Unnamed')}</strong> (Type: ${sanitizeForHTML(v.type || '?')}, Value: ${v.value ? '******' : 'Not Set'})</li>`; // Obscure value
      });
      html += '</ul></div>';
  } else if (toggles.showVars) {
      html += '<div class="panel"><h3>Variables Defined</h3><p><em>No top-level variables defined in the blueprint.</em></p></div>';
  }

  // Module Details Table
  if (toggles.showModuleDetails && processedModules.length > 0) {
      html += '<div class="panel"><h3>Module Details</h3>';
      html += '<table id="modulesTable" class="sortable"><thead><tr>'; // Added sortable class
      html += '<th>ID</th>';
      html += '<th>Module / Path</th>';
      html += '<th>Label</th>';
      html += '<th>Connection</th>';
      if (toggles.showFilters) html += '<th>Filter</th>';
      html += '<th>Error Handler</th>';
      html += '</tr></thead><tbody>';

      processedModules.forEach(m => {
          html += '<tr>';
          html += `<td>${m.id}</td>`;

          // Module / Path cell with indentation
          let pathDisplay = sanitizeForHTML(m.path);
          // Clean up path display a bit
          pathDisplay = pathDisplay.replace(/ > $/, '').replace(/\[Router (\d+)\]/g, 'R$1').replace(/\[Error Handler for (\d+)\]/g, 'Err$1');
           html += `<td class="path-cell indent-${m.level}">`;
           if (pathDisplay) html += `<span style="color:var(--muted); font-size:0.9em;">${pathDisplay} &rarr; </span>`;
           html += `<strong>${sanitizeForHTML(m.app)}:${sanitizeForHTML(m.action)}</strong></td>`;


          html += `<td>${sanitizeForHTML(m.label)}</td>`;
          html += `<td>${m.connectionLabel !== 'N/A' ? `${sanitizeForHTML(m.connectionLabel)} <span style="color:var(--muted); font-size:0.9em;">(${sanitizeForHTML(m.connectionType)})</span>` : '<em>None</em>'}</td>`;

           if (toggles.showFilters) {
               html += '<td>';
               if (m.filterConditions) {
                   html += sanitizeForHTML(m.filterName) ? `<em>${sanitizeForHTML(m.filterName)}:</em><br/>` : '';
                   html += `<pre>${sanitizeForHTML(formatJson(m.filterConditions))}</pre>`;
               } else {
                   html += '<em>None</em>';
               }
               html += '</td>';
           }

           html += `<td>${m.errorHandler !== 'None' ? sanitizeForHTML(m.errorHandler) : '<em>None</em>'}</td>`;

          html += '</tr>';
      });
      html += '</tbody></table>';
      html += '</div>'; // Close panel
  } else if (toggles.showModuleDetails) {
       html += '<div class="panel"><h3>Module Details</h3><p><em>No modules found or processed in the blueprint flow.</em></p></div>';
  }

  return { html: html, warnings: warnings, processedModules: processedModules };
}

if (typeof self !== 'undefined') {
  self.onmessage = e => {
    const { blueprint, toggles } = e.data;
    postMessage(processBlueprint(blueprint, toggles));
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { sanitizeForHTML, formatJson, processBlueprint };
}
