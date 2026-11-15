(async function () {
  await App.i18n.init();
  App.injectChrome();
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('productSearch');
  const checkoutForm = document.getElementById('checkoutForm');
  let allProducts = [];
  let currentCheckoutItems = [];

  async function loadProducts(query = '') {
    if (!grid) return;
    grid.innerHTML = App.render.skeletonCards(3);
    try {
      const response = await App.api.get(`/products?search=${encodeURIComponent(query)}`);
      allProducts = response.data || [];
      renderProducts(allProducts);
    } catch (error) {
      grid.innerHTML = `<div class="catalog-error">${App.render.escape(error.message || 'Products could not load. Please try again.')}</div>`;
    }
  }

  function renderProducts(products) {
    if (!grid) return;
    if (!products.length) { grid.innerHTML = App.render.empty('fa-store', 'No products found.'); return; }
    grid.innerHTML = products.map(product => {
      const name = product.name[App.i18n.lang] || product.name.en || product.name.ha;
      const unavailable = Number(product.stock) < 1;
      return `<article class="product-card"><div class="product-card__media"><a href="/product/${encodeURIComponent(product.slug)}"><img src="${App.render.escape(product.image)}" alt="${App.render.escape(name)}" loading="lazy"></a>${unavailable ? '<span class="badge badge--error product-out-badge">Out of Stock</span>' : ''}</div><h2 class="product-card__title"><a href="/product/${encodeURIComponent(product.slug)}">${App.render.escape(name)}</a></h2><span class="product-card__price">${App.naira(product.price)}</span><div class="product-card__actions"><button class="btn btn--outline" data-add="${App.render.escape(product._id)}" ${unavailable ? 'disabled' : ''}><i class="fa-solid fa-cart-plus"></i> Add</button><button class="btn btn--primary" data-buy="${App.render.escape(product._id)}" ${unavailable ? 'disabled' : ''}>Buy Now</button></div></article>`;
    }).join('');
  }

  function openCheckout(items, total) {
    if (!items.length) return App.notify.warning('Cart is empty');
    currentCheckoutItems = items;
    document.getElementById('checkoutItemCount').textContent = `${items.length} item(s)`;
    document.getElementById('checkoutTotal').textContent = App.naira(total);
    App.modal.open('checkoutModal');
  }

  window.purchaseCart = () => {
    const cart = App.cart.get();
    openCheckout(cart.map(item => ({ productId: item.id, quantity: item.qty })), cart.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0));
  };

  grid?.addEventListener('click', event => {
    const add = event.target.closest('[data-add]');
    const buy = event.target.closest('[data-buy]');
    if (add) {
      const product = allProducts.find(item => item._id === add.dataset.add);
      if (product) App.cart.add({ id: product._id, name: product.name[App.i18n.lang] || product.name.en || product.name.ha, price: product.price, image: product.image });
    }
    if (buy) {
      const product = allProducts.find(item => item._id === buy.dataset.buy);
      if (product) openCheckout([{ productId: product._id, quantity: 1 }], product.price);
    }
  });

  checkoutForm?.addEventListener('submit', async event => {
    event.preventDefault();
    await App.form.submit(checkoutForm, async data => {
      if (!currentCheckoutItems.length) throw new Error('Your cart is empty.');
      const response = await App.api.post('/orders/checkout', { ...data, items: currentCheckoutItems });
      if (!response?.data?.authorization_url) throw new Error('Payment could not be started. Please try again.');
      window.location.href = response.data.authorization_url;
    });
  });

  searchInput?.addEventListener('input', event => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => loadProducts(event.target.value), 300);
  });

  await loadProducts();
  const params = new URLSearchParams(window.location.search);
  const requested = params.get('buy');
  if (requested) {
    let product = allProducts.find(item => item._id === requested || item.slug === requested);
    if (!product) {
      try { const response = await App.api.get(`/products/${encodeURIComponent(requested)}`); product = response.data; allProducts.push(product); }
      catch (error) { App.notify.error(error.message || 'This product could not be loaded.'); }
    }
    if (product && Number(product.stock) > 0) openCheckout([{ productId: product._id, quantity: 1 }], product.price);
    else if (product) App.notify.warning('This product is out of stock.');
  } else if (params.get('checkout') === 'true') window.purchaseCart();
  if (requested || params.has('checkout')) history.replaceState({}, document.title, window.location.pathname);
})();
