(async function () {
  await App.i18n.init(); 
  // No injectChrome here, admin login is standalone
  
  const form = document.getElementById('adminLoginForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(form, async (data) => {
      const res = await App.api.post('/auth/admin-login', data);
      window.location.href = '/message?type=info&title=Check Email&text=We sent a login verification link to your admin email.&back=/admin-login';
    });
  });
})();
