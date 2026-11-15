(async function () {
  await App.i18n.init();
  App.injectChrome();
  const lang = App.i18n.lang;
  const text = value => typeof value === 'string' ? value : value?.[lang] || value?.en || value?.ha || '';
  const fields = [
    { endpoint: '/courses?limit=3', target: 'featuredCourses', kind: 'course' },
    { endpoint: '/products?limit=6', target: 'featuredProducts', kind: 'product' },
    { endpoint: '/innovations?limit=3', target: 'featuredInnovations', kind: 'project' }
  ];

  const results = await Promise.allSettled(fields.map(section => App.api.get(section.endpoint)));
  fields.forEach((section, index) => {
    const container = document.getElementById(section.target);
    if (!container) return;
    const result = results[index];
    if (result.status !== 'fulfilled' || !result.value.success) {
      container.innerHTML = '<p class="catalog-error">This section could not load right now. Please try again.</p>';
      return;
    }
    const items = result.value.data || [];
    if (!items.length) {
      container.innerHTML = `<p class="catalog-error">No ${section.kind === 'course' ? 'courses' : section.kind === 'product' ? 'products' : 'projects'} available yet.</p>`;
      return;
    }
    if (section.kind === 'course') container.innerHTML = items.map(course => {
      const title = text(course.title);
      return `<article class="card"><a class="card__media" href="/course/${encodeURIComponent(course.slug)}"><img src="${App.render.escape(course.image)}" alt="${App.render.escape(title)}" loading="lazy"></a><div class="card__body"><h3 class="card__title"><a href="/course/${encodeURIComponent(course.slug)}">${App.render.escape(title)}</a></h3><p class="card__desc">${App.render.escape(text(course.description))}</p><div class="card__foot"><div><span class="card__price-label">Price</span><span class="card__price">${App.naira(course.price)}</span></div><a class="btn btn--primary btn--sm" href="/academy?enroll=${encodeURIComponent(course.slug)}"><i class="fa-solid fa-graduation-cap"></i> Enroll</a></div></div></article>`;
    }).join('');
    if (section.kind === 'product') container.innerHTML = items.map(product => {
      const name = text(product.name);
      const isOut = Number(product.stock) < 1;
      return `<article class="product-card"><div class="product-card__media"><a href="/product/${encodeURIComponent(product.slug)}"><img src="${App.render.escape(product.image)}" alt="${App.render.escape(name)}" loading="lazy"></a>${isOut ? '<span class="badge badge--error product-out-badge">Out of Stock</span>' : ''}</div><h3 class="product-card__title"><a href="/product/${encodeURIComponent(product.slug)}">${App.render.escape(name)}</a></h3><span class="product-card__price">${App.naira(product.price)}</span><div class="product-card__actions"><button class="btn btn--outline" data-home-add="${App.render.escape(product._id)}" ${isOut ? 'disabled' : ''}><i class="fa-solid fa-cart-plus"></i> Add</button><a class="btn btn--primary" href="/store?buy=${encodeURIComponent(product.slug)}" ${isOut ? 'aria-disabled="true" tabindex="-1"' : ''}>Buy</a></div></article>`;
    }).join('');
    if (section.kind === 'project') container.innerHTML = items.map(project => {
      const title = text(project.title);
      return `<article class="innovation-card"><a class="innovation-card__media" href="/project/${encodeURIComponent(project.slug)}"><img src="${App.render.escape(project.image)}" alt="${App.render.escape(title)}" loading="lazy"><span class="innovation-card__tag">${App.render.escape(text(project.category))}</span></a><div class="innovation-card__body"><h3 class="innovation-card__title"><a href="/project/${encodeURIComponent(project.slug)}">${App.render.escape(title)}</a></h3><p class="innovation-card__desc">${App.render.escape(text(project.description))}</p><a href="/innovations?similar=${encodeURIComponent(project.slug)}" class="btn btn--outline btn--block mt-auto">Request Similar <i class="fa-solid fa-arrow-right"></i></a></div></article>`;
    }).join('');
  });

  const productResult = results[1];
  const productList = productResult.status === 'fulfilled' && productResult.value.success ? productResult.value.data || [] : [];
  document.getElementById('featuredProducts')?.addEventListener('click', event => {
    const button = event.target.closest('[data-home-add]');
    if (!button) return;
    const product = productList.find(item => item._id === button.dataset.homeAdd);
    if (product) App.cart.add({ id: product._id, name: text(product.name), price: product.price, image: product.image });
  });
})();
