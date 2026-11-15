(async function () {
  await App.i18n.init();
  App.injectChrome();
  const form = document.getElementById('forgotForm');
  const token = new URLSearchParams(window.location.search).get('token');
  const passwordField = document.getElementById('newPasswordField');
  const passwordInput = document.getElementById('resetPassword');
  const status = document.getElementById('resetStatus');
  const help = document.getElementById('resetHelp');
  const button = form.querySelector('[type=submit]');
  const emailInput = form.querySelector('[name=email]');

  if (token) {
    form.dataset.resetToken = token;
    passwordField.hidden = false;
    passwordInput.required = true;
    emailInput.required = false;
    emailInput.closest('.field').hidden = true;
    help.textContent = 'Choose a new password. This link can only be used once.';
    button.textContent = 'Update password';
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    await App.form.submit(form, async (data) => {
      if (token) {
        await App.api.post('/auth/reset-password', { token, password: data.password });
        status.textContent = 'Password updated. You can now log in.';
        form.hidden = true;
        help.textContent = '';
        history.replaceState({}, document.title, '/forgot-password');
      } else {
        const response = await App.api.post('/auth/forgot-password', { email: data.email });
        status.textContent = response.message || 'If that email exists, a reset link has been sent.';
        form.reset();
      }
    });
  });
})();
