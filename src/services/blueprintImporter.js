const schema = require('../schemas/makeBlueprintSchema');

function basicValidate(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.name !== 'string') return false;
  if (!Array.isArray(obj.flow)) return false;
  return true;
}

function importBlueprint(jsonStr, options = {}) {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid JSON');
  }
  if (!basicValidate(data)) {
    throw new Error('Data does not conform to basic schema');
  }
  if (options.remapConnections && typeof options.remapConnections === 'object') {
    const map = options.remapConnections;

    if (Array.isArray(data.connections)) {
      data.connections.forEach(conn => {
        if (Object.prototype.hasOwnProperty.call(map, conn.id)) {
          conn.id = map[conn.id];
        }
      });
    }

    const walk = flow => {
      if (!Array.isArray(flow)) return;
      flow.forEach(mod => {
        if (mod.parameters) {
          if (
            Object.prototype.hasOwnProperty.call(
              map,
              mod.parameters.__IMTCONN__
            )
          ) {
            mod.parameters.__IMTCONN__ = map[mod.parameters.__IMTCONN__];
          }
          if (
            Object.prototype.hasOwnProperty.call(
              map,
              mod.parameters.__IMTHOOK__
            )
          ) {
            mod.parameters.__IMTHOOK__ = map[mod.parameters.__IMTHOOK__];
          }
        }
        if (Array.isArray(mod.routes)) {
          mod.routes.forEach(route => walk(route.flow));
        }
        if (Array.isArray(mod.onerror)) {
          walk(mod.onerror);
        }
      });
    };

    walk(data.flow);
  }

  return data;
}

module.exports = { importBlueprint, schema };
