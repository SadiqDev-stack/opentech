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

  const navHTML = `<nav class="account-nav" aria-label="Account navigation">
    ${links.map(l => {
      const isActive = currentPath === l.href || (currentPath === '/account/' && l.href === '/account');
      return `<a href="${l.href}" class="${isActive ? 'is-active' : ''}" ${isActive ? 'aria-current="page"' : ''}><i class="fa-solid ${l.icon}"></i> ${l.label}</a>`;
    }).join('')}
  </nav>`;
  
  const navContainer = document.getElementById('accountNav');
  if (navContainer) navContainer.innerHTML = navHTML;
})();
