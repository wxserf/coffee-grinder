function handleError(message) {
  if (typeof window !== 'undefined' && typeof window.alert === 'function') {
    window.alert(message);
  } else {
    console.error(message);
  }
}

module.exports = { handleError };
