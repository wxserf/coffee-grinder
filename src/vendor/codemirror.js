// Placeholder for CodeMirror library in development
window.CodeMirror = {
  fromTextArea: function(el, opts) {
    console.warn('CodeMirror stub used.');
    return {
      getValue: () => el.value,
      setValue: v => { el.value = v; },
      on: () => {}
    };
  }
};
