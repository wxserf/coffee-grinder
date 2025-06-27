export function setupTableFilter(tableFilter) {
  tableFilter.oninput = () => {
    const q = tableFilter.value.toLowerCase().trim();
    const table = document.getElementById('modulesTable');
    if (!table) return;
    table.querySelectorAll('tbody tr').forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };
}

export function makeSortable(table) {
  if (table && window.sorttable) {
    sorttable.makeSortable(table);
  }
}
