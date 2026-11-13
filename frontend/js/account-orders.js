(async function () {
  const container = document.getElementById('accountContent');
  const ref = new URLSearchParams(window.location.search).get('verify');
  if (ref) {
    App.notify.info('Verifying payment...');
    try { await App.api.post('/orders/verify', { reference: ref }); App.notify.success('Payment confirmed!'); window.history.replaceState({}, '', '/account/orders'); } catch {}
  }
  try {
    const res = await App.api.get('/orders/mine');
    if (!res.data || res.data.length === 0) { container.innerHTML = App.render.empty('fa-receipt', 'No orders yet.'); return; }
    container.innerHTML = res.data.map(order => {
      const isPaid = order.paymentStatus === 'paid';
      return `
      <div class="card p-4 mb-4">
        <div class="flex justify-between items-center border-b border-surface-border pb-3 mb-3">
          <div><span class="text-muted text-xs block">Order ID</span><span class="font-bold text-white">#${order.orderNumber}</span></div>
          <span class="badge ${isPaid ? 'badge--success' : 'badge--muted'}">${order.paymentStatus.toUpperCase()}</span>
        </div>
        <p class="text-sm text-white mb-3">${order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</p>
        <div class="flex justify-between items-center p-3" style="background:var(--color-elevated); border-radius:8px; font-size:12px;">
          <div><span class="text-muted block">Total</span><span class="text-gold font-bold">${App.naira(order.totalAmount)}</span></div>
          <div><span class="text-muted block">Delivery</span><span class="text-white font-bold">${order.deliveryStatus.toUpperCase()}</span></div>
        </div>
      </div>`;
    }).join('');
  } catch (err) { container.innerHTML = App.render.empty('fa-exclamation-circle', 'Failed to load orders.'); }
})();
