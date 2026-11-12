(async function () {
  await App.i18n.init();
  App.injectChrome();

  const mockProducts = [
    { _id: 'p1', name: { ha: 'ESP32 IoT Module Kit', en: 'ESP32 IoT Module Kit' }, description: { ha: 'Relay module da Wi-Fi.', en: 'Relay and Wi-Fi module.' }, price: 14500, image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=70', stock: 45 },
    { _id: 'p2', name: { ha: 'MPPT Solar Controller 30A', en: 'MPPT Solar Controller 30A' }, description: { ha: 'Kariya ga batir da caji.', en: 'Battery protection.' }, price: 24000, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=70', stock: 12 },
    { _id: 'p3', name: { ha: 'Digital Multimeter', en: 'Digital Multimeter' }, description: { ha: 'Kayan gwajin voltage.', en: 'Voltage testing tool.' }, price: 12500, image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=70', stock: 0 }
  ];

  const lang = App.i18n.lang;
  const t = (obj) => obj[lang] || obj.ha;
  const grid = document.getElementById('productsGrid');
  const searchInput = document.getElementById('productSearchInput');

  function render(products) {
    if (products.length === 0) {
      grid.innerHTML = App.render.empty('fa-store', 'No products found.');
      return;
    }
    grid.innerHTML = products.map((p) => {
      const isOut = p.stock === 0;
      return `
      <article class="product-card">
        <div class="product-card__media">
          <img src="${p.image}" alt="${App.render.escape(t(p.name))}" loading="lazy" />
          ${isOut ? '<span class="badge badge--error" style="position:absolute;top:8px;left:8px">Out of Stock</span>' : ''}
        </div>
        <h3 class="product-card__title">${App.render.escape(t(p.name))}</h3>
        <span class="product-card__price">${App.naira(p.price)}</span>
        <div class="product-card__actions">
          <button class="btn btn--outline" onclick="App.cart.add({id:'${p._id}', name:'${App.render.escape(t(p.name))}', price:${p.price}, image:'${p.image}'})" ${isOut ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus"></i>${App.i18n.t('add_to_cart_btn')}
          </button>
          <button class="btn btn--primary" onclick="App.notify.info('Checkout opens soon')" ${isOut ? 'disabled' : ''}>
            ${App.i18n.t('buy_now_btn')}
          </button>
        </div>
      </article>
      `;
    }).join('');
  }

  render(mockProducts);

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = mockProducts.filter(p => 
      t(p.name).toLowerCase().includes(q) || t(p.description).toLowerCase().includes(q)
    );
    render(filtered);
  });

  window.addEventListener('langChanged', () => render(mockProducts));
})();
