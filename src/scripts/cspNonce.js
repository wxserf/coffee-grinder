export function applyCspNonce() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const nonce = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  document.querySelectorAll('script:not([src])').forEach(script => {
    script.setAttribute('nonce', nonce);
  });
}

document.addEventListener('DOMContentLoaded', applyCspNonce);
