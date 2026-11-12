/* ============================================================
   OpenTech — core.js
   Single shared module for every page.
   Namespaces: App.api, App.auth, App.notify, App.modal,
               App.form, App.render, App.i18n, App.naira,
               App.cart, App.hydrateChrome
   ============================================================ */

const App = (() => {
  const API_BASE = '/api';

  // ---------- API ----------
  async function request(method, path, body, options = {}) {
    const url = path.startsWith('http') ? path : API_BASE + path;
    const fetchOptions = {
      method,
      credentials: 'include',
      headers: { Accept: 'application/json' },
      ...options
    };
    if (body !== undefined && !(body instanceof FormData)) {
      fetchOptions.headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(body);
    } else if (body instanceof FormData) {
      fetchOptions.body = body;
    }
    try {
      const res = await fetch(url, fetchOptions);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.message || `Request failed (${res.status})`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    } catch (err) {
      if (!err.status) err.message = err.message || 'Network error';
      throw err;
    }
  }

  const api = {
    get: (p, o) => request('GET', p, undefined, o),
    post: (p, b, o) => request('POST', p, b, o),
    put: (p, b, o) => request('PUT', p, b, o),
    del: (p, o) => request('DELETE', p, undefined, o)
  };

  // ---------- Notify (single toast) ----------
  function ensureToastHost() {
    let host = document.getElementById('app-toast');
    if (!host) {
      host = document.createElement('div');
      host.id = 'app-toast';
      host.className = 'toast-overlay';
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

    toastEl.classList.remove('toast--success', 'toast--error');
    if (type === 'success') { toastEl.classList.add('toast--success'); iconEl.className = 'fa-solid fa-circle-check'; }
    else if (type === 'error') { toastEl.classList.add('toast--error'); iconEl.className = 'fa-solid fa-circle-exclamation'; }
    else if (type === 'warning') { iconEl.className = 'fa-solid fa-triangle-exclamation'; }
    else { iconEl.className = 'fa-solid fa-circle-info'; }

    msgEl.textContent = message;
    host.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => host.classList.remove('is-visible'), 2800);
  }
  notify.success = (m) => notify(m, 'success');
  notify.error = (m) => notify(m, 'error');
  notify.warning = (m) => notify(m, 'warning');
  notify.info = (m) => notify(m, 'info');

  // ---------- Modal ----------
  const modal = {
    open(id) {
      const el = typeof id === 'string' ? document.getElementById(id) : id;
      if (!el) return;
      el.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    },
    close(id) {
      const el = typeof id === 'string' ? document.getElementById(id) : id;
      if (!el) return;
      el.classList.remove('is-open');
      if (!document.querySelector('.modal.is-open')) document.body.style.overflow = '';
    },
    bind() {
      document.addEventListener('click', (e) => {
        const closer = e.target.closest('[data-modal-close]');
        if (closer) {
          const id = closer.getAttribute('data-modal-close');
          modal.close(id);
        }
        const opener = e.target.closest('[data-modal-open]');
        if (opener) {
          const id = opener.getAttribute('data-modal-open');
          modal.open(id);
        }
        if (e.target.classList.contains('modal')) {
          modal.close(e.target);
        }
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          document.querySelectorAll('.modal.is-open').forEach((m) => modal.close(m));
        }
      });
    }
  };

  // ---------- Form helper ----------
  const form = {
    async submit(formEl, handler, opts = {}) {
      if (!formEl) return;
      const submitBtn = formEl.querySelector('[type="submit"]');
      const originalHTML = submitBtn ? submitBtn.innerHTML : null;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      }
      try {
        const formData = new FormData(formEl);
        const payload = Object.fromEntries(formData.entries());
        await handler(payload, formEl);
      } catch (err) {
        notify.error(err.message || 'Something went wrong');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (originalHTML !== null) submitBtn.innerHTML = originalHTML;
        }
      }
    }
  };

  // ---------- Render helpers ----------
  const render = {
    skeletonCards(count = 3) {
      return Array.from({ length: count }).map(() =>
        '<div class="skeleton skeleton--card"></div>'
      ).join('');
    },
    empty(icon = 'fa-inbox', text = 'Nothing here yet') {
      return `<div class="empty"><i class="fa-solid ${icon}"></i><p>${text}</p></div>`;
    },
    escape(str) {
      return String(str ?? '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }
  };

  // ---------- Naira ----------
  function naira(amount) {
    const value = Number(amount) || 0;
    return '₦' + value.toLocaleString('en-NG');
  }

  // ---------- i18n ----------
  const i18n = {
    lang: 'ha',
    dict: {},
    async init() {
      const saved = localStorage.getItem('opentech_lang');
      i18n.lang = saved === 'en' ? 'en' : 'ha';
      await i18n.load(i18n.lang);
      i18n.apply();
      i18n.updateSwitch();
      document.documentElement.lang = i18n.lang;
    },
    async load(lang) {
      try {
        const res = await fetch(`/languages/${lang}.json`);
        i18n.dict = await res.json();
      } catch {
        i18n.dict = {};
      }
    },
    async set(lang) {
      i18n.lang = lang === 'en' ? 'en' : 'ha';
      localStorage.setItem('opentech_lang', i18n.lang);
      await i18n.load(i18n.lang);
      i18n.apply();
      i18n.updateSwitch();
      document.documentElement.lang = i18n.lang;
      notify.success(i18n.t('toast_language_changed') || (i18n.lang === 'ha' ? 'An canza harshe' : 'Language switched'));
    },
    t(key, fallback = '') {
      return i18n.dict[key] ?? fallback;
    },
    apply(root = document) {
      root.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const val = i18n.t(key);
        if (val) el.textContent = val;
      });
      root.querySelectorAll('[data-i18n-attr]').forEach((el) => {
        const spec = el.getAttribute('data-i18n-attr'); // e.g. "placeholder:search_ph"
        const [attr, key] = spec.split(':');
        const val = i18n.t(key);
        if (val && attr) el.setAttribute(attr, val);
      });
    },
    updateSwitch() {
      const el = document.getElementById('langCurrentText');
      if (el) el.textContent = i18n.lang === 'ha' ? 'HAUSA' : 'ENGLISH';
    },
    toggle() {
      return i18n.set(i18n.lang === 'ha' ? 'en' : 'ha');
    }
  };

  // ---------- Cart (localStorage) ----------
  const CART_KEY = 'opentech_cart';
  const cart = {
    get() { try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch { return []; } },
    save(items) { localStorage.setItem(CART_KEY, JSON.stringify(items)); cart.updateBadge(); },
    add(item) {
      const items = cart.get();
      const found = items.find((i) => i.id === item.id);
      if (found) found.qty += 1;
      else items.push({ ...item, qty: 1 });
      cart.save(items);
      notify.success((i18n.lang === 'ha' ? 'An saka a keken: ' : 'Added to cart: ') + item.name);
    },
    remove(id) { cart.save(cart.get().filter((i) => i.id !== id)); },
    clear() { cart.save([]); },
    count() { return cart.get().reduce((s, i) => s + i.qty, 0); },
    updateBadge() {
      document.querySelectorAll('[data-cart-count]').forEach((el) => {
        const c = cart.count();
        el.textContent = c;
        el.style.display = c > 0 ? '' : 'none';
      });
    }
  };

  // ---------- Auth ----------
  const auth = {
    user: null,
    async me() {
      try {
        const res = await api.get('/auth/me');
        auth.user = res?.data?.user || null;
      } catch { auth.user = null; }
      return auth.user;
    },
    async logout() {
      try { await api.post('/auth/logout'); } catch {}
      auth.user = null;
      location.href = '/';
    }
  };

  // ---------- Chrome hydration (header lang/cart state) ----------
  function hydrateChrome() {
    modal.bind();
    cart.updateBadge();
    const langBtn = document.getElementById('langToggleBtn');
    if (langBtn) langBtn.addEventListener('click', () => i18n.toggle());
  }

  return { api, notify, modal, form, render, naira, i18n, cart, auth, hydrateChrome };
})();

window.App = App;
