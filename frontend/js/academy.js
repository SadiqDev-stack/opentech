(async function () {
  await App.i18n.init(); App.injectChrome();
  const grid = document.getElementById('coursesGrid');
  const searchInput = document.getElementById('courseSearch');
  const enrollModal = document.getElementById('enrollModal');
  const enrollForm = document.getElementById('enrollForm');
  let allCourses = [];

  async function loadCourses(query = '') {
    grid.innerHTML = '<div class="skeleton skeleton--card"></div><div class="skeleton skeleton--card"></div>';
    try {
      const res = await App.api.get(`/courses?search=${encodeURIComponent(query)}`);
      allCourses = res.data || [];
      renderCourses(allCourses);
    } catch (err) {
      grid.innerHTML = `<div class="catalog-error">${App.render.escape(err.message || 'Courses could not load. Please try again.')}</div>`;
    }
  }

  function renderCourses(courses) {
    if (courses.length === 0) { grid.innerHTML = App.render.empty('fa-graduation-cap', 'No courses found.'); return; }
    grid.innerHTML = courses.map(c => {
      const title = c.title[App.i18n.lang] || c.title.en || c.title.ha;
      const desc = c.description[App.i18n.lang] || c.description.en || c.description.ha;
      return `
      <article class="card">
        <a class="card__media" href="/course/${encodeURIComponent(c.slug)}" aria-label="View ${App.render.escape(title)}"><img src="${App.render.escape(c.image)}" alt="${App.render.escape(title)}" loading="lazy" /></a>
        <div class="card__body">
          <h3 class="card__title"><a href="/course/${encodeURIComponent(c.slug)}">${App.render.escape(title)}</a></h3>
          <p class="card__desc">${App.render.escape(desc)}</p>
          <div class="card__foot">
            <div><span class="card__price-label">Price</span><span class="card__price">${App.naira(c.price)}</span></div>
            <button class="btn btn--primary btn--sm" data-enroll="${App.render.escape(c._id)}"><i class="fa-solid fa-graduation-cap"></i> Enroll</button>
          </div>
        </div>
      </article>`;
    }).join('');

    document.querySelectorAll('[data-enroll]').forEach(btn => {
      btn.addEventListener('click', () => {
        const course = allCourses.find(c => c._id === btn.dataset.enroll);
        if (course) openEnrollModal(course);
      });
    });
  }

  function openEnrollModal(course) {
    document.getElementById('modalCourseName').textContent = course.title[App.i18n.lang] || course.title.ha;
    document.getElementById('modalCourseId').value = course._id;
    document.getElementById('modalCoursePrice').textContent = App.naira(course.price);
    App.modal.open('enrollModal');
  }

  enrollForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(enrollForm, async (data) => {
      const res = await App.api.post('/enrollments/checkout', data);
      if (!res?.data?.authorization_url) throw new Error('Payment could not be started. Please try again.');
      window.location.href = res.data.authorization_url;
    });
  });

  searchInput?.addEventListener('input', (e) => { clearTimeout(window.searchTimeout); window.searchTimeout = setTimeout(() => loadCourses(e.target.value), 300); });
  (async () => {
    await loadCourses();
    const requested = new URLSearchParams(window.location.search).get('enroll');
    let course = allCourses.find(item => item.slug === requested || item._id === requested);
    if (requested && !course) {
      try { const response = await App.api.get(`/courses/${encodeURIComponent(requested)}`); course = response.data; }
      catch (error) { App.notify.error(error.message || 'This course could not be loaded.'); }
    }
    if (course) { openEnrollModal(course); history.replaceState({}, document.title, window.location.pathname); }
  })();
})();
