(async function () {
  await App.i18n.init(); App.injectChrome();
  const grid = document.getElementById('innovationsGrid');
  const searchInput = document.getElementById('innoSearch');
  const requestForm = document.getElementById('requestForm');
  const fileInput = document.getElementById('requestAttachment');
  const similarSlug = new URLSearchParams(window.location.search).get('similar');
  let allInnovations = [];

  async function loadInnovations(query = '') {
    grid.innerHTML = '<div class="skeleton skeleton--card"></div>';
    try {
      const res = await App.api.get(`/innovations?search=${encodeURIComponent(query)}`);
      allInnovations = res.data || [];
      renderInnovations(allInnovations);
    } catch (err) { grid.innerHTML = `<div class="catalog-error">${App.render.escape(err.message || 'Projects could not load. Please try again.')}</div>`; }
  }

  function renderInnovations(items) {
    if (items.length === 0) { grid.innerHTML = App.render.empty('fa-microchip', 'No innovations found.'); return; }
    grid.innerHTML = items.map(i => {
      const title = i.title[App.i18n.lang] || i.title.en || i.title.ha;
      const desc = i.description[App.i18n.lang] || i.description.en || i.description.ha;
      return `
      <article class="innovation-card">
        <div class="innovation-card__media">
          <img src="${App.render.escape(i.image)}" alt="${App.render.escape(title)}" loading="lazy" />
          <span class="innovation-card__tag">${App.render.escape(typeof i.category === 'string' ? i.category : i.category?.[App.i18n.lang] || i.category?.en || '')}</span>
        </div>
        <div class="innovation-card__body">
          <h3 class="innovation-card__title">${App.render.escape(title)}</h3>
          <p class="innovation-card__desc">${App.render.escape(desc)}</p>
          <a href="/project/${i.slug}" class="btn btn--outline btn--block mt-auto">View Details</a>
        </div>
      </article>`;
    }).join('');
  }

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      fileInput.value = '';
      return App.notify.warning('Choose a file smaller than 5 MB.');
    }
    if (file) {
      App.notify.info('Uploading...');
      try {
        const sigRes = await App.api.get('/uploads/signature');
        const { signature, timestamp, folder, apiKey, cloudName, allowedFormats } = sigRes.data;
        const fd = new FormData();
        fd.append('file', file); fd.append('api_key', apiKey); fd.append('timestamp', timestamp); fd.append('signature', signature); fd.append('folder', folder); fd.append('allowed_formats', allowedFormats);
        const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: 'POST', body: fd });
        const cloudData = await cloudRes.json();
        if (!cloudRes.ok || !cloudData.secure_url) throw new Error(cloudData.error?.message || 'The file could not be uploaded.');
        document.getElementById('attachmentUrl').value = cloudData.secure_url; App.notify.success('Uploaded!');
      } catch (err) { App.notify.error(err.message || 'Upload failed'); }
    }
  });

  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(requestForm, async (data) => {
      const res = await App.api.post('/innovations/requests', data);
      App.notify.success(res?.data?.requestNumber ? `Request ${res.data.requestNumber} submitted` : 'Request submitted');
      App.modal.close('requestModal');
      requestForm.reset();
      document.getElementById('attachmentUrl').value = '';
      document.querySelector('#requestForm [name=relatedProject]').value = '';
      fileInput.value = '';
    });
  });

  searchInput?.addEventListener('input', (e) => { clearTimeout(window.searchTimeout); window.searchTimeout = setTimeout(() => loadInnovations(e.target.value), 300); });
  (async () => {
    await loadInnovations();
    if (!similarSlug) return;
    let project = allInnovations.find(item => item.slug === similarSlug);
    if (!project) {
      try { project = (await App.api.get(`/innovations/${encodeURIComponent(similarSlug)}`)).data; } catch {}
    }
    if (project) {
      document.querySelector('#requestForm [name=title]').value = `Similar to ${project.title.en || project.title.ha}`;
      document.querySelector('#requestForm [name=relatedProject]').value = project._id;
    }
    App.modal.open('requestModal');
    history.replaceState({}, document.title, window.location.pathname);
  })();
})();
