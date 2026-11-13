(async function () {
  await App.i18n.init();
  App.injectChrome();

  const user = await App.auth.me();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  let navContainer = document.getElementById('accountNav');
  if (!navContainer) {
    const main = document.querySelector('main');
    if (main) {
      main.insertAdjacentHTML('afterbegin', '<div id="accountNav"></div>');
      navContainer = document.getElementById('accountNav');
    }
  }

  const currentPath = window.location.pathname;
  const links = [
    { href: '/account', icon: 'fa-chart-pie', label: 'Overview' },
    { href: '/account/orders', icon: 'fa-receipt', label: 'Orders' },
    { href: '/account/academy', icon: 'fa-graduation-cap', label: 'Academy' },
    { href: '/account/innovations', icon: 'fa-microchip', label: 'Requests' },
    { href: '/account/reports', icon: 'fa-flag', label: 'Reports' },
    { href: '/account/settings', icon: 'fa-gear', label: 'Settings' }
  ];

  const navHTML = `
    <div class="flex items-center gap-3 mb-6 p-4" style="background:var(--color-card); border:1px solid var(--color-border); border-radius:var(--radius-lg);">
      <div class="w-12 h-12 rounded-full flex items-center justify-center text-gold font-bold text-lg" style="background:var(--color-gold-soft); border:1px solid var(--color-gold-border);">${user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}</div>
      <div style="flex:1;">
        <div class="font-bold text-white text-lg">${user.fullName}</div>
        <div class="text-muted text-sm">${user.email}</div>
      </div>
      <button class="btn btn--outline btn--sm" onclick="App.auth.logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>
    </div>
    <div class="flex gap-2 overflow-x-auto pb-4 mb-6" style="border-bottom:1px solid var(--color-border); scrollbar-width:none;">
      ${links.map(l => {
        const isActive = currentPath === l.href || (currentPath === '/account/' && l.href === '/account');
        return `<a href="${l.href}" class="nav-pill ${isActive ? 'nav-pill--active' : ''}" style="text-decoration:none; white-space:nowrap; padding: 8px 16px;"><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`;
      }).join('')}
    </div>`;

  if (navContainer) navContainer.innerHTML = navHTML;
})();
