const { importBlueprint } = require('../src/services/blueprintImporter');
const { exportBlueprint } = require('../src/services/blueprintExporter');

describe('blueprintImporter', () => {
  test('parses valid blueprint JSON', () => {
    const json = '{"name":"BP","flow":[]}';
    const obj = importBlueprint(json);
    expect(obj).toEqual({ name: 'BP', flow: [] });
  });

  test('throws on invalid JSON', () => {
    expect(() => importBlueprint('not-json')).toThrow('Invalid JSON');
  });

  test('throws when required fields missing', () => {
    expect(() => importBlueprint('{"name":"bp"}')).toThrow('Data does not conform to basic schema');
  });
});

describe('blueprintExporter', () => {
  test('serializes blueprint object', () => {
    const obj = { name: 'BP', flow: [] };
    const json = exportBlueprint(obj);
    expect(JSON.parse(json)).toEqual(obj);
    expect(json).toContain('\n');
  });
});
