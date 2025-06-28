module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  globals: {
    // CDN-loaded libraries
    'CodeMirror': 'readonly',
    'Ajv': 'readonly', 
    'html2pdf': 'readonly',
    'sorttable': 'readonly',
    'WORKER_CODE': 'readonly'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
    'prefer-const': 'error'
  }
};
