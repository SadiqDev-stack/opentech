(async function () {
  await App.i18n.init(); 
  App.injectChrome();
  
  const form = document.getElementById('forgotForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(form, async (data) => {
      const res = await App.api.post('/auth/forgot-password', data);
      window.location.href = '/message?type=success&title=Password Reset&text=Your password has been updated successfully. You can now log in.&back=/login';
    });
  });
})();
