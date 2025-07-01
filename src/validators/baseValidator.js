const AjvLib = typeof window === 'undefined' ? require('ajv') : window.Ajv;

function createValidator(options = {}) {
  const defaults = {
    allErrors: true,
    verbose: true,
    strict: false
  };
  return new AjvLib({ ...defaults, ...options });
}

module.exports = createValidator;
