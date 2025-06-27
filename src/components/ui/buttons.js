export function activateExportButtons(outArea, copyBtn, pdfBtn, mdBtn, txtBtn, {
  copyHandler,
  pdfHandler,
  mdHandler,
  txtHandler
}) {
  if (outArea.innerHTML.trim() !== '') {
    copyBtn.style.display = 'inline-block';
    pdfBtn.style.display = 'inline-block';
    mdBtn.style.display = 'inline-block';
    txtBtn.style.display = 'inline-block';
  }

  copyBtn.onclick = copyHandler;
  pdfBtn.onclick = pdfHandler;
  mdBtn.onclick = mdHandler;
  txtBtn.onclick = txtHandler;
}

export function generatePdf(outArea, blueprint, progressEl, showErr) {
  progressEl.textContent = 'Generating PDF...';
  const opt = {
    margin: 0.5,
    filename: `${blueprint?.name || 'blueprint'}_spec.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
  };
  html2pdf()
    .from(outArea)
    .set(opt)
    .save()
    .then(() => {
      progressEl.textContent = 'PDF generated.';
    })
    .catch(err => {
      progressEl.textContent = 'PDF generation failed.';
      showErr(`PDF Error: ${err}`);
    });
}

export function download(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
