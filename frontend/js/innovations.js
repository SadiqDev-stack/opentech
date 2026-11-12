(async function () {
  await App.i18n.init(); App.injectChrome();
  
  const grid = document.getElementById('innovationsGrid');
  const searchInput = document.getElementById('innoSearch');
  const requestForm = document.getElementById('requestForm');
  const fileInput = document.getElementById('requestAttachment');
  let allInnovations = [];

  async function loadInnovations(query = '') {
    grid.innerHTML = '<div class="skeleton skeleton--card"></div>';
    try {
      const res = await App.api.get(`/innovations?search=${query}`);
      allInnovations = res.data || [];
      renderInnovations(allInnovations);
    } catch (err) {
      grid.innerHTML = App.render.empty('fa-exclamation-triangle', 'Error loading innovations');
    }
  }

  function renderInnovations(items) {
    if (items.length === 0) {
      grid.innerHTML = App.render.empty('fa-microchip', 'No innovations found.');
      return;
    }
    grid.innerHTML = items.map(i => {
      const title = i.title[App.i18n.lang] || i.title.ha;
      const desc = i.description[App.i18n.lang] || i.description.ha;
      return `
      <article class="innovation-card">
        <div class="innovation-card__media">
          <img src="${i.image}" alt="${title}" loading="lazy" />
          <span class="innovation-card__tag">${i.category}</span>
          <a href="/project/${i.slug}" style="position:absolute; top:10px; right:10px; background:rgba(0,0,0,0.7); width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white;"><i class="fa-solid fa-share"></i></a>
        </div>
        <div class="innovation-card__body">
          <h3 class="innovation-card__title">${title}</h3>
          <p class="innovation-card__desc">${desc}</p>
          <a href="/project/${i.slug}" class="btn btn--outline btn--block mt-auto">View Details</a>
        </div>
      </article>
      `;
    }).join('');
  }

  // File Upload to Cloudinary (Direct)
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    App.notify.info('Uploading attachment...');
    try {
      // 1. Get Signature
      const sigRes = await App.api.get('/uploads/signature');
      const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;

      // 2. Direct Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: 'POST',
        body: formData
      });
      const cloudData = await cloudRes.json();
      
      if (cloudData.secure_url) {
        document.getElementById('attachmentUrl').value = cloudData.secure_url;
        App.notify.success('Attachment uploaded!');
      } else {
        App.notify.error('Upload failed');
      }
    } catch (err) {
      App.notify.error('Upload error: ' + err.message);
    }
  });

  requestForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(requestForm, async (data) => {
      const res = await App.api.post('/innovations/requests', data);
      App.notify.success('Request submitted successfully!');
      App.modal.close('requestModal');
      setTimeout(() => window.location.href = '/account/innovations', 1000);
    });
  });

  searchInput.addEventListener('input', (e) => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => loadInnovations(e.target.value), 300);
  });

  loadInnovations();
})();
