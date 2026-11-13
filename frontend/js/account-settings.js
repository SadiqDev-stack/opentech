(async function () {
  const container = document.getElementById('accountContent');
  const user = App.auth.user;
  
  container.innerHTML = `
    <div class="card p-5 mb-6">
      <h3 class="font-bold text-white mb-4 border-b border-surface-border pb-2">Profile Information</h3>
      <form id="profileForm" class="flex-col gap-3">
        <div class="field"><label class="field__label">Full Name</label><input type="text" name="fullName" class="field__input" value="${user.fullName || ''}" required></div>
        <div class="field"><label class="field__label">Email</label><input type="email" class="field__input" value="${user.email || ''}" readonly style="opacity:0.6;"></div>
        <div class="field"><label class="field__label">Phone</label><input type="tel" name="phone" class="field__input" value="${user.phone || ''}" required></div>
        <button type="submit" class="btn btn--primary btn--sm mt-2" style="align-self:flex-start;">Save Changes</button>
      </form>
    </div>
    <div class="card p-5">
      <h3 class="font-bold text-white mb-4 border-b border-surface-border pb-2">Change Password</h3>
      <form id="passwordForm" class="flex-col gap-3">
        <div class="field"><label class="field__label">Current Password</label><input type="password" name="currentPassword" class="field__input" required></div>
        <div class="field"><label class="field__label">New Password</label><input type="password" name="newPassword" class="field__input" minlength="6" required></div>
        <button type="submit" class="btn btn--outline btn--sm mt-2" style="align-self:flex-start;">Update Password</button>
      </form>
    </div>
  `;

  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(e.target, async (data) => {
      const res = await App.api.put('/users/profile', data);
      App.notify.success('Profile updated');
      App.auth.user = res.data;
      document.querySelector('.account-name').textContent = res.data.fullName;
    });
  });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(e.target, async (data) => {
      await App.api.put('/users/password', data);
      App.notify.success('Password updated');
      e.target.reset();
    });
  });
})();
