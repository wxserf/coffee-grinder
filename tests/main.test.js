const { sanitizeForHTML } = require('../src/scripts/utils');

describe('sanitizeForHTML (main)', () => {
  test('escapes HTML characters', () => {
    expect(sanitizeForHTML("<div>&\"'")).toBe('&lt;div&gt;&amp;&quot;&#039;');
  });

  test('returns empty string for nullish input', () => {
    expect(sanitizeForHTML(null)).toBe('');
  });
});
