(async function () {
  await App.i18n.init(); 
  App.injectChrome();
  
  const form = document.getElementById('registerForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(form, async (data) => {
      const res = await App.api.post('/auth/register', data);
      App.notify.success('Account created!');
      setTimeout(() => window.location.href = '/account', 800);
    });
  });
})();
