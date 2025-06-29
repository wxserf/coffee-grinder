function exportBlueprint(blueprint) {
  if (!blueprint || typeof blueprint !== 'object') {
    throw new Error('Invalid blueprint object');
  }
  return JSON.stringify(blueprint, null, 2);
}

module.exports = { exportBlueprint };
