(async function () {
  await App.i18n.init(); App.injectChrome();
  const slug = window.location.pathname.split('/').pop();
  const container = document.getElementById('detailContainer');

  try {
    const res = await App.api.get(`/products/${slug}`);
    const product = res.data;
    const name = product.name[App.i18n.lang] || product.name.ha;
    const desc = product.description[App.i18n.lang] || product.description.ha;

    container.innerHTML = `
      <img src="${product.image}" style="width:100%; height:400px; object-fit:cover; border-radius:var(--radius-xl);" />
      <div class="mt-2">
        <h1 class="section__title" style="font-size:28px; margin-bottom:8px;">${name}</h1>
        <span class="badge ${product.stock > 0 ? 'badge--success' : 'badge--error'} mb-4">${product.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
        <p class="text-muted" style="font-size:15px; line-height:1.6; margin-bottom:24px;">${desc}</p>
        <div class="card" style="padding:24px; flex-direction:row; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <span class="text-muted" style="font-size:12px; display:block;">Price</span>
            <span class="text-gold font-bold" style="font-size:24px;">${App.naira(product.price)}</span>
          </div>
          <div class="flex gap-2" style="flex-wrap:wrap;">
            <button class="btn btn--outline btn--lg" onclick="App.cart.add({id:'${product._id}', name:'${name}', price:${product.price}, image:'${product.image}'})" ${product.stock === 0 ? 'disabled' : ''}>
              <i class="fa-solid fa-cart-plus"></i> Add to Cart
            </button>
            <a href="/store" class="btn btn--primary btn--lg">Buy Now</a>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = App.render.empty('fa-exclamation-circle', 'Product not found');
  }
})();
