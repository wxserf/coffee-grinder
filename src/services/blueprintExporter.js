const { stringify } = require('../utils/jsonProcessor');

function exportBlueprint(blueprint) {
  if (!blueprint || typeof blueprint !== 'object') {
    throw new Error('Invalid blueprint object');
  }
  return stringify(blueprint, 2);
}

module.exports = { exportBlueprint };
