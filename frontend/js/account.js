(async function () {
  await App.i18n.init();
  
  const user = await App.auth.me();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  // Populate header name
  document.querySelectorAll('.account-name').forEach(el => el.textContent = user.fullName);

  const currentPath = window.location.pathname;
  const links = [
    { href: '/account', icon: 'fa-chart-pie', label: 'Overview' },
    { href: '/account/orders', icon: 'fa-receipt', label: 'Orders' },
    { href: '/account/academy', icon: 'fa-graduation-cap', label: 'Academy' },
    { href: '/account/innovations', icon: 'fa-microchip', label: 'Requests' },
    { href: '/account/reports', icon: 'fa-flag', label: 'Reports' },
    { href: '/account/settings', icon: 'fa-gear', label: 'Settings' }
  ];

  const navHTML = `<div class="flex gap-2 overflow-x-auto mb-4 pb-2" style="border-bottom:1px solid var(--color-border); scrollbar-width:none;">
    ${links.map(l => {
      const isActive = currentPath === l.href || (currentPath === '/account/' && l.href === '/account');
      return `<a href="${l.href}" class="nav-pill ${isActive ? 'nav-pill--active' : ''}" style="text-decoration:none; white-space:nowrap;"><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`;
    }).join('')}
  </div>`;
  
  const navContainer = document.getElementById('accountNav');
  if (navContainer) navContainer.innerHTML = navHTML;
})();
