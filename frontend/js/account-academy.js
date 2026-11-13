(async function () {
  const container = document.getElementById('accountContent');
  const ref = new URLSearchParams(window.location.search).get('verify');
  if (ref) {
    App.notify.info('Verifying payment...');
    try { await App.api.post('/enrollments/verify', { reference: ref }); App.notify.success('Enrollment confirmed!'); window.history.replaceState({}, '', '/account/academy'); } catch {}
  }
  try {
    const res = await App.api.get('/enrollments/mine');
    if (!res.data || res.data.length === 0) { container.innerHTML = App.render.empty('fa-graduation-cap', 'No courses enrolled yet.'); return; }
    container.innerHTML = res.data.map(item => {
      const c = item.course;
      const title = c.title[App.i18n.lang] || c.title.ha;
      return `
      <div class="card p-4 mb-4" style="display:flex; flex-direction:row; gap:16px; align-items:center; flex-wrap:wrap;">
        <img src="${c.image}" style="width:80px; height:80px; border-radius:8px; object-fit:cover;" />
        <div style="flex:1; min-width:200px;">
          <h3 class="font-bold text-white mb-1">${title}</h3>
          <p class="text-muted text-xs mb-3">${c.duration}</p>
          ${c.telegramLink ? `<a href="${c.telegramLink}" target="_blank" class="btn btn--primary btn--sm"><i class="fa-brands fa-telegram"></i> Join Telegram Group</a>` : '<span class="text-muted text-xs">No group link</span>'}
        </div>
      </div>`;
    }).join('');
  } catch (err) { container.innerHTML = App.render.empty('fa-exclamation-circle', 'Failed to load courses.'); }
})();
