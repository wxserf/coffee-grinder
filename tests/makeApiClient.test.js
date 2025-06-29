const { request, deployScenario } = require('../src/services/makeApiClient');

let originalFetch;

// Mock global fetch
beforeEach(() => {
  originalFetch = global.fetch;
  global.fetch = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;
});

test('request retries on failure then succeeds', async () => {
  const responses = [
    Promise.resolve({ ok: false, status: 500, text: () => Promise.resolve('err') }),
    Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true }) })
  ];
  global.fetch.mockImplementation(() => responses.shift());

  const data = await request('/ping');
  expect(data.ok).toBe(true);
  expect(fetch).toHaveBeenCalledTimes(2);
});

test('deployScenario sends auth header', async () => {
  global.fetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ id: 1 }) });
  const bp = { name: 'test', flow: [] };
  await deployScenario('token123', bp);
  const call = fetch.mock.calls[0];
  expect(call[0]).toContain('/scenarios');
  expect(call[1].headers.Authorization).toBe('Bearer token123');
});
