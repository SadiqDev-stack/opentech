(async function() {
  await App.i18n.init(); App.injectChrome();
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    App.notify.info('Authentication API will be connected in Stage 3.');
  });
})();
