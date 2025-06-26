function initFilter(filterInput) {
  if (!filterInput) return;
  filterInput.oninput = () => {
    const q = filterInput.value.toLowerCase().trim();
    const table = document.getElementById('modulesTable');
    if (!table) return;
    table.querySelectorAll('tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };
}

function makeSortable(table) {
  if (table && typeof sorttable !== 'undefined') {
    sorttable.makeSortable(table);
  }
}

module.exports = { initFilter, makeSortable };
