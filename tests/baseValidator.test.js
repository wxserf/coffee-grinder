const createValidator = require('../src/validators/baseValidator');

test('returns Ajv instance with defaults', () => {
  const ajv = createValidator();
  expect(typeof ajv.validate).toBe('function');
  expect(ajv.opts.allErrors).toBe(true);
});
