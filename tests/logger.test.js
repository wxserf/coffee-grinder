const logger = require('../src/utils/logger');

describe('logger', () => {
  let spy;
  let output;

  beforeEach(() => {
    output = '';
    spy = jest.spyOn(process.stdout, 'write').mockImplementation(str => {
      output += str;
    });
    jest.useFakeTimers().setSystemTime(new Date('2020-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    spy.mockRestore();
    jest.useRealTimers();
  });

  ['debug', 'info', 'warn', 'error'].forEach(level => {
    test(`${level} outputs JSON line`, () => {
      logger[level]('message', { extra: 1 });
      const obj = JSON.parse(output);
      expect(obj.level).toBe(level);
      expect(obj.message).toBe('message');
      expect(obj.extra).toBe(1);
      expect(obj.timestamp).toBe('2020-01-01T00:00:00.000Z');
    });
  });
});
