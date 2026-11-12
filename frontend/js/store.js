(async function () {
  await App.i18n.init(); App.injectChrome();
  
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('productSearch');
  const checkoutForm = document.getElementById('checkoutForm');
  let page = 1;
  let allProducts = [];
  let hasMore = true;

  async function loadProducts(reset = false) {
    if (reset) { page = 1; allProducts = []; grid.innerHTML = ''; hasMore = true; }
    if (!hasMore) return;
    try {
      const res = await App.api.get(`/products?page=${page}&limit=9&search=${searchInput.value}`);
      if (res.data.length > 0) {
        allProducts = reset ? res.data : [...allProducts, ...res.data];
        renderProducts(allProducts);
        page++;
        hasMore = page <= res.meta.pages;
      } else { hasMore = false; }
    } catch (err) { grid.innerHTML = App.render.empty('fa-exclamation-triangle', 'Error'); }
  }

  function renderProducts(products) {
    grid.innerHTML = products.map(p => {
      const name = p.name[App.i18n.lang] || p.name.ha;
      const isOut = p.stock === 0;
      return `
      <article class="product-card">
        <div class="product-card__media" style="position:relative">
          <img src="${p.image}" alt="${name}" loading="lazy" />
          ${isOut ? '<span class="badge badge--error" style="position:absolute;top:8px;left:8px">Out of Stock</span>' : ''}
        </div>
        <h3 class="product-card__title">${name}</h3>
        <span class="product-card__price">${App.naira(p.price)}</span>
        <div class="product-card__actions">
          <button class="btn btn--outline" data-add="${p._id}" ${isOut ? 'disabled' : ''}><i class="fa-solid fa-cart-plus"></i> Add</button>
          <button class="btn btn--primary" data-buy="${p._id}" ${isOut ? 'disabled' : ''}>Buy</button>
        </div>
      </article>`;
    }).join('');

    document.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = allProducts.find(x => x._id === btn.dataset.add);
        if (p) App.cart.add({ id: p._id, name: p.name[App.i18n.lang] || p.name.ha, price: p.price, image: p.image });
      });
    });

    document.querySelectorAll('[data-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = allProducts.find(x => x._id === btn.dataset.buy);
        if (p) openCheckout([{ productId: p._id, quantity: 1 }], p.price);
      });
    });
  }

  function openCheckout(items, total) {
    document.getElementById('checkoutItemCount').textContent = `${items.length} item(s)`;
    document.getElementById('checkoutTotal').textContent = App.naira(total);
    App.modal.open('checkoutModal');
    window._currentCheckoutItems = items;
  }

  window.purchaseCart = () => {
    const cart = App.cart.get();
    if (cart.length === 0) return App.notify.warning('Cart is empty');
    const items = cart.map(c => ({ productId: c.id, quantity: c.qty }));
    const total = cart.reduce((sum, c) => sum + (c.price * c.qty), 0);
    openCheckout(items, total);
  };

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(checkoutForm, async (data) => {
      const res = await App.api.post('/orders/checkout', { ...data, items: window._currentCheckoutItems });
      window.location.href = res.data.authorization_url;
    });
  });

  searchInput.addEventListener('input', () => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => loadProducts(true), 300);
  });

  App.infiniteScroll(grid, () => loadProducts(false));
  loadProducts(true);
})();
