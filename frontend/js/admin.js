(async function () {
  const user = await App.auth.me();
  if (!user || user.role !== 'admin') { window.location.href = '/admin-login'; return; }
  if (document.querySelector('.admin-layout')) return;

  const path = window.location.pathname;
  const navItems = [
    { href: '/admin', icon: 'fa-chart-pie', label: 'Dashboard' },
    { href: '/admin/orders', icon: 'fa-receipt', label: 'Orders' },
    { href: '/admin/courses', icon: 'fa-graduation-cap', label: 'Courses' },
    { href: '/admin/enrollments', icon: 'fa-users', label: 'Enrollments' },
    { href: '/admin/products', icon: 'fa-box', label: 'Products' },
    { href: '/admin/innovations', icon: 'fa-microchip', label: 'Innovations' },
    { href: '/admin/users', icon: 'fa-user-shield', label: 'Users' },
    { href: '/admin/reports', icon: 'fa-flag', label: 'Reports' },
    { href: '/admin/notifications', icon: 'fa-bullhorn', label: 'Notifications' },
    { href: '/admin/settings', icon: 'fa-gear', label: 'Settings' }
  ];
  const shell = document.createElement('div');
  shell.className = 'admin-layout';
  shell.innerHTML = `<aside class="admin-sidebar"><div><div class="brand mb-4"><div class="brand__name">OPEN<span>TECH</span> Admin</div></div><nav aria-label="Admin navigation">${navItems.map(item => {
    const active = path === item.href || (path === '/admin/' && item.href === '/admin');
    return `<a href="${item.href}" class="flex items-center gap-3 p-3 text-sm font-semibold" style="text-decoration:none;color:${active ? 'var(--color-gold)' : 'var(--color-muted)'};background:${active ? 'var(--color-elevated)' : 'transparent'};" ${active ? 'aria-current="page"' : ''}><i class="fa-solid ${item.icon}"></i><span>${item.label}</span></a>`;
  }).join('')}</nav></div><div><a href="/" class="btn btn--outline btn--sm w-full mb-2"><i class="fa-solid fa-globe"></i> View Site</a><button class="btn btn--outline btn--sm w-full" onclick="App.auth.logout()">Logout</button></div></aside><main class="admin-content" id="adminContent"></main>`;

  const content = shell.querySelector('#adminContent');
  const existingNodes = Array.from(document.body.childNodes).filter(node => !(node instanceof HTMLScriptElement));
  document.body.replaceChildren(shell);
  content.append(...existingNodes);
})();
