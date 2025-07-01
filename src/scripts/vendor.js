import Ajv from 'ajv';
import html2pdf from 'html2pdf.js';
// Expose libraries globally for existing code
if (typeof window !== 'undefined') {
  window.Ajv = Ajv;
  window.html2pdf = html2pdf;
}
export { Ajv, html2pdf };
