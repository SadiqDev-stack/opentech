(async function () {
  await App.i18n.init(); App.injectChrome();
  
  const grid = document.getElementById('coursesGrid');
  const searchInput = document.getElementById('courseSearch');
  const enrollModal = document.getElementById('enrollModal');
  const enrollForm = document.getElementById('enrollForm');
  let page = 1;
  let allCourses = [];
  let hasMore = true;

  async function loadCourses(reset = false) {
    if (reset) { page = 1; allCourses = []; grid.innerHTML = ''; hasMore = true; }
    if (!hasMore) return;
    
    if (reset) grid.innerHTML = '<div class="skeleton skeleton--card"></div><div class="skeleton skeleton--card"></div>';
    try {
      const res = await App.api.get(`/courses?page=${page}&limit=9&search=${searchInput.value}`);
      if (res.data.length > 0) {
        allCourses = reset ? res.data : [...allCourses, ...res.data];
        renderCourses(allCourses, reset);
        page++;
        hasMore = page <= res.meta.pages;
      } else {
        hasMore = false;
      }
    } catch (err) {
      grid.innerHTML = App.render.empty('fa-exclamation-triangle', 'Error loading courses');
    }
  }

  function renderCourses(courses, reset) {
    grid.innerHTML = courses.map(c => {
      const title = c.title[App.i18n.lang] || c.title.ha;
      const desc = c.description[App.i18n.lang] || c.description.ha;
      return `
      <article class="card">
        <div class="card__media"><img src="${c.image}" alt="${title}" loading="lazy" /></div>
        <div class="card__body">
          <h3 class="card__title">${title}</h3>
          <p class="card__desc">${desc}</p>
          <div class="card__foot">
            <div><span class="card__price-label">Price</span><span class="card__price">${App.naira(c.price)}</span></div>
            <button class="btn btn--primary btn--sm" data-enroll="${c._id}"><i class="fa-solid fa-graduation-cap"></i> Enroll</button>
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
      window.location.href = res.data.authorization_url;
    });
  });

  searchInput.addEventListener('input', () => {
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => loadCourses(true), 300);
  });

  App.infiniteScroll(grid, () => loadCourses(false));
  loadCourses(true);
})();
