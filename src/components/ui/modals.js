function showError(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function showWarning(el, msg) {
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}

function clearError(el) {
  if (!el) return;
  el.textContent = '';
  el.style.display = 'none';
}

function clearAllErrors(elements) {
  if (!Array.isArray(elements)) return;
  elements.forEach(clearError);
}

module.exports = { showError, showWarning, clearError, clearAllErrors };
