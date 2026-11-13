const App = (() => {
  const API_BASE = '/api';

  async function request(method, path, body, options = {}) {
    const url = path.startsWith('http') ? path : API_BASE + path;
    const fetchOptions = { method, credentials: 'include', headers: { Accept: 'application/json' }, ...options };
    if (body !== undefined && !(body instanceof FormData)) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    } else if (body instanceof FormData) { fetchOptions.body = body; }
    try {
      const res = await fetch(url, fetchOptions);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { const err = new Error(data.message || `Request failed (${res.status})`); err.status = res.status; err.data = data; throw err; }
      return data;
    } catch (err) { if (!err.status) err.message = err.message || 'Network error'; throw err; }
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
    const host = ensureToastHost(); const toastEl = host.querySelector('.toast');
    const msgEl = host.querySelector('.toast__msg'); const iconEl = host.querySelector('i');
    toastEl.classList.remove('toast--success', 'toast--error', 'toast--warning');
    if (type === 'success') { toastEl.classList.add('toast--success'); iconEl.className = 'fa-solid fa-circle-check'; }
    else if (type === 'error') { toastEl.classList.add('toast--error'); iconEl.className = 'fa-solid fa-circle-exclamation'; }
    else if (type === 'warning') { toastEl.classList.add('toast--warning'); iconEl.className = 'fa-solid fa-triangle-exclamation'; }
    else { iconEl.className = 'fa-solid fa-circle-info'; }
    msgEl.textContent = message;
    host.classList.add('is-visible'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => host.classList.remove('is-visible'), 4000);
  }
  notify.success = (m) => notify(m, 'success');
  notify.error = (m) => notify(m, 'error');
  notify.warning = (m) => notify(m, 'warning');
  notify.info = (m) => notify(m, 'info');

  const modal = {
    open(id) { const el = document.getElementById(id); if (el) { el.classList.add('is-open'); document.body.style.overflow = 'hidden'; } },
    close(id) { const el = document.getElementById(id); if (el) { el.classList.remove('is-open'); if (!document.querySelector('.modal.is-open')) document.body.style.overflow = ''; } },
    bind() {
      document.addEventListener('click', (e) => {
        const closer = e.target.closest('[data-modal-close]'); if (closer) modal.close(closer.getAttribute('data-modal-close'));
        const opener = e.target.closest('[data-modal-open]'); if (opener) modal.open(opener.getAttribute('data-modal-open'));
        if (e.target.classList.contains('modal')) modal.close(e.target);
      });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.querySelectorAll('.modal.is-open').forEach((m) => modal.close(m)); });
    }
  };

  const form = {
    async submit(formEl, handler) {
      if (!formEl) return;
      const submitBtn = formEl.querySelector('[type="submit"]'); const originalHTML = submitBtn ? submitBtn.innerHTML : null;
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
    updateQty(id, delta) { const items = cart.get(); const item = items.find(i => i.id === id); if (item) { item.qty += delta; if (item.qty <= 0) cart.remove(id); else cart.save(items); } },
    remove(id) { cart.save(cart.get().filter((i) => i.id !== id)); },
    clear() { cart.save([]); },
    count() { return cart.get().reduce((s, i) => s + i.qty, 0); },
    updateBadge() { document.querySelectorAll('[data-cart-count]').forEach((el) => { const c = cart.count(); el.textContent = c; el.style.display = c > 0 ? '' : 'none'; }); }
  };

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

  // ---------- GLOBAL CHECKOUT MODAL ----------
  function ensureCheckoutModal() {
    let el = document.getElementById('globalCheckoutModal');
    if (el) return el;
    const div = document.createElement('div');
    div.id = 'globalCheckoutModal';
    div.className = 'modal';
    div.innerHTML = `
      <div class="modal__sheet">
        <div class="modal__head">
          <div><h3 class="modal__title">Checkout</h3><p class="modal__sub" id="globalCheckoutCount">0 items</p></div>
          <button class="modal__close" data-modal-close="globalCheckoutModal"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <form id="globalCheckoutForm" class="flex-col gap-3">
          <div class="field"><label class="field__label">Full Name</label><input type="text" name="fullName" class="field__input" required /></div>
          <div class="field"><label class="field__label">Email</label><input type="email" name="email" class="field__input" required /></div>
          <div class="field"><label class="field__label">Phone Number</label><input type="tel" name="phone" class="field__input" required /></div>
          <div class="field"><label class="field__label">Delivery Address</label><textarea name="address" class="field__input" required rows="2"></textarea></div>
          <div class="flex justify-between items-center p-3 mt-2" style="background:var(--color-elevated); border-radius:var(--radius);">
            <span class="text-muted">Total Amount</span><span class="text-gold font-bold" id="globalCheckoutTotal">₦0</span>
          </div>
          <button type="submit" class="btn btn--primary w-full mt-2">Pay with Paystack</button>
        </form>
      </div>`;
    document.body.appendChild(div);
    document.getElementById('globalCheckoutForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      await form.submit(e.target, async (data) => {
        const res = await api.post('/orders/checkout', { ...data, items: window._globalCheckoutItems });
        window.location.href = res.data.authorization_url;
      });
    });
    modal.bind();
    return div;
  }

  function openGlobalCheckout(items, total) {
    ensureCheckoutModal();
    document.getElementById('globalCheckoutCount').textContent = `${items.length} item(s)`;
    document.getElementById('globalCheckoutTotal').textContent = naira(total);
    window._globalCheckoutItems = items;
    modal.open('globalCheckoutModal');
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
            <div><div class="brand__name">OPEN<span>TECH</span></div><span class="brand__sub">Kano · Nigeria</span></div>
          </a>
          <nav class="header-nav">
            <a href="/" class="header-nav__link ${isHome ? 'active' : ''}"><i class="fa-solid fa-house"></i><span data-i18n="nav_home">Gida</span></a>
            <a href="/academy" class="header-nav__link ${isAcademy ? 'active' : ''}"><i class="fa-solid fa-graduation-cap"></i><span data-i18n="nav_courses">Kwasa-kwasai</span></a>
            <a href="/store" class="header-nav__link ${isStore ? 'active' : ''}"><i class="fa-solid fa-store"></i><span data-i18n="nav_store">Shago</span></a>
            <a href="/innovations" class="header-nav__link ${isInno ? 'active' : ''}"><i class="fa-solid fa-microchip"></i><span data-i18n="nav_projects">Ayyukanmu</span></a>
          </nav>
          <div class="header-actions">
            <a href="/cart" class="icon-btn" aria-label="Cart"><i class="fa-solid fa-cart-shopping"></i><span class="cart-badge" data-cart-count style="display:none">0</span></a>
            <button id="accountBtn" class="icon-btn" aria-label="Account"><i class="fa-solid fa-user"></i></button>
            <button class="icon-btn menu-toggle" id="menuToggleBtn" aria-label="Menu"><i class="fa-solid fa-bars"></i></button>
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
            <div style="margin:16px 0; height:1px; background:var(--color-border);"></div>
            <button class="sidebar-link" id="mobileLangBtn" style="border:none; background:none; text-align:left; cursor:pointer;"><i class="fa-solid fa-language"></i> <span id="mobileLangText">HAUSA / ENGLISH</span></button>
            <a href="/account" class="sidebar-link"><i class="fa-solid fa-user"></i> <span data-i18n="nav_account">Asusuna</span></a>
          </nav>
        </div>
      </div>`;

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
      </footer>`;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);

    modal.bind(); cart.updateBadge();

    const menuBtn = document.getElementById('menuToggleBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebarOverlay');
    if (menuBtn && sidebarOverlay) {
      menuBtn.addEventListener('click', () => sidebarOverlay.classList.add('is-open'));
      closeSidebarBtn.addEventListener('click', () => sidebarOverlay.classList.remove('is-open'));
      sidebarOverlay.addEventListener('click', (e) => { if (e.target === sidebarOverlay) sidebarOverlay.classList.remove('is-open'); });
    }

    const mobileLangBtn = document.getElementById('mobileLangBtn');
    if (mobileLangBtn) mobileLangBtn.addEventListener('click', () => i18n.toggle());

    const accountBtn = document.getElementById('accountBtn');
    if (accountBtn) {
      accountBtn.addEventListener('click', async (e) => {
        e.preventDefault(); const originalHTML = accountBtn.innerHTML; accountBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        const isAuth = await auth.checkAccess(); if (isAuth) window.location.href = '/account'; accountBtn.innerHTML = originalHTML;
      });
    }
  }

  return { api, notify, modal, form, render, naira, i18n, cart, auth, injectChrome, openGlobalCheckout };
})();
window.App = App;
