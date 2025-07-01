module.exports = {
  forbidden: [
    {
      name: 'no-utils-to-components',
      comment: 'utils must not depend on components',
      severity: 'error',
      from: { path: '^src/utils' },
      to: { path: '^src/components' }
    }
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: 'node_modules'
  }
};
