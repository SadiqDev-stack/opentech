(async function () {
  await App.i18n.init(); 
  App.injectChrome();
  
  const form = document.getElementById('forgotForm');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(form, async (data) => {
      await new Promise(r => setTimeout(r, 1000)); // Fake delay
      App.notify.success('Reset link sent to your email!');
      // Redirect to message page
      window.location.href = '/message?type=success&title=Check your email&text=We sent a reset link to ' + data.email + '. Click the link to activate your new password.&back=/login';
    });
  });
})();
