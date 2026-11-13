(async function () {
  // 1. Prevent running multiple times
  if (window._adminLoaded) return;
  window._adminLoaded = true;

  const user = await App.auth.me();
  if (!user || user.role !== 'admin') {
    window.location.href = '/admin-login';
    return;
  }

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

  // 2. Grab the ORIGINAL content of the page before we do anything
  const originalContent = document.body.innerHTML;

  // 3. Build the sidebar layout
  const sidebarHTML = `
    <div class="admin-layout" style="display:flex; min-height:100vh; background:var(--color-black);">
      <aside class="admin-sidebar" style="width:260px; background:var(--color-card); border-right:1px solid var(--color-border); padding:20px; flex-shrink:0; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div class="brand mb-4" style="margin-bottom:24px;"><div class="brand__name">OPEN<span>TECH</span> Admin</div></div>
          <nav class="flex-col gap-1">
            ${navItems.map(item => {
              const isActive = path === item.href || (path === '/admin/' && item.href === '/admin');
              return `<a href="${item.href}" class="flex items-center gap-3 p-3 text-sm font-semibold" style="text-decoration:none; border-radius:8px; color:${isActive ? 'var(--color-gold)' : 'var(--color-muted)'}; background:${isActive ? 'var(--color-elevated)' : 'transparent'}; margin-bottom:4px;">
                <i class="fa-solid ${item.icon}"></i> ${item.label}
              </a>`;
            }).join('')}
          </nav>
        </div>
        <div>
          <a href="/" class="btn btn--outline btn--sm w-full mb-2" style="margin-bottom:8px;"><i class="fa-solid fa-globe"></i> View Site</a>
          <button class="btn btn--outline btn--sm w-full" style="color:var(--color-error-text);" onclick="App.auth.logout()">Logout</button>
        </div>
      </aside>
      <main class="admin-content" id="adminContent" style="flex:1; padding:30px; overflow-y:auto;">
        <!-- Page content injected here -->
      </main>
    </div>
  `;

  // 4. Replace body with sidebar
  document.body.innerHTML = sidebarHTML;
  
  // 5. Inject the original content into the main area
  const contentContainer = document.getElementById('adminContent');
  contentContainer.innerHTML = originalContent;

  // 6. Re-execute scripts from the original content
  const scripts = contentContainer.querySelectorAll('script');
  scripts.forEach(oldScript => {
    const newScript = document.createElement('script');
    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
    oldScript.parentNode.replaceChild(newScript, oldScript);
  });
})();
