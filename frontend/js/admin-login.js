(async function() {
  await App.i18n.init(); // Admin pages usually English, but switch works
  document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    window.location.href = '/message?type=info&title=Check your email&text=We sent an admin verification link to your email.&back=/admin-login';
  });
})();
