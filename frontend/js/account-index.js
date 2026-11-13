(async function () {
  const container = document.getElementById('accountContent');
  try {
    const res = await App.api.get('/dashboard/summary');
    const { counts, recentActivity } = res.data;
    
    container.innerHTML = `
      <div class="grid-2 mb-6" style="grid-template-columns: repeat(2, 1fr); gap:16px;">
        <div class="card p-4" style="text-align:center;"><span class="text-muted text-xs block mb-1">Orders</span><span class="stat__value text-white" style="font-size:24px;">${counts.orders}</span></div>
        <div class="card p-4" style="text-align:center;"><span class="text-muted text-xs block mb-1">Courses</span><span class="stat__value text-gold" style="font-size:24px;">${counts.courses}</span></div>
        <div class="card p-4" style="text-align:center;"><span class="text-muted text-xs block mb-1">Requests</span><span class="stat__value text-white" style="font-size:24px;">${counts.requests}</span></div>
        <div class="card p-4" style="text-align:center;"><span class="text-muted text-xs block mb-1">Reports</span><span class="stat__value text-white" style="font-size:24px;">${counts.reports}</span></div>
      </div>
      <div class="card p-4">
        <h3 class="font-bold text-white mb-3 border-b border-surface-border pb-2">Recent Activity</h3>
        ${recentActivity.length === 0 ? '<p class="text-muted text-sm">No recent activity.</p>' : 
          recentActivity.map(a => `
            <div class="flex justify-between items-center p-2" style="border-bottom:1px solid var(--color-border); font-size:14px;">
              <span class="text-white">${a.text}</span>
              <span class="text-muted text-xs">${new Date(a.date).toLocaleDateString()}</span>
            </div>
          `).join('')
        }
      </div>
    `;
  } catch (err) {
    container.innerHTML = App.render.empty('fa-exclamation-circle', 'Failed to load overview.');
  }
})();
