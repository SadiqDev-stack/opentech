(async function () {
  await App.i18n.init(); App.injectChrome();
  const slug = window.location.pathname.split('/').pop();
  const container = document.getElementById('detailContainer');

  try {
    const res = await App.api.get(`/courses/${slug}`);
    const course = res.data;
    const title = course.title[App.i18n.lang] || course.title.ha;
    const desc = course.description[App.i18n.lang] || course.description.ha;

    container.innerHTML = `
      <img src="${course.image}" style="width:100%; height:350px; object-fit:cover; border-radius:var(--radius-xl);" />
      <div>
        <h1 class="section__title" style="font-size:28px; margin-bottom:8px;">${title}</h1>
        <div class="flex items-center gap-2 text-muted mb-4"><i class="fa-solid fa-clock"></i> ${course.duration}</div>
        <p class="text-muted" style="font-size:15px; line-height:1.6; margin-bottom:24px;">${desc}</p>
        <div class="card" style="padding:24px; flex-direction:row; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px;">
          <div>
            <span class="text-muted" style="font-size:12px; display:block;">Price</span>
            <span class="text-gold font-bold" style="font-size:24px;">${App.naira(course.price)}</span>
          </div>
          <a href="/academy" class="btn btn--primary btn--lg"><i class="fa-solid fa-graduation-cap"></i> Enroll Now</a>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = App.render.empty('fa-exclamation-circle', 'Course not found');
  }
})();
