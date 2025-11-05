// historial.js - loads history with infinite scroll
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('historyContainer');
  const sentinel = document.getElementById('infiniteSentinel');
  let page = 1;
  const limit = 10;
  let loading = false;
  let totalPages = null;

  async function loadPage() {
    if (loading) return;
    loading = true;
    const res = await fetch(`/api/history?page=${page}&limit=${limit}`);
    if (!res.ok) {
      container.innerHTML = '<div class="muted">No se pudo cargar el historial.</div>';
      return;
    }
    const j = await res.json();
    totalPages = j.totalPages;
    const items = j.results || [];
    if (items.length === 0 && page===1) container.innerHTML = '<div class="muted">No hay historial aún.</div>';
    items.forEach(it => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `<div><strong>${it.request.destination || it.request.snippet || 'Conversación'}</strong> <span class="muted">— ${new Date(it.timestamp).toLocaleString()}</span></div>
                       <div class="muted">Grupo: ${it.request.group || '—'}</div>
                       <div style="margin-top:8px">${it.response && it.response.summary ? it.response.summary : ''}</div>
                       <div style="margin-top:8px"><button class="btn delete" data-id="${it.id}">Eliminar</button></div>`;
      container.appendChild(div);
    });
    loading = false;
    page += 1;
    if (page > totalPages) observer.disconnect();
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) loadPage();
    });
  }, { rootMargin: '200px' });

  observer.observe(sentinel);

  // delete handler
  document.addEventListener('click', async (e) => {
    if (e.target.matches('.delete')) {
      const id = e.target.dataset.id;
      if (!confirm('¿Eliminar esta entrada?')) return;
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        e.target.closest('.card').remove();
      } else {
        alert('No se pudo eliminar.');
      }
    }
  });
});
