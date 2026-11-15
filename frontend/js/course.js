(async function () {
  await App.i18n.init();
  App.injectChrome();
  const slug = window.location.pathname.split('/').pop();
  const container = document.getElementById('detailContainer');
  try {
    const response = await App.api.get(`/courses/${encodeURIComponent(slug)}`);
    const course = response.data;
    const title = course.title[App.i18n.lang] || course.title.en || course.title.ha;
    const description = course.description[App.i18n.lang] || course.description.en || course.description.ha;
    container.innerHTML = `<img class="detail-image detail-image--course" src="${App.render.escape(course.image)}" alt="${App.render.escape(title)}"><div><h1 class="section__title detail-title">${App.render.escape(title)}</h1><div class="flex items-center gap-2 text-muted mb-4"><i class="fa-solid fa-clock"></i> ${App.render.escape(course.duration)}</div><p class="text-muted detail-description">${App.render.escape(description)}</p><div class="card detail-purchase"><div><span class="text-muted text-xs block">Price</span><span class="text-gold font-bold detail-price">${App.naira(course.price)}</span></div><a class="btn btn--primary btn--lg" href="/academy?enroll=${encodeURIComponent(course.slug)}"><i class="fa-solid fa-graduation-cap"></i> Enroll Now</a></div>${App.shareButtons(window.location.pathname, title)}</div>`;
  } catch (error) { container.innerHTML = App.render.empty('fa-exclamation-circle', App.render.escape(error.message || 'Course not found')); }
})();
