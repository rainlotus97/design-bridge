const SERVER_URL = 'http://127.0.0.1:23851';

async function checkStatus() {
  const statusEl = document.getElementById('status');
  statusEl.className = 'status-badge';
  statusEl.innerText = '检测中...';

  try {
    const res = await fetch(`${SERVER_URL}/health`);
    const data = await res.json();
    if (data.status === 'ok') {
      statusEl.className = 'status-badge status-online';
      statusEl.innerText = '🟢 本地服务在线';
      return;
    }
  } catch {
    // Offline
  }

  statusEl.className = 'status-badge status-offline';
  statusEl.innerText = '🔴 服务未启动 (23851)';
}

document.getElementById('open-web-btn').onclick = () => {
  chrome.tabs.create({ url: `${SERVER_URL}/` });
};

document.getElementById('check-btn').onclick = () => {
  checkStatus();
};

checkStatus();
