(async function () {
  await App.i18n.init();
  App.injectChrome();
  const slug = window.location.pathname.split('/').pop();
  const container = document.getElementById('detailContainer');
  try {
    const response = await App.api.get(`/products/${encodeURIComponent(slug)}`);
    const product = response.data;
    const name = product.name[App.i18n.lang] || product.name.en || product.name.ha;
    const description = product.description[App.i18n.lang] || product.description.en || product.description.ha;
    const unavailable = Number(product.stock) < 1;
    container.innerHTML = `<img class="detail-image" src="${App.render.escape(product.image)}" alt="${App.render.escape(name)}"><div class="mt-2"><h1 class="section__title detail-title">${App.render.escape(name)}</h1><span class="badge ${unavailable ? 'badge--error' : 'badge--success'} mb-4">${unavailable ? 'Out of Stock' : 'In Stock'}</span><p class="text-muted detail-description">${App.render.escape(description)}</p><div class="card detail-purchase"><div><span class="text-muted text-xs block">Price</span><span class="text-gold font-bold detail-price">${App.naira(product.price)}</span></div><div class="flex gap-2 detail-actions"><button id="addProductToCart" class="btn btn--outline btn--lg" ${unavailable ? 'disabled' : ''}><i class="fa-solid fa-cart-plus"></i> Add to Cart</button><a class="btn btn--primary btn--lg ${unavailable ? 'is-disabled' : ''}" href="/store?buy=${encodeURIComponent(product._id)}" ${unavailable ? 'aria-disabled="true" tabindex="-1"' : ''}>Buy Now</a></div></div>${App.shareButtons(window.location.pathname, name)}</div>`;
    document.getElementById('addProductToCart')?.addEventListener('click', () => App.cart.add({ id: product._id, name, price: product.price, image: product.image }));
  } catch (error) { container.innerHTML = App.render.empty('fa-exclamation-circle', App.render.escape(error.message || 'Product not found')); }
})();
