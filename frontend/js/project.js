(async function () {
  await App.i18n.init();
  App.injectChrome();
  const slug = window.location.pathname.split('/').pop();
  const container = document.getElementById('detailContainer');
  try {
    const response = await App.api.get(`/innovations/${encodeURIComponent(slug)}`);
    const project = response.data;
    const title = project.title[App.i18n.lang] || project.title.en || project.title.ha;
    const description = project.description[App.i18n.lang] || project.description.en || project.description.ha;
    const category = typeof project.category === 'string' ? project.category : project.category?.[App.i18n.lang] || project.category?.en || '';
    container.innerHTML = `<img class="detail-image" src="${App.render.escape(project.image)}" alt="${App.render.escape(title)}"><div class="mt-2"><span class="badge badge--gold mb-2">${App.render.escape(category)}</span><h1 class="section__title detail-title">${App.render.escape(title)}</h1><p class="text-muted detail-description">${App.render.escape(description)}</p><div class="card detail-request"><h2 class="mb-2">Want a similar project?</h2><a href="/innovations?similar=${encodeURIComponent(project.slug)}" class="btn btn--primary btn--lg"><i class="fa-solid fa-paper-plane"></i> Request Similar Project</a></div>${App.shareButtons(window.location.pathname, title)}</div>`;
  } catch (error) { container.innerHTML = App.render.empty('fa-exclamation-circle', App.render.escape(error.message || 'Project not found')); }
})();
