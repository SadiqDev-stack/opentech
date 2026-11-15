(async function () {
  await App.i18n.init(); 
  App.injectChrome();
  
  const form = document.getElementById('loginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(form, async (data) => {
      const res = await App.api.post('/auth/login', data);
      App.notify.success('Welcome back!');
      setTimeout(() => window.location.href = '/account', 800);
    });
  });
})();
