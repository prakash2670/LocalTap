document.addEventListener('DOMContentLoaded', () => {
  const stats = {
    totalKeystrokes: 0,
    topKeys: [],
    keyOfTheDay: null,
    totalClicks: 0,
    totalScrolls: 0
  };

  // Initialize Chart
  const ctx = document.getElementById('activity-chart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Array.from({length: 24}, (_, i) => `${i}:00`),
      datasets: [
        {
          label: 'Keystrokes',
          data: Array(24).fill(0),
          backgroundColor: 'rgba(79, 70, 229, 0.7)'
        },
        {
          label: 'Mouse Clicks',
          data: Array(24).fill(0),
          backgroundColor: 'rgba(236, 72, 153, 0.7)'
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });

  // Update UI with current stats
  function updateUI() {
    // Update totals
    document.getElementById('total-keystrokes').textContent = stats.totalKeystrokes.toLocaleString();
    document.getElementById('total-clicks').textContent = stats.totalClicks.toLocaleString();
    
    // Update key of the day
    const keyOfDayEl = document.getElementById('key-of-day');
    if (stats.keyOfTheDay) {
      const kotd = stats.topKeys.find(k => k.key === stats.keyOfTheDay);
      if (kotd) {
        keyOfDayEl.textContent = `${kotd.key} (${kotd.count.toLocaleString()})`;
      } else {
        keyOfDayEl.textContent = stats.keyOfTheDay;
      }
    } else {
      keyOfDayEl.textContent = 'None';
    }
    
    // Update top keys
    const topKeysContainer = document.getElementById('top-keys-container');
    topKeysContainer.innerHTML = '';
    stats.topKeys.forEach(key => {
      const keyElement = document.createElement('div');
      keyElement.className = 'bg-gray-100 p-2 rounded text-center';
      keyElement.innerHTML = `
        <div class="font-bold">${key.key}</div>
        <div class="text-sm">${key.count.toLocaleString()}</div>
      `;
      topKeysContainer.appendChild(keyElement);
    });
    
    // Update chart (current hour)
    const hour = new Date().getHours();
    chart.data.datasets[0].data[hour] = stats.totalKeystrokes;
    chart.data.datasets[1].data[hour] = stats.totalClicks;
    chart.update();
  }

  // Handle incoming events
  window.electronAPI.receive('key-pressed', (data) => {
    stats.totalKeystrokes = data.total;
    updateUI();
  });

  window.electronAPI.receive('mouse-click', (data) => {
    stats.totalClicks = data.total;
    updateUI();
  });

  window.electronAPI.receive('stats-update', (data) => {
    stats.totalKeystrokes = data.total_keystrokes;
    stats.topKeys = data.top_keys;
    stats.keyOfTheDay = data.key_of_the_day;
    stats.totalClicks = data.total_clicks;
    updateUI();
  });

  // Initial UI update
  updateUI();
});