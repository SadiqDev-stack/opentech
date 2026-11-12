(async function () {
  await App.i18n.init(); App.injectChrome();
  
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('productSearch');
  const checkoutForm = document.getElementById('checkoutForm');
  let allProducts = [];

  async function loadProducts(query = '') {
    grid.innerHTML = '<div class="skeleton skeleton--card"></div>';
    try {
      const res = await App.api.get(`/products?search=${query}`);
      allProducts = res.data || [];
      renderProducts(allProducts);
    } catch (err) {
      grid.innerHTML = App.render.empty('fa-exclamation-triangle', 'Error loading products');
    }
  }

  function renderProducts(products) {
    if (products.length === 0) {
      grid.innerHTML = App.render.empty('fa-store', 'No products found.');
      return;
    }
    grid.innerHTML = products.map(p => {
      const name = p.name[App.i18n.lang] || p.name.ha;
      const desc = p.description[App.i18n.lang] || p.description.ha;
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
          <button class="btn btn--outline" data-add="${p._id}" ${isOut ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus"></i> Add
          </button>
          <button class="btn btn--primary" data-buy="${p._id}" ${isOut ? 'disabled' : ''}>
            Buy Now
          </button>
        </div>
      </article>
      `;
    }).join('');

    // Bind buttons
    document.querySelectorAll('[data-add]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = allProducts.find(x => x._id === btn.dataset.add);
        if (p) {
          App.cart.add({
            id: p._id,
            name: p.name[App.i18n.lang] || p.name.ha,
            price: p.price,
            image: p.image
          });
        }
      });
    });

    document.querySelectorAll('[data-buy]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = allProducts.find(x => x._id === btn.dataset.buy);
        if (p) {
          openCheckout([{ productId: p._id, quantity: 1 }], p.price);
        }
      });
    });
  }

  function openCheckout(items, total) {
    document.getElementById('checkoutItemCount').textContent = `${items.length} item(s)`;
    document.getElementById('checkoutTotal').textContent = App.naira(total);
    App.modal.open('checkoutModal');
    
    // Store current cart in a temporary variable
    window._currentCheckoutItems = items;
  }

  // Handle "Purchase All" from cart
  window.purchaseCart = () => {
    const cart = App.cart.get();
    if (cart.length === 0) return App.notify.warning('Cart is empty');
    
    const items = cart.map(c => ({ productId: c.id, quantity: c.qty }));
    const total = cart.reduce((sum, c) => sum + (c.price * c.qty), 0);
    openCheckout(items, total);
  };

  checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const items = window._currentCheckoutItems;
    
    await App.form.submit(checkoutForm, async (data) => {
      const res = await App.api.post('/orders/checkout', { ...data, items });
      window.location.href = res.data.authorization_url;
    });
  });

  searchInput.addEventListener('input', (e) => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => loadProducts(e.target.value), 300);
  });

  loadProducts();
})();
