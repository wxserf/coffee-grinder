// Basic client for Make.com API interactions
// Uses global fetch (Node 18+) with retry logic.
// Not production-ready; meant as a starting point for Make integration.

const DEFAULT_RETRIES = 3;
const BASE_URL = 'https://api.make.com/v2';
const { stringify } = require('../utils/jsonProcessor');

async function request(path, options = {}, retries = DEFAULT_RETRIES) {
  const url = `${BASE_URL}${path}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (!res.ok) {
        const text = await res.text();
        const err = new Error(`Request failed: ${res.status}`);
        err.status = res.status;
        err.body = text;
        throw err;
      }
      return res.json();
    } catch (err) {
      if (attempt === retries) throw err;
      // simple exponential backoff
      const wait = 2 ** attempt * 100;
      await new Promise(r => setTimeout(r, wait));
    }
  }
}

async function deployScenario(token, blueprint) {
  if (!token) throw new Error('Missing API token');
  if (!blueprint) throw new Error('Missing blueprint data');
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: stringify(blueprint)
  };
  return request('/scenarios', options);
}

module.exports = { request, deployScenario };
