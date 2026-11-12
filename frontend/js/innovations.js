(async function () {
  await App.i18n.init(); App.injectChrome();

  const mockInnovations = [
    { _id: 'i1', category: { ha: 'Ban Ruwa da Noma', en: 'Irrigation' }, title: { ha: 'Tsarin Ban Ruwa na Solar', en: 'Solar Irrigation System' }, description: { ha: 'An kera wa manoma don rage kudin man fetur.', en: 'Built for farmers to remove fuel costs.' }, image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=70' },
    { _id: 'i2', category: { ha: 'Makamashi', en: 'Energy' }, title: { ha: 'Tsarin Wutar Solar 10kVA', en: '10kVA Solar System' }, description: { ha: 'Don asibitoci da masana\'anta.', en: 'For hospitals and factories.' }, image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=900&q=70' },
    { _id: 'i3', category: { ha: 'IoT', en: 'IoT' }, title: { ha: 'Na\'urar Sanar da Ruwa', en: 'Water Tank Monitor' }, description: { ha: 'Tana tura SMS idan tanki ya cika.', en: 'Sends SMS when tank is full.' }, image: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=900&q=70' }
  ];

  const lang = App.i18n.lang;
  const t = (obj) => obj[lang] || obj.ha;
  const grid = document.getElementById('innovationsGrid');
  const searchInput = document.getElementById('innoSearchInput');
  const requestForm = document.getElementById('requestForm');

  function render(items) {
    if (items.length === 0) {
      grid.innerHTML = App.render.empty('fa-microchip', 'No innovations found.');
      return;
    }
    grid.innerHTML = items.map((i) => `
      <article class="innovation-card">
        <div class="innovation-card__media">
          <img src="${i.image}" alt="${App.render.escape(t(i.title))}" loading="lazy" />
          <span class="innovation-card__tag">${App.render.escape(t(i.category))}</span>
        </div>
        <div class="innovation-card__body">
          <h3 class="innovation-card__title">${App.render.escape(t(i.title))}</h3>
          <p class="innovation-card__desc">${App.render.escape(t(i.description))}</p>
        </div>
      </article>
    `).join('');
  }

  render(mockInnovations);

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const filtered = mockInnovations.filter(i => 
      t(i.title).toLowerCase().includes(q) || t(i.description).toLowerCase().includes(q)
    );
    render(filtered);
  });

  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(requestForm, async (data) => {
      await new Promise(r => setTimeout(r, 800)); // fake delay
      App.notify.success('Request sent! We will contact you soon.');
      requestForm.reset();
    });
  });

  window.addEventListener('langChanged', () => render(mockInnovations));
})();
