const { formatJson, generateMarkdown } = require('../src/scripts/utils');

describe('formatJson', () => {
  test('pretty prints objects', () => {
    const obj = { a: 1 };
    expect(formatJson(obj)).toBe('{\n  "a": 1\n}');
  });

  test('handles circular structures gracefully', () => {
    const a = {};
    a.self = a;
    expect(formatJson(a)).toBe('{\n  "self": "[Circular]"\n}');
  });
});

describe('generateMarkdown', () => {
  const blueprint = {
    name: 'Test BP',
    metadata: { instant: true, scenario: { sequential: false } },
    connections: [ { name: 'HTTP', type: 'http', id: 1 } ],
    variables: [ { name: 'API', type: 'text' } ]
  };
  const processedModules = [
    { id: '1', path: '', app: 'http', action: 'request', label: 'Get', connectionLabel: 'HTTP', connectionType: 'http', filterConditions: null, filterName: '', errorHandler: 'None' }
  ];
  const meta = { preparedBy: 'Me', recipient: 'You', version: '1.0', objective: 'Demo' };
  const toggles = { showScenario: true, showConnections: true, showVars: true, showModuleDetails: true, showFilters: true };

  test('produces markdown with scenario and connection info', () => {
    const md = generateMarkdown({ blueprint, meta, toggles, processedModules });
    expect(md).toContain('# Blueprint Specification: Test BP');
    expect(md).toContain('**Prepared By:** Me');
    expect(md).toContain('## Scenario Details');
    expect(md).toContain('**HTTP** (Type: http, ID: 1)');
    expect(md).toContain('| 1 |');
  });
});
