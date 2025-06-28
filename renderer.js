document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI
  let stats = {
    totalKeystrokes: 0,
    topKeys: [],
    keyOfTheDay: null,
    totalClicks: 0,
    totalScrolls: 0
  };

  // Get initial data
  window.electronAPI.invoke('get-initial-stats').then((data) => {
    stats = data;
    updateUI();
  });

  // Event listeners
  window.electronAPI.receive('key-pressed', (data) => {
    stats.totalKeystrokes = data.total;
    updateKey(data.key, data.count);
    updateUI();
  });

  window.electronAPI.receive('stats-update', (data) => {
    stats = {
      totalKeystrokes: data.total_keystrokes,
      topKeys: data.top_keys,
      keyOfTheDay: data.key_of_the_day,
      totalClicks: data.total_clicks,
      totalScrolls: data.total_scrolls
    };
    updateUI();
  });

  // UI Update functions
  function updateUI() {
    updateTotalCounters();
    updateTopKeys();
    updateKeyOfTheDay();
  }

  function updateTotalCounters() {
    document.getElementById('total-keystrokes').textContent = 
      stats.totalKeystrokes.toLocaleString();
    document.getElementById('total-clicks').textContent = 
      stats.totalClicks.toLocaleString();
  }

  function updateTopKeys() {
    const container = document.getElementById('top-keys-container');
    container.innerHTML = '';
    
    stats.topKeys.forEach((keyData, index) => {
      const keyElement = document.createElement('div');
      keyElement.className = 'key-item';
      keyElement.innerHTML = `
        <div class="key-badge">${keyData.key}</div>
        <div class="key-count">${keyData.count}</div>
      `;
      container.appendChild(keyElement);
    });
  }

  function updateKeyOfTheDay() {
    if (stats.keyOfTheDay) {
      const kotd = stats.topKeys.find(k => k.key === stats.keyOfTheDay);
      if (kotd) {
        document.getElementById('kotd-key').textContent = kotd.key;
        document.getElementById('kotd-count').textContent = 
          `${kotd.count} presses`;
      }
    }
  }

  function updateKey(key, count) {
    // Find and update the key in topKeys
    let keyIndex = stats.topKeys.findIndex(k => k.key === key);
    if (keyIndex >= 0) {
      stats.topKeys[keyIndex].count = count;
    } else {
      // Add new key if it's not in top 10 yet
      stats.topKeys.push({ key, count });
      stats.topKeys.sort((a, b) => b.count - a.count);
      stats.topKeys = stats.topKeys.slice(0, 10);
    }
    
    // Update key of the day
    if (stats.topKeys.length > 0) {
      stats.keyOfTheDay = stats.topKeys[0].key;
    }
  }
});