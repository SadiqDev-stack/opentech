(async function () {
  await App.i18n.init(); App.injectChrome();
  const grid = document.getElementById('innovationsGrid');
  if (!grid) return;
  const searchInput = document.getElementById('innoSearch');
  const requestForm = document.getElementById('requestForm');
  const fileInput = document.getElementById('requestAttachment');

  async function loadInnovations(query = '') {
    grid.innerHTML = '<div class="skeleton skeleton--card"></div>';
    try {
      const res = await App.api.get(`/innovations?search=${query}`);
      renderInnovations(res.data || []);
    } catch (err) { grid.innerHTML = App.render.empty('fa-exclamation-triangle', 'Error loading.'); }
  }

  function renderInnovations(items) {
    if (items.length === 0) { grid.innerHTML = App.render.empty('fa-microchip', 'No innovations found.'); return; }
    grid.innerHTML = items.map(i => {
      const title = i.title[App.i18n.lang] || i.title.ha;
      const desc = i.description[App.i18n.lang] || i.description.ha;
      return `
      <article class="innovation-card">
        <div class="innovation-card__media">
          <img src="${i.image}" alt="${title}" loading="lazy" />
          <span class="innovation-card__tag">${i.category}</span>
        </div>
        <div class="innovation-card__body">
          <h3 class="innovation-card__title">${title}</h3>
          <p class="innovation-card__desc">${desc}</p>
          <a href="/project/${i.slug}" class="btn btn--outline btn--block mt-auto">View Details</a>
        </div>
      </article>`;
    }).join('');
  }

  if (fileInput) {
    fileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      App.notify.info('Uploading...');
      try {
        const sigRes = await App.api.get('/uploads/signature');
        const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;
        const fd = new FormData();
        fd.append('file', file); fd.append('api_key', apiKey); fd.append('timestamp', timestamp); fd.append('signature', signature); fd.append('folder', folder);
        const r = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd });
        const d = await r.json();
        if (d.secure_url) { document.getElementById('attachmentUrl').value = d.secure_url; App.notify.success('Uploaded!'); }
      } catch (err) { App.notify.error('Upload failed'); }
    });
  }

  if (requestForm) {
    requestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await App.form.submit(requestForm, async (data) => {
        await App.api.post('/innovations/requests', data);
        App.notify.success('Request submitted');
        App.modal.close('requestModal');
        setTimeout(() => window.location.href = '/account/innovations', 1000);
      });
    });
  }

  if (searchInput) searchInput.addEventListener('input', (e) => { clearTimeout(window.searchTimeout); window.searchTimeout = setTimeout(() => loadInnovations(e.target.value), 300); });
  loadInnovations();
})();
