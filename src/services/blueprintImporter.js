const schema = require('../schemas/makeBlueprintSchema');
const createValidator = require('../validators/baseValidator');

const ajv = createValidator();
const validate = ajv.compile(schema);

function importBlueprint(jsonStr, options = {}) {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid JSON');
  }
  if (!validate(data)) {
    const err = new Error(
      'Data does not match schema: ' + ajv.errorsText(validate.errors)
    );
    err.validationErrors = validate.errors;
    throw err;
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
