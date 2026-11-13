(async function () {
  const container = document.getElementById('accountContent');
  container.innerHTML = `
    <h2 class="section__title mb-2">Submit a Report</h2>
    <p class="text-muted text-sm mb-4">Complaints about payments, orders, courses, or project requests.</p>
    <form id="reportForm" class="card p-5 mb-6">
      <div class="field mb-3"><label class="field__label">Subject</label><input type="text" name="subject" class="field__input" required></div>
      <div class="field mb-3"><label class="field__label">Category</label><select name="category" class="field__input" required><option value="payment">Payments</option><option value="order">Orders</option><option value="course">Courses</option><option value="project">Project Requests</option><option value="other">Other</option></select></div>
      <div class="field mb-3"><label class="field__label">Description</label><textarea name="description" class="field__input" rows="3" required></textarea></div>
      <button type="submit" class="btn btn--primary"><i class="fa-solid fa-paper-plane"></i> Submit Report</button>
    </form>
    <h3 class="font-bold text-white mb-3">Previous Reports</h3>
    <div id="reportsList"><div class="skeleton skeleton--card"></div></div>
  `;

  document.getElementById('reportForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await App.form.submit(e.target, async (data) => {
      await App.api.post('/reports', data);
      App.notify.success('Report submitted');
      e.target.reset();
      loadReports();
    });
  });

  async function loadReports() {
    const list = document.getElementById('reportsList');
    try {
      const res = await App.api.get('/reports/mine');
      if (!res.data || res.data.length === 0) { list.innerHTML = App.render.empty('fa-flag', 'No reports yet.'); return; }
      list.innerHTML = res.data.map(r => `
        <div class="card p-4 mb-3">
          <div class="flex justify-between items-center border-b border-surface-border pb-2 mb-2">
            <div><span class="font-bold text-white">${r.subject}</span><span class="text-muted text-xs block">Category: ${r.category}</span></div>
            <span class="badge ${r.status === 'resolved' ? 'badge--success' : 'badge--error'}">${r.status.toUpperCase()}</span>
          </div>
          <p class="text-muted text-xs mb-2">${r.description}</p>
          ${r.adminResponse ? `<div class="p-3" style="background:var(--color-elevated); border-radius:8px; font-size:12px;"><span class="text-gold font-bold block mb-1">Admin Response</span><p class="text-white m-0">${r.adminResponse}</p></div>` : ''}
        </div>`).join('');
    } catch { list.innerHTML = App.render.empty('fa-exclamation-circle', 'Failed to load reports.'); }
  }
  loadReports();
})();
