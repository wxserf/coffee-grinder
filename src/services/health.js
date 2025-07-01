function getHealthStatus() {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { getHealthStatus };
}
