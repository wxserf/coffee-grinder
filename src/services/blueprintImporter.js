const schema = require('../schemas/makeBlueprintSchema');

function basicValidate(obj) {
  if (!obj || typeof obj !== 'object') return false;
  if (typeof obj.name !== 'string') return false;
  if (!Array.isArray(obj.flow)) return false;
  return true;
}

function importBlueprint(jsonStr) {
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (e) {
    throw new Error('Invalid JSON');
  }
  if (!basicValidate(data)) {
    throw new Error('Data does not conform to basic schema');
  }
  return data;
}

module.exports = { importBlueprint, schema };
