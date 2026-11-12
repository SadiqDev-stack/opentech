(async function () {
  await App.i18n.init(); App.injectChrome();

  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  const subtotalEl = document.getElementById('cartSubtotal');
  const totalEl = document.getElementById('cartTotal');

  function renderCart() {
    const items = App.cart.get();
    if (items.length === 0) {
      container.innerHTML = App.render.empty('fa-cart-shopping', 'Your cart is empty.');
      summary.classList.add('hidden');
      return;
    }

    let total = 0;
    container.innerHTML = items.map((item) => {
      total += item.price * item.qty;
      return `
      <div class="card" style="flex-direction:row; align-items:center; padding:12px; margin-bottom:12px; flex-wrap:wrap; gap:12px;">
        <img src="${item.image}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;" />
        <div style="flex:1; min-width:120px;">
          <h4 style="font-size:14px; margin-bottom:4px;">${App.render.escape(item.name)}</h4>
          <span class="text-gold font-bold">${App.naira(item.price)}</span>
        </div>
        
        <!-- Quantity Controls -->
        <div class="flex items-center gap-2" style="background:var(--color-black); border:1px solid var(--color-border); border-radius:var(--radius); padding:2px;">
          <button class="btn btn--ghost" style="padding:4px 8px;" onclick="updateQty('${item.id}', -1)"><i class="fa-solid fa-minus"></i></button>
          <span class="text-white font-bold" style="min-width:20px; text-align:center;">${item.qty}</span>
          <button class="btn btn--ghost" style="padding:4px 8px;" onclick="updateQty('${item.id}', 1)"><i class="fa-solid fa-plus"></i></button>
        </div>

        <!-- Buy This Item -->
        <button class="btn btn--primary btn--sm" onclick="App.notify.info('Direct checkout for this item opens soon')">Buy This</button>
        
        <button class="btn btn--outline btn--sm" onclick="removeItem('${item.id}')" style="color:var(--color-error-text); border-color:rgba(211,47,47,0.3);"><i class="fa-solid fa-trash"></i></button>
      </div>
      `;
    }).join('');

    subtotalEl.textContent = App.naira(total);
    totalEl.textContent = App.naira(total);
    summary.classList.remove('hidden');
  }

  window.updateQty = (id, delta) => {
    App.cart.updateQty(id, delta);
    renderCart();
  };

  window.removeItem = (id) => {
    App.cart.remove(id);
    renderCart();
    App.notify.info('Item removed');
  };

  renderCart();

  document.querySelector('a[href="/checkout"]').addEventListener('click', (e) => {
    e.preventDefault();
    App.notify.info('Checkout flow will be connected to Paystack in Stage 5.');
  });
})();
