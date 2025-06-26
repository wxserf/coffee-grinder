export function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

export function showWarning(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

export function clearError(el) {
  el.textContent = '';
  el.style.display = 'none';
}

export function clearAllErrors(...elements) {
  elements.forEach(el => clearError(el));
}
