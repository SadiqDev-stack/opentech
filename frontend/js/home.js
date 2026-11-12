/* Homepage — API-first with mock fallback. */

(async function () {
  await App.i18n.init();
  App.injectChrome();

  const lang = App.i18n.lang;
  const t = (obj) => obj[lang] || obj.ha;

  // --- Mock Data (Fallbacks) ---
  const mockCourses = [
    {
      _id: 'c1',
      title: { ha: 'Koyon Hada Inverter da Tsarin Solar', en: 'Inverter & Solar Assembly' },
      description: { ha: 'Koyi yadda ake hada pure sine wave inverter, lissafin batir da panel na solar a aikace.', en: 'Build a pure sine wave inverter and calculate solar panels and battery banks practically.' },
      price: 35000,
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=70',
      duration: '6 Weeks'
    },
    {
      _id: 'c2',
      title: { ha: 'Kayan Waya da Microcontroller (IoT)', en: 'Microcontrollers & IoT' },
      description: { ha: 'Yadda ake tsara ESP32 da na\'urori masu sarrafa kansu ta amfani da wayar hannu.', en: 'Build ESP32 projects and self-controlled devices from your phone.' },
      price: 28000,
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70',
      duration: '4 Weeks'
    },
    {
      _id: 'c3',
      title: { ha: 'Kafa Kyamarorin CCTV da Tsaro', en: 'CCTV & Security Installation' },
      description: { ha: 'Kafa IP cameras, hada network, da ganin hoton kyamara ta waya ko ina.', en: 'Install IP cameras, set up the network, and view footage remotely.' },
      price: 22000,
      image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=70',
      duration: '3 Weeks'
    }
  ];

  const mockProducts = [
    {
      _id: 'p1',
      name: { ha: 'ESP32 IoT Module Kit', en: 'ESP32 IoT Module Kit' },
      description: { ha: 'Relay module da Wi-Fi don sarrafa fitilu da famfo.', en: 'Relay and Wi-Fi module for smart control.' },
      price: 14500,
      image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=70',
      stock: 45
    },
    {
      _id: 'p2',
      name: { ha: 'MPPT Solar Controller 30A', en: 'MPPT Solar Controller 30A' },
      description: { ha: 'Kariya ga batir da caji mai sauri.', en: 'Battery protection with fast charge and LCD.' },
      price: 24000,
      image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=600&q=70',
      stock: 12
    }
  ];

  const mockInnovations = [
    {
      _id: 'i1',
      category: { ha: 'Ban Ruwa da Noma', en: 'Irrigation & Agriculture' },
      title: { ha: 'Tsarin Ban Ruwa na Solar', en: 'Sensor-assisted Solar Irrigation System' },
      description: { ha: 'An kera wa manoma don rage kudin man fetur.', en: 'Built for farmers to remove the cost of expensive fuel pumps.' },
      image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=70'
    },
    {
      _id: 'i2',
      category: { ha: 'Makamashi', en: 'Renewable Energy' },
      title: { ha: 'Tsarin Wutar Solar 10kVA', en: '10kVA Solar System' },
      description: { ha: 'Don asibitoci da masana\'anta.', en: 'Commercial solar hybrid for hospitals and factories.' },
      image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=600&q=70'
    },
    {
      _id: 'i3',
      category: { ha: 'IoT', en: 'Electronics & IoT' },
      title: { ha: 'Na\'urar Sanar da Ruwa', en: 'Water Tank Monitor' },
      description: { ha: 'Tana tura SMS idan tanki ya cika.', en: 'Sends SMS when tank is full or empty.' },
      image: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=70'
    }
  ];

  let courses = mockCourses;
  let products = mockProducts;
  let innovations = mockInnovations;

  // --- Fetch Data ---
  try {
    const res = await App.api.get('/courses?limit=3');
    if (res.success && res.data.length > 0) courses = res.data;
  } catch {}
  try {
    const res = await App.api.get('/products?limit=2');
    if (res.success && res.data.length > 0) products = res.data;
  } catch {}
  try {
    const res = await App.api.get('/innovations?limit=3');
    if (res.success && res.data.length > 0) innovations = res.data;
  } catch {}

  // --- Render Courses ---
  const coursesEl = document.getElementById('featuredCourses');
  if (coursesEl) {
    coursesEl.innerHTML = courses.map((c) => `
      <article class="card">
        <div class="card__media"><img src="${c.image}" alt="${App.render.escape(t(c.title))}" loading="lazy" /></div>
        <div class="card__body">
          <h3 class="card__title">${App.render.escape(t(c.title))}</h3>
          <p class="card__desc">${App.render.escape(t(c.description))}</p>
          <div class="card__foot">
            <div>
              <span class="card__price-label">${App.i18n.t('price_label')}</span>
              <span class="card__price">${App.naira(c.price)}</span>
            </div>
            <button class="btn btn--primary btn--sm" data-enroll="${c._id}">
              <i class="fa-solid fa-graduation-cap"></i>${App.i18n.t('enroll_btn')}
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  // --- Render Products ---
  const productsEl = document.getElementById('featuredProducts');
  if (productsEl) {
    productsEl.innerHTML = products.map((p) => {
      const isOut = p.stock === 0;
      return `
      <article class="product-card">
        <div class="product-card__media" style="position:relative">
          <img src="${p.image}" alt="${App.render.escape(t(p.name))}" loading="lazy" />
          ${isOut ? '<span class="badge badge--error" style="position:absolute;top:8px;left:8px">Out of Stock</span>' : ''}
        </div>
        <h3 class="product-card__title">${App.render.escape(t(p.name))}</h3>
        <span class="product-card__price">${App.naira(p.price)}</span>
        <div class="product-card__actions">
          <button class="btn btn--outline" data-add-cart="${p._id}" ${isOut ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus"></i>${App.i18n.t('add_to_cart_btn')}
          </button>
          <button class="btn btn--primary" data-buy="${p._id}" ${isOut ? 'disabled' : ''}>
            ${App.i18n.t('buy_now_btn')}
          </button>
        </div>
      </article>
      `;
    }).join('');
  }

  // --- Render Innovations ---
  const innoEl = document.getElementById('featuredInnovations');
  if (innoEl) {
    innoEl.innerHTML = innovations.map((item) => `
      <article class="innovation-card">
        <div class="innovation-card__media">
          <img src="${item.image}" alt="${App.render.escape(t(item.title))}" loading="lazy" />
          <span class="innovation-card__tag">${App.render.escape(t(item.category))}</span>
        </div>
        <div class="innovation-card__body">
          <h3 class="innovation-card__title">${App.render.escape(t(item.title))}</h3>
          <p class="innovation-card__desc">${App.render.escape(t(item.description))}</p>
          <a href="/innovations" class="btn btn--outline btn--block mt-auto" style="margin-top: auto;">
            <span>${App.i18n.t('request_project_btn')}</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </article>
    `).join('');
  }

  // --- Interactions ---
  document.addEventListener('click', (e) => {
    const enrollBtn = e.target.closest('[data-enroll]');
    if (enrollBtn) { App.notify.info('Course enrollment opens in the Academy page.'); return; }

    const addBtn = e.target.closest('[data-add-cart]');
    if (addBtn) {
      const id = addBtn.dataset.addCart;
      const p = products.find((x) => x._id === id);
      if (p) App.cart.add({ id: p._id, name: t(p.name), price: p.price, image: p.image });
      return;
    }

    const buyBtn = e.target.closest('[data-buy]');
    if (buyBtn) { App.notify.info('Checkout opens in the Store page.'); return; }
  });
})();
