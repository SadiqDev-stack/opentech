(async function () {
  await App.i18n.init(); App.injectChrome();
  const slug = window.location.pathname.split('/').pop();
  const container = document.getElementById('detailContainer');

  try {
    const res = await App.api.get(`/innovations/${slug}`);
    const project = res.data;
    const title = project.title[App.i18n.lang] || project.title.ha;
    const desc = project.description[App.i18n.lang] || project.description.ha;

    container.innerHTML = `
      <img src="${project.image}" style="width:100%; height:400px; object-fit:cover; border-radius:var(--radius-xl);" />
      <div class="mt-2">
        <span class="badge badge--gold mb-2">${project.category}</span>
        <h1 class="section__title" style="font-size:28px; margin-bottom:16px;">${title}</h1>
        <p class="text-muted" style="font-size:15px; line-height:1.6; margin-bottom:32px;">${desc}</p>
        <div class="card" style="padding:24px; text-align:center;">
          <h3 class="mb-2">Want a similar project?</h3>
          <a href="/innovations" class="btn btn--primary btn--lg"><i class="fa-solid fa-paper-plane"></i> Request Similar Project</a>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = App.render.empty('fa-exclamation-circle', 'Project not found');
  }
})();
