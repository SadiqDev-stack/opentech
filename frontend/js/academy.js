(async function () {
  await App.i18n.init();
  App.injectChrome();

  const mockCourses = [
    { _id: 'c1', title: { ha: 'Koyon Hada Inverter da Tsarin Solar', en: 'Inverter & Solar Assembly' }, description: { ha: 'Koyi yadda ake hada pure sine wave inverter, lissafin batir da panel na solar a aikace.', en: 'Build a pure sine wave inverter practically.' }, price: 35000, image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=600&q=70', duration: '6 Weeks' },
    { _id: 'c2', title: { ha: 'Kayan Waya da Microcontroller (IoT)', en: 'Microcontrollers & IoT' }, description: { ha: 'Yadda ake tsara ESP32 da na\'urori masu sarrafa kansu.', en: 'Build ESP32 projects and self-controlled devices.' }, price: 28000, image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70', duration: '4 Weeks' },
    { _id: 'c3', title: { ha: 'Kafa Kyamarorin CCTV da Tsaro', en: 'CCTV & Security Installation' }, description: { ha: 'Kafa IP cameras, hada network, da ganin hoton kyamara.', en: 'Install IP cameras and set up networks.' }, price: 22000, image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=70', duration: '3 Weeks' }
  ];

  const lang = App.i18n.lang;
  const t = (obj) => obj[lang] || obj.ha;
  const grid = document.getElementById('coursesGrid');
  const searchInput = document.getElementById('courseSearchInput');

  function render(courses) {
    if (courses.length === 0) {
      grid.innerHTML = App.render.empty('fa-graduation-cap', 'No courses found.');
      return;
    }
    grid.innerHTML = courses.map((c) => `
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
            <button class="btn btn--primary btn--sm" onclick="App.notify.info('Enrollment opens soon')">
              <i class="fa-solid fa-graduation-cap"></i>${App.i18n.t('enroll_btn')}
            </button>
          </div>
        </div>
      </article>
    `).join('');
  }

  render(mockCourses);

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = mockCourses.filter(c => 
      t(c.title).toLowerCase().includes(q) || t(c.description).toLowerCase().includes(q)
    );
    render(filtered);
  });

  window.addEventListener('langChanged', () => render(mockCourses));
})();
