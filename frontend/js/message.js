(async function() {
  await App.i18n.init(); App.injectChrome();
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type') || 'info';
  const title = params.get('title') || 'Message';
  const text = params.get('text') || '';
  const back = params.get('back') || '/';
  const backText = params.get('backText') || 'Go Back';

  const iconEl = document.getElementById('msgIcon');
  if (type === 'success') iconEl.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--color-success-text)"></i>';
  else if (type === 'error') iconEl.innerHTML = '<i class="fa-solid fa-circle-exclamation" style="color:var(--color-error-text)"></i>';
  else if (type === 'warning') iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color:var(--color-gold)"></i>';
  else iconEl.innerHTML = '<i class="fa-solid fa-circle-info" style="color:var(--color-gold)"></i>';

  document.getElementById('msgTitle').textContent = title;
  document.getElementById('msgText').textContent = text;
  const btn = document.getElementById('msgBtn');
  btn.href = back;
  btn.textContent = backText;
})();
