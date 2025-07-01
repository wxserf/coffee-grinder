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

  test('remaps connection ids when option provided', () => {
    const bp = {
      name: 'BP',
      connections: [{ id: 1, type: 'http' }],
      flow: [
        { id: '1', module: 'a', parameters: { __IMTCONN__: 1 } },
        {
          id: '2',
          module: 'b',
          routes: [
            { flow: [{ id: '3', module: 'c', parameters: { __IMTHOOK__: 1 } }] }
          ]
        }
      ]
    };
    const json = JSON.stringify(bp);
    const obj = importBlueprint(json, { remapConnections: { 1: 99 } });
    expect(obj.connections[0].id).toBe(99);
    expect(obj.flow[0].parameters.__IMTCONN__).toBe(99);
    expect(obj.flow[1].routes[0].flow[0].parameters.__IMTHOOK__).toBe(99);
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
