(async function () {
  const container = document.getElementById('accountContent');
  try {
    const res = await App.api.get('/innovations/requests/mine');
    if (!res.data || res.data.length === 0) { container.innerHTML = App.render.empty('fa-microchip', 'No requests yet.'); return; }
    container.innerHTML = res.data.map(req => `
      <div class="card p-4 mb-4">
        <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-3">
          <div><span class="text-muted text-xs block">Request ID</span><span class="font-bold text-white">#${req.requestNumber}</span></div>
          <span class="badge ${req.status === 'completed' ? 'badge--success' : req.status === 'cancelled' ? 'badge--error' : 'badge--gold'}">${req.status.toUpperCase()}</span>
        </div>
        <h3 class="font-bold text-white mb-1">${req.title}</h3>
        <p class="text-muted text-xs mb-3">${req.description}</p>
        <div class="flex justify-between items-center p-3" style="background:var(--color-elevated); border-radius:8px; font-size:12px;">
          <span class="text-muted">Budget: <strong class="text-white">${req.budget ? App.naira(req.budget) : 'N/A'}</strong></span>
          <span class="text-muted">${new Date(req.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');
  } catch (err) { container.innerHTML = App.render.empty('fa-exclamation-circle', 'Failed to load requests.'); }
})();
