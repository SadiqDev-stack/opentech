(async function () {
  await App.i18n.init();
  App.injectChrome();
  const container = document.getElementById('cartItems');
  const summary = document.getElementById('cartSummary');
  const subtotalEl = document.getElementById('cartSubtotal');
  const checkoutForm = document.getElementById('checkoutForm');
  let checkoutItems = [];

  function openCheckout(items) {
    if (!items.length) return App.notify.warning('Cart is empty');
    checkoutItems = items.map(item => ({ productId: item.id, quantity: item.qty }));
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    document.getElementById('checkoutItemCount').textContent = `${items.length} item(s)`;
    document.getElementById('checkoutTotal').textContent = App.naira(total);
    App.modal.open('checkoutModal');
  }

  function renderCart() {
    const items = App.cart.get();
    if (!items.length) {
      container.innerHTML = App.render.empty('fa-cart-shopping', 'Your cart is empty.');
      summary.classList.add('hidden');
      return;
    }
    const total = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0);
    container.innerHTML = items.map(item => `
      <article class="cart-row">
        <img class="cart-row__image" src="${App.render.escape(item.image)}" alt="${App.render.escape(item.name)}" />
        <div class="cart-row__details"><h2>${App.render.escape(item.name)}</h2><span class="text-gold font-bold">${App.naira(item.price)}</span></div>
        <div class="cart-row__quantity" aria-label="Quantity ${item.qty}">
          <button class="btn btn--ghost" aria-label="Decrease quantity" data-quantity="-1" data-item="${App.render.escape(item.id)}"><i class="fa-solid fa-minus"></i></button>
          <span>${item.qty}</span>
          <button class="btn btn--ghost" aria-label="Increase quantity" data-quantity="1" data-item="${App.render.escape(item.id)}"><i class="fa-solid fa-plus"></i></button>
        </div>
        <div class="cart-row__actions">
          <button class="btn btn--primary btn--sm" data-buy-item="${App.render.escape(item.id)}">Buy this</button>
          <button class="btn btn--outline btn--sm" aria-label="Remove ${App.render.escape(item.name)}" data-remove-item="${App.render.escape(item.id)}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </article>`).join('');
    subtotalEl.textContent = App.naira(total);
    summary.classList.remove('hidden');
  }

  container.addEventListener('click', event => {
    const quantity = event.target.closest('[data-quantity]');
    const remove = event.target.closest('[data-remove-item]');
    const buy = event.target.closest('[data-buy-item]');
    if (quantity) App.cart.updateQty(quantity.dataset.item, Number(quantity.dataset.quantity));
    if (remove) App.cart.remove(remove.dataset.removeItem);
    if (buy) {
      const item = App.cart.get().find(product => product.id === buy.dataset.buyItem);
      if (item) openCheckout([{ ...item, qty: 1 }]);
    }
    if (quantity || remove) renderCart();
  });

  window.checkoutAll = () => openCheckout(App.cart.get());
  checkoutForm.addEventListener('submit', async event => {
    event.preventDefault();
    await App.form.submit(checkoutForm, async data => {
      const result = await App.api.post('/orders/checkout', { ...data, items: checkoutItems });
      if (!result?.data?.authorization_url) throw new Error('Payment could not be started.');
      window.location.href = result.data.authorization_url;
    });
  });
  renderCart();
})();
