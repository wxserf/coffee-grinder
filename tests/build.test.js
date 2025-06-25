const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

describe('build script', () => {
  const dist = path.join(__dirname, '..', 'dist');
  const output = path.join(dist, 'coffee-grinder.html');

  afterAll(() => {
    if (fs.existsSync(output)) fs.unlinkSync(output);
    if (fs.existsSync(dist)) fs.rmdirSync(dist);
  });

  test('generates coffee-grinder.html', () => {
    if (fs.existsSync(output)) fs.unlinkSync(output);
    execFileSync('node', [path.join(__dirname, '..', 'build.js')]);
    expect(fs.existsSync(output)).toBe(true);
    const content = fs.readFileSync(output, 'utf8');
    expect(content).toContain('<style>');
    expect(content).toContain('function');
  });
});
