const { sanitizeForHTML, formatJson } = require('../src/scripts/worker');
describe('sanitizeForHTML', () => {
  test('escapes HTML characters', () => {
    expect(sanitizeForHTML("<div>&\"'")).toBe('&lt;div&gt;&amp;&quot;&#039;');
  });

  test('returns empty string for nullish input', () => {
    expect(sanitizeForHTML(null)).toBe('');
  });
});

describe('formatJson (worker)', () => {
  test('pretty prints objects', () => {
    const obj = { a: 1 };
    expect(formatJson(obj)).toBe('{\n  "a": 1\n}');
  });

  test('handles circular structures gracefully', () => {
    const a = {};
    a.self = a;
    expect(formatJson(a)).toBe('[Could not format JSON]');
  });
});
