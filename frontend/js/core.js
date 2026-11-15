const App = (() => {
  const API_BASE = '/api';

  async function request(method, path, body, options = {}) {
    const url = path.startsWith('http') ? path : API_BASE + path;
    const fetchOptions = { method, credentials: 'include', headers: { Accept: 'application/json' }, ...options };
    if (body !== undefined && !(body instanceof FormData)) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      fetchOptions.body = body;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    fetchOptions.signal = controller.signal;
    try {
      const res = await fetch(url, fetchOptions);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.message || `Request failed (${res.status})`);
        err.status = res.status; err.data = data; throw err;
      }
      return data;
    } catch (err) {
      if (err.name === 'AbortError') err.message = 'The request timed out. Please try again.';
      else if (!err.status) err.message = err.message || 'Network error';
      throw err;
    } finally { clearTimeout(timeout); }
  }

  const api = {
    get: (p, o) => request('GET', p, undefined, o),
    post: (p, b, o) => request('POST', p, b, o),
    put: (p, b, o) => request('PUT', p, b, o),
    del: (p, o) => request('DELETE', p, undefined, o)
  };

  function ensureToastHost() {
    let host = document.getElementById('app-toast');
    if (!host) {
      host = document.createElement('div'); host.id = 'app-toast'; host.className = 'toast-overlay';
      host.innerHTML = '<div class="toast" role="status"><i class="fa-solid fa-circle-check"></i><span class="toast__msg"></span></div>';
      document.body.appendChild(host);
    }
    return host;
  }

  let toastTimer = null;
  function notify(message, type = 'info') {
    const host = ensureToastHost();
    const toastEl = host.querySelector('.toast');
    const msgEl = host.querySelector('.toast__msg');
    const iconEl = host.querySelector('i');
    toastEl.classList.remove('toast--success', 'toast--error', 'toast--warning');
    if (type === 'success') { toastEl.classList.add('toast--success'); iconEl.className = 'fa-solid fa-circle-check'; }
    else if (type === 'error') { toastEl.classList.add('toast--error'); iconEl.className = 'fa-solid fa-circle-exclamation'; }
    else if (type === 'warning') { toastEl.classList.add('toast--warning'); iconEl.className = 'fa-solid fa-triangle-exclamation'; }
    else { iconEl.className = 'fa-solid fa-circle-info'; }
    msgEl.textContent = message;
    host.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => host.classList.remove('is-visible'), 4000);
  }
  notify.success = (m) => notify(m, 'success');
  notify.error = (m) => notify(m, 'error');
  notify.warning = (m) => notify(m, 'warning');
  notify.info = (m) => notify(m, 'info');

  const modal = {
    open(id) { /* modalPreFillHooked */
      setTimeout(() => {
        const m = document.getElementById(id);
        if (m) {
          const f = m.querySelector('form');
          if (f && typeof prefillForm === 'function') prefillForm(f);
        }
      }, 50); const el = document.getElementById(id); if (el) { el.classList.add('is-open'); document.body.style.overflow = 'hidden'; } },
    close(id) { const el = document.getElementById(id); if (el) { el.classList.remove('is-open'); if (!document.querySelector('.modal.is-open')) document.body.style.overflow = ''; } },
    bind() {
      document.addEventListener('click', (e) => {
        const closer = e.target.closest('[data-modal-close]'); if (closer) modal.close(closer.getAttribute('data-modal-close'));
        const opener = e.target.closest('[data-modal-open]'); if (opener) modal.open(opener.getAttribute('data-modal-open'));
        if (e.target.classList.contains('modal')) modal.close(e.target.id);
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { document.querySelectorAll('.modal.is-open').forEach((m) => modal.close(m)); closeDrawer(); } });
    }
  };

  const form = {
    async submit(formEl, handler) {
      if (!formEl) return;
      const submitBtn = formEl.querySelector('[type="submit"]');
      const originalHTML = submitBtn ? submitBtn.innerHTML : null;
      if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
      try { const formData = new FormData(formEl); await handler(Object.fromEntries(formData.entries()), formEl); }
      catch (err) { notify.error(err.message || 'Something went wrong'); }
      finally { if (submitBtn) { submitBtn.disabled = false; if (originalHTML) submitBtn.innerHTML = originalHTML; } }
    }
  };

  const render = {
    skeletonCards(count = 3) { return Array.from({ length: count }).map(() => '<div class="skeleton skeleton--card"></div>').join(''); },
    empty(icon = 'fa-inbox', text = 'Nothing here yet') { return `<div class="empty"><i class="fa-solid ${icon}"></i><p>${text}</p></div>`; },
    escape(str) { return String(str ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
  };

  const naira = (amount) => '₦' + (Number(amount) || 0).toLocaleString('en-NG');

  const i18n = {
    lang: 'ha', dict: {},
    async init() {
      const saved = localStorage.getItem('opentech_lang');
      i18n.lang = saved === 'en' ? 'en' : 'ha';
      await i18n.load(i18n.lang); i18n.apply(); i18n.updateSwitch();
      document.documentElement.lang = i18n.lang;
    },
    async load(lang) { try { const res = await fetch(`/languages/${lang}.json`); i18n.dict = await res.json(); } catch { i18n.dict = {}; } },
    async set(lang) {
      i18n.lang = lang === 'en' ? 'en' : 'ha';
      localStorage.setItem('opentech_lang', i18n.lang);
      await i18n.load(i18n.lang); i18n.apply(); i18n.updateSwitch();
      document.documentElement.lang = i18n.lang;
      notify.success(i18n.t('toast_language_changed'));
      window.dispatchEvent(new Event('langChanged'));
    },
    t(key, fallback = '') { return i18n.dict[key] ?? fallback; },
    apply(root = document) {
      root.querySelectorAll('[data-i18n]').forEach((el) => { const val = i18n.t(el.getAttribute('data-i18n')); if (val) el.textContent = val; });
      root.querySelectorAll('[data-i18n-attr]').forEach((el) => { const [attr, key] = el.getAttribute('data-i18n-attr').split(':'); const val = i18n.t(key); if (val && attr) el.setAttribute(attr, val); });
    },
    updateSwitch() { const el = document.getElementById('langCurrentText'); if (el) el.textContent = i18n.lang === 'ha' ? 'HAUSA' : 'ENGLISH'; },
    toggle() { return i18n.set(i18n.lang === 'ha' ? 'en' : 'ha'); }
  };

  const CART_KEY = 'opentech_cart';
  const cart = {
    get() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } },
    save(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); cart.updateBadge(); },
    add(item) {
      const items = cart.get(); const found = items.find((i) => i.id === item.id);
      if (found) found.qty += 1; else items.push({ ...item, qty: 1 });
      cart.save(items); notify.success((i18n.lang === 'ha' ? 'An saka a keken: ' : 'Added to cart: ') + item.name);
    },
    updateQty(id, delta) {
      const items = cart.get(); const item = items.find(i => i.id === id);
      if (item) { item.qty += delta; if (item.qty <= 0) cart.remove(id); else cart.save(items); }
    },
    remove(id) { cart.save(cart.get().filter((i) => i.id !== id)); },
    clear() { cart.save([]); },
    count() { return cart.get().reduce((s, i) => s + i.qty, 0); },
    updateBadge() {
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        const c = cart.count(); el.textContent = c; el.style.display = c > 0 ? '' : 'none';
      });
    }
  };

  
  function prefillForm(formEl) {
    if (!formEl || !auth.user) return;
    const u = auth.user;
    const nameInput = formEl.querySelector('[name="fullName"], [name="name"], [name="contactName"]');
    const emailInput = formEl.querySelector('[name="email"], [name="contactEmail"]');
    const phoneInput = formEl.querySelector('[name="phone"], [name="contactPhone"]');

    if (nameInput && !nameInput.value && u.fullName) nameInput.value = u.fullName;
    if (emailInput && !emailInput.value && u.email) {
      emailInput.value = u.email;
      let noteEl = formEl.querySelector('.auth-email-soft-note');
      if (!noteEl) {
        noteEl = document.createElement('div');
        noteEl.className = 'auth-email-soft-note text-xs text-muted mt-1';
        emailInput.parentNode.appendChild(noteEl);
      }
      emailInput.addEventListener('input', () => {
        if (emailInput.value && emailInput.value.toLowerCase() !== (u.email || '').toLowerCase()) {
          noteEl.textContent = 'You are logged in as ' + u.email + '. If you use another email, it will be saved separately.';
          noteEl.style.color = '#f59e0b';
        } else {
          noteEl.textContent = '';
        }
      });
    }
    if (phoneInput && !phoneInput.value && u.phone) phoneInput.value = u.phone;
  }

  const auth = {
    user: null,
    async me() { try { const res = await api.get('/auth/me'); auth.user = res?.data?.user || null; } catch { auth.user = null; } return auth.user; },
    async logout() { try { await api.post('/auth/logout'); } catch {} auth.user = null; location.href = '/'; },
    async checkAccess() {
      const user = await auth.me();
      if (!user) { notify.warning('Please register or log in.'); window.location.href = '/register'; return false; }
      return true;
    }
  };

  function closeDrawer() {
    const overlay = document.getElementById('sidebarOverlay');
    const menu = document.getElementById('menuToggleBtn');
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    menu?.setAttribute('aria-expanded', 'false');
  }

  function injectChrome() {
    const path = window.location.pathname;
    const isHome = path === '/' || path.includes('index.html');
    const isAcademy = path.includes('academy');
    const isStore = path.includes('store');
    const isInno = path.includes('innovations');

    const headerHTML = `
      <header class="site-header">
        <div class="site-header__inner">
          <a href="/" class="brand" aria-label="OpenTech home">
            <div class="brand__logo"><img src="/assets/logo.png" alt="OpenTech" /></div>
            <div>
              <div class="brand__name">OPEN<span>TECH</span></div>
              <span class="brand__sub">Kano · Nigeria</span>
            </div>
          </a>
          <nav class="header-nav">
            <a href="/" class="header-nav__link ${isHome ? 'active' : ''}"><i class="fa-solid fa-house"></i><span data-i18n="nav_home">Gida</span></a>
            <a href="/academy" class="header-nav__link ${isAcademy ? 'active' : ''}"><i class="fa-solid fa-graduation-cap"></i><span data-i18n="nav_courses">Kwasa-kwasai</span></a>
            <a href="/store" class="header-nav__link ${isStore ? 'active' : ''}"><i class="fa-solid fa-store"></i><span data-i18n="nav_store">Shago</span></a>
            <a href="/innovations" class="header-nav__link ${isInno ? 'active' : ''}"><i class="fa-solid fa-microchip"></i><span data-i18n="nav_projects">Ayyukanmu</span></a>
          </nav>
          <div class="header-actions">
            <button id="langToggleBtn" class="lang-pill" type="button" aria-label="Switch language"><i class="fa-solid fa-language"></i><span id="langCurrentText">HAUSA</span></button>
            <a href="/cart" class="icon-btn" aria-label="Cart"><i class="fa-solid fa-cart-shopping"></i><span class="cart-badge" data-cart-count style="display:none">0</span></a>
            <button id="accountBtn" class="icon-btn" aria-label="Account"><i class="fa-solid fa-user"></i></button>
            <button class="icon-btn menu-toggle" id="menuToggleBtn" aria-label="Menu" aria-expanded="false" aria-controls="sidebarOverlay"><i class="fa-solid fa-bars"></i></button>
          </div>
        </div>
      </header>
      <div class="sidebar-overlay" id="sidebarOverlay">
        <div class="sidebar">
          <div class="sidebar-header"><span class="brand__name">OPEN<span>TECH</span></span><button class="icon-btn" id="closeSidebarBtn"><i class="fa-solid fa-xmark"></i></button></div>
          <nav class="sidebar-nav">
            <a href="/" class="sidebar-link ${isHome ? 'active' : ''}"><i class="fa-solid fa-house"></i> <span data-i18n="nav_home">Gida</span></a>
            <a href="/academy" class="sidebar-link ${isAcademy ? 'active' : ''}"><i class="fa-solid fa-graduation-cap"></i> <span data-i18n="nav_courses">Kwasa-kwasai</span></a>
            <a href="/store" class="sidebar-link ${isStore ? 'active' : ''}"><i class="fa-solid fa-store"></i> <span data-i18n="nav_store">Shago</span></a>
            <a href="/innovations" class="sidebar-link ${isInno ? 'active' : ''}"><i class="fa-solid fa-microchip"></i> <span data-i18n="nav_projects">Ayyukanmu</span></a>
          </nav>
        </div>
      </div>
    `;

    const footerHTML = `
      <footer class="site-footer">
        <div class="site-footer__brand">OPEN<span>TECH</span></div>
        <p class="site-footer__tagline" data-i18n="footer_tagline">Fasaha, kirkire-kirkire da koyon sana'o'in zamani. Kano, Najeriya.</p>
        <div class="site-footer__links">
          <a href="/academy" data-i18n="nav_courses">Kwasa-kwasai</a>
          <a href="/store" data-i18n="nav_store">Shago</a>
          <a href="/innovations" data-i18n="nav_projects">Ayyukanmu</a>
          <a href="/account" data-i18n="nav_account">Asusuna</a>
        </div>
        <p class="site-footer__copyright" data-i18n="footer_copyright">Hakkin Mallaka © 2026 OpenTech.</p>
      </footer>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    
  modal.confirm = function({ title = 'Confirm Action', message = 'Are you sure you want to proceed?', confirmText = 'Confirm', cancelText = 'Cancel' } = {}) {
    return new Promise((resolve) => {
      let modalEl = document.getElementById('app-confirm-modal');
      if (!modalEl) {
        modalEl = document.createElement('div');
        modalEl.id = 'app-confirm-modal';
        modalEl.className = 'modal';
        modalEl.innerHTML = '<div class="modal__dialog card p-6 max-w-sm w-full mx-4" style="background:var(--color-bg-card,#13161c);border:1px solid var(--color-border,#2a2f3d);border-radius:12px;"><h3 id="app-confirm-title" class="text-lg font-bold text-white mb-2"></h3><p id="app-confirm-msg" class="text-sm text-muted mb-6"></p><div class="flex justify-end gap-3"><button id="app-confirm-cancel" type="button" class="btn btn--ghost btn--sm">Cancel</button><button id="app-confirm-ok" type="button" class="btn btn--primary btn--sm">Confirm</button></div></div>';
        document.body.appendChild(modalEl);
      }
      modalEl.querySelector('#app-confirm-title').textContent = title;
      modalEl.querySelector('#app-confirm-msg').textContent = message;
      const okBtn = modalEl.querySelector('#app-confirm-ok');
      const cancelBtn = modalEl.querySelector('#app-confirm-cancel');
      okBtn.textContent = confirmText;
      cancelBtn.textContent = cancelText;

      const cleanup = (val) => {
        modal.close('app-confirm-modal');
        okBtn.onclick = null;
        cancelBtn.onclick = null;
        resolve(val);
      };
      okBtn.onclick = () => cleanup(true);
      cancelBtn.onclick = () => cleanup(false);
      modal.open('app-confirm-modal');
    });
  };

    modal.bind();

    // Auto-fetch user on initial load (fast background promise)
    auth.me().then((u) => {
      if (u) {
        // Append account links to the mobile hamburger drawer so user never gets lost
        const sidebarNav = document.querySelector('.sidebar-nav');
        if (sidebarNav && !sidebarNav.querySelector('.sidebar-account-links')) {
          const accDiv = document.createElement('div');
          accDiv.className = 'sidebar-account-links';
          accDiv.innerHTML = `
            <div style="border-top:1px solid var(--color-border); margin:12px 0 8px; padding-top:8px;">
              <span style="font-size:11px; text-transform:uppercase; color:var(--color-gold,#d97706); font-weight:700; letter-spacing:1px; padding:0 12px;">${u.role === 'admin' ? 'Gudanarwa / Admin' : 'Asusuna / Account'}</span>
            </div>
            ${u.role === 'admin' ? `
              <a href="/admin/" class="sidebar-link"><i class="fa-solid fa-gauge"></i> <span>Admin Panel</span></a>
            ` : `
              <a href="/account/" class="sidebar-link"><i class="fa-solid fa-chart-pie"></i> <span>Overview</span></a>
              <a href="/account/orders.html" class="sidebar-link"><i class="fa-solid fa-receipt"></i> <span>Orders</span></a>
              <a href="/account/academy.html" class="sidebar-link"><i class="fa-solid fa-graduation-cap"></i> <span>Academy</span></a>
              <a href="/account/innovations.html" class="sidebar-link"><i class="fa-solid fa-microchip"></i> <span>Requests</span></a>
              <a href="/account/reports.html" class="sidebar-link"><i class="fa-solid fa-flag"></i> <span>Reports</span></a>
              <a href="/account/settings.html" class="sidebar-link"><i class="fa-solid fa-gear"></i> <span>Settings</span></a>
            `}
            <a href="#" class="sidebar-link" onclick="App.auth.logout(); return false;" style="color:#ef4444 !important;"><i class="fa-solid fa-right-from-bracket"></i> <span>Fita / Logout</span></a>
          `;
          sidebarNav.appendChild(accDiv);
        }
        // Auto-fill all forms on page
        document.querySelectorAll('form').forEach(f => prefillForm(f));
      }
    }).catch(() => {});
    cart.updateBadge();
    document.addEventListener('click', async (event) => {
      const button = event.target.closest('[data-copy-link]');
      if (!button) return;
      const url = new URL(button.dataset.copyLink || window.location.href, window.location.origin).toString();
      try {
        if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
        else {
          const field = document.createElement('textarea'); field.value = url; field.style.position = 'fixed'; field.style.opacity = '0';
          document.body.appendChild(field); field.select(); document.execCommand('copy'); field.remove();
        }
        notify.success('Link copied');
      } catch { notify.error('Unable to copy this link'); }
    });

    const langBtn = document.getElementById('langToggleBtn'); if (langBtn) langBtn.addEventListener('click', () => i18n.toggle());
    const menuBtn = document.getElementById('menuToggleBtn'); const closeSidebarBtn = document.getElementById('closeSidebarBtn'); const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (menuBtn && sidebarOverlay) {
      menuBtn.addEventListener('click', () => { sidebarOverlay.classList.add('is-open'); menuBtn.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; closeSidebarBtn?.focus(); });
      closeSidebarBtn?.addEventListener('click', closeDrawer);
      sidebarOverlay.addEventListener('click', (e) => { if (e.target === sidebarOverlay) closeDrawer(); });
      sidebarOverlay.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));
    }
    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
      accountBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.user) {
          window.location.href = (auth.user.role === 'admin') ? '/admin/' : '/account/';
        } else {
          window.location.href = '/login';
        }
      });
    });
    }
  }

  function shareButtons(url, title = 'OpenTech') {
    const absolute = new URL(url, window.location.origin).toString();
    const link = encodeURIComponent(absolute);
    const text = encodeURIComponent(title);
    return `<div class=\"share-actions\"><button type=\"button\" class=\"btn btn--outline btn--sm\" data-copy-link=\"${render.escape(absolute)}\"><i class=\"fa-solid fa-copy\"></i> Copy link</button><a class=\"btn btn--ghost btn--sm\" target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://wa.me/?text=${text}%20${link}\" aria-label=\"Share on WhatsApp\"><i class=\"fa-brands fa-whatsapp\"></i></a><a class=\"btn btn--ghost btn--sm\" target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://www.facebook.com/sharer/sharer.php?u=${link}\" aria-label=\"Share on Facebook\"><i class=\"fa-brands fa-facebook\"></i></a></div>`;
  }

  return { api, notify, modal, form, render, naira, i18n, cart, auth, injectChrome, shareButtons, prefillForm };
})();
window.App = App;
