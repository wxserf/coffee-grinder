function parse(str) {
  try {
    return JSON.parse(str);
  } catch (_) {
    throw new Error('Invalid JSON');
  }
}

function stringify(value, space) {
  const seen = new WeakSet();
  return JSON.stringify(
    value,
    (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);
      }
      return val;
    },
    space
  );
}

module.exports = { parse, stringify };
