(async function () {
  await App.i18n.init(); App.injectChrome();
  const lang = App.i18n.lang;
  const t = (obj) => obj[lang] || obj.ha;

  const mockCourses = [
    { _id: 'c1', title: { ha: 'Koyon Hada Inverter da Tsarin Solar', en: 'Inverter & Solar Assembly' }, description: { ha: 'Koyi yadda ake hada pure sine wave inverter.', en: 'Build a pure sine wave inverter.' }, price: 35000, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=70' },
    { _id: 'c2', title: { ha: 'Kayan Waya da Microcontroller (IoT)', en: 'Microcontrollers & IoT' }, description: { ha: 'Yadda ake tsara ESP32.', en: 'Build ESP32 projects.' }, price: 28000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70' },
    { _id: 'c3', title: { ha: 'Kafa Kyamarorin CCTV da Tsaro', en: 'CCTV & Security' }, description: { ha: 'Kafa IP cameras.', en: 'Install IP cameras.' }, price: 22000, image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=70' }
  ];
  const mockProducts = [
    { _id: 'p1', name: { ha: 'ESP32 IoT Module Kit', en: 'ESP32 IoT Module Kit' }, description: { ha: 'Relay module da Wi-Fi.', en: 'Relay and Wi-Fi.' }, price: 14500, image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=70', stock: 45 },
    { _id: 'p2', name: { ha: 'MPPT Solar Controller 30A', en: 'MPPT Solar Controller 30A' }, description: { ha: 'Kariya ga batir.', en: 'Battery protection.' }, price: 24000, image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=70', stock: 12 }
  ];
  const mockInnovations = [
    { _id: 'i1', category: { ha: 'Ban Ruwa da Noma', en: 'Irrigation' }, title: { ha: 'Tsarin Ban Ruwa na Solar', en: 'Solar Irrigation' }, description: { ha: 'An kera wa manoma.', en: 'Built for farmers.' }, image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=70', slug: 'solar-irrigation' }
  ];

  let courses = mockCourses, products = mockProducts, innovations = mockInnovations;
  try { const r = await App.api.get('/courses?limit=3'); if (r.success && r.data.length) courses = r.data; } catch {}
  try { const r = await App.api.get('/products?limit=2'); if (r.success && r.data.length) products = r.data; } catch {}
  try { const r = await App.api.get('/innovations?limit=3'); if (r.success && r.data.length) innovations = r.data; } catch {}

  const coursesEl = document.getElementById('featuredCourses');
  if (coursesEl) {
    coursesEl.innerHTML = courses.map((c) => `
      <article class="card">
        <div class="card__media"><img src="${c.image}" alt="${t(c.title)}" loading="lazy" /></div>
        <div class="card__body">
          <h3 class="card__title">${t(c.title)}</h3>
          <p class="card__desc">${t(c.description)}</p>
          <div class="card__foot">
            <div><span class="card__price-label">Price</span><span class="card__price">${App.naira(c.price)}</span></div>
            <button class="btn btn--primary btn--sm" onclick="window.location.href='/academy'"><i class="fa-solid fa-graduation-cap"></i> Enroll</button>
          </div>
        </div>
      </article>
    `).join('');
  }

  const productsEl = document.getElementById('featuredProducts');
  if (productsEl) {
    productsEl.innerHTML = products.map((p) => {
      const isOut = p.stock === 0;
      return `
      <article class="product-card">
        <div class="product-card__media" style="position:relative">
          <img src="${p.image}" alt="${t(p.name)}" loading="lazy" />
          ${isOut ? '<span class="badge badge--error" style="position:absolute;top:8px;left:8px">Out</span>' : ''}
        </div>
        <h3 class="product-card__title">${t(p.name)}</h3>
        <span class="product-card__price">${App.naira(p.price)}</span>
        <div class="product-card__actions">
          <button class="btn btn--outline" onclick="App.cart.add({id:'${p._id}', name:'${t(p.name)}', price:${p.price}, image:'${p.image}'})" ${isOut ? 'disabled' : ''}><i class="fa-solid fa-cart-plus"></i> Add</button>
          <button class="btn btn--primary" onclick="App.openGlobalCheckout([{productId:'${p._id}', quantity:1}], ${p.price})" ${isOut ? 'disabled' : ''}>Buy</button>
        </div>
      </article>
    `}).join('');
  }

  const innoEl = document.getElementById('featuredInnovations');
  if (innoEl) {
    innoEl.innerHTML = innovations.map((item) => `
      <article class="innovation-card">
        <div class="innovation-card__media">
          <img src="${item.image}" alt="${t(item.title)}" loading="lazy" />
          <span class="innovation-card__tag">${t(item.category)}</span>
        </div>
        <div class="innovation-card__body">
          <h3 class="innovation-card__title">${t(item.title)}</h3>
          <p class="innovation-card__desc">${t(item.description)}</p>
          <a href="/project/${item.slug}" class="btn btn--outline btn--block mt-auto"><span>View Details</span><i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </article>
    `).join('');
  }
})();
