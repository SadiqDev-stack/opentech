(async function() {
  await App.i18n.init(); App.injectChrome();
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    App.notify.info('Registration API will be connected in Stage 3.');
  });
})();
