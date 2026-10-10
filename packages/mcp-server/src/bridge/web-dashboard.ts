/**
 * Embedded Web Dashboard HTML for zero-install, browser-agnostic usage.
 * Accessible at http://127.0.0.1:23851/
 */
export function getWebDashboardHtml(port: number): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>DesignBridge - 设计待办池与 AI 桥梁</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⚡</text></svg>">
  <style>
    :root {
      --bg: #0B0F19;
      --card-bg: #151D2F;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent: #3B82F6;
      --accent-hover: #2563EB;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
      --success: #10B981;
      --danger: #EF4444;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
    }
    .container {
      width: 100%;
      max-width: 960px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--card-bg);
      padding: 20px 24px;
      border-radius: 16px;
      border: 1px solid var(--card-border);
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 700;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .tabs {
      display: flex;
      gap: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 15px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn.active {
      color: var(--text);
      background: rgba(255, 255, 255, 0.1);
    }
    .card {
      background: var(--card-bg);
      border-radius: 16px;
      border: 1px solid var(--card-border);
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .dropzone {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 36px 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      background: rgba(255, 255, 255, 0.02);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .dropzone:hover, .dropzone.dragover {
      border-color: var(--accent);
      background: rgba(59, 130, 246, 0.06);
    }
    .dropzone-icon { font-size: 32px; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    label { font-size: 13px; font-weight: 600; color: #CBD5E1; }
    input, textarea {
      width: 100%;
      background: #0B1120;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: var(--text);
      padding: 10px 14px;
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;
    }
    input:focus, textarea:focus { border-color: var(--accent); }
    textarea { font-family: monospace; resize: vertical; }
    .btn-submit {
      background: var(--accent);
      color: #FFF;
      border: none;
      padding: 12px 24px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-submit:hover { background: var(--accent-hover); }
    .preview-box {
      display: none;
      margin-top: 16px;
      padding: 16px;
      background: #0B1120;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .preview-img {
      max-width: 100%;
      max-height: 240px;
      border-radius: 8px;
      object-fit: contain;
      background: #111;
    }

    /* Inbox List Styles */
    .inbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .btn-danger-outline {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #F87171;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger-outline:hover {
      background: rgba(239, 68, 68, 0.15);
    }
    .inbox-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .inbox-item {
      display: flex;
      align-items: center;
      gap: 16px;
      background: #0B1120;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 12px 16px;
      transition: border-color 0.2s;
    }
    .inbox-item:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }
    .item-badge {
      background: rgba(59, 130, 246, 0.2);
      color: #60A5FA;
      border: 1px solid rgba(59, 130, 246, 0.4);
      font-size: 13px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      white-space: nowrap;
    }
    .item-thumb {
      width: 64px;
      height: 64px;
      border-radius: 8px;
      object-fit: cover;
      background: #1E293B;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .item-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
    }
    .item-notes {
      font-size: 12px;
      color: #93C5FD;
      line-height: 1.4;
    }
    .item-meta {
      font-size: 11px;
      color: var(--text-muted);
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text);
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: background 0.2s;
      white-space: nowrap;
    }
    .btn-action:hover {
      background: rgba(255, 255, 255, 0.15);
    }
    .btn-delete {
      color: #F87171;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.15);
    }
    .empty-state {
      padding: 48px 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">
        <span>⚡</span> DesignBridge 待办中心
      </div>
      <div class="badge">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); display: inline-block;"></span>
        服务就绪 (Port: ${port})
      </div>
    </div>

    <div class="tabs">
      <button id="tab-inbox-btn" class="tab-btn active">📋 设计待办池 (<span id="inbox-count">0</span>)</button>
      <button id="tab-add-btn" class="tab-btn">➕ 提交新设计</button>
    </div>

    <!-- Section 1: Inbox List -->
    <div id="section-inbox" class="card">
      <div class="inbox-header">
        <div>
          <h3 style="font-size: 15px; font-weight: 600;">已保存的设计任务池</h3>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            在 Antigravity 聊天中，您可直接说：<strong>“实现设计 #1”</strong> 或 <strong>“删除设计 #2”</strong>
          </div>
        </div>
        <button id="clear-all-btn" class="btn-danger-outline">🧹 清空待办池</button>
      </div>

      <div id="inbox-list" class="inbox-list">
        <div class="empty-state">正在加载待办设计...</div>
      </div>
    </div>

    <!-- Section 2: Add Design Form -->
    <div id="section-add" class="card" style="display: none;">
      <div class="form-group">
        <label>📸 1. 截图粘贴 / 上传 (可在此页面任意位置直接按 Ctrl+V 粘贴截图)</label>
        <div id="dropzone" class="dropzone">
          <div class="dropzone-icon">📋</div>
          <div style="font-weight: 500;" id="dropzone-text">点击此处选择图片，或直接在页面任意处按下 Ctrl+V 粘贴截图</div>
          <div style="font-size: 12px; color: var(--text-muted);">截图将自动编入待办池，供后续随时指定调用</div>
          <input type="file" id="file-input" accept="image/*" style="display: none;" />
        </div>
        <div id="preview-box" class="preview-box">
          <img id="preview-img" class="preview-img" alt="截图预览" />
        </div>
      </div>

      <div class="form-group">
        <label>🏷️ 2. 设计名称 / 标题 (可选)</label>
        <input id="name-input" type="text" placeholder="例如：船舶监控卡片、登录弹窗、数据表格..." />
      </div>

      <div class="form-group">
        <label>📐 3. SVG 代码 (可选，用于提取精确背景渐变色、滤镜与圆角)</label>
        <textarea id="svg-input" rows="3" placeholder="在此粘贴 MasterGo / Figma 复制出的 SVG 代码..."></textarea>
      </div>

      <div class="form-group">
        <label>📝 4. 需求备注 / 个性化规则 (可选)</label>
        <input id="notes-input" type="text" placeholder="例如：采用 Vue 3 + Tailwind 实现，经纬度指标为动态组件传参..." />
      </div>

      <button id="submit-btn" class="btn-submit">
        <span>📥</span> 加入设计待办池
      </button>
    </div>
  </div>

  <script>
    let currentBase64 = '';
    const tabInboxBtn = document.getElementById('tab-inbox-btn');
    const tabAddBtn = document.getElementById('tab-add-btn');
    const sectionInbox = document.getElementById('section-inbox');
    const sectionAdd = document.getElementById('section-add');
    const inboxList = document.getElementById('inbox-list');
    const inboxCount = document.getElementById('inbox-count');
    const clearAllBtn = document.getElementById('clear-all-btn');

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const previewBox = document.getElementById('preview-box');
    const previewImg = document.getElementById('preview-img');
    const dropzoneText = document.getElementById('dropzone-text');
    const submitBtn = document.getElementById('submit-btn');

    // Switch Tabs
    tabInboxBtn.onclick = () => {
      tabInboxBtn.classList.add('active');
      tabAddBtn.classList.remove('active');
      sectionInbox.style.display = 'flex';
      sectionAdd.style.display = 'none';
      loadInbox();
    };
    tabAddBtn.onclick = () => {
      tabAddBtn.classList.add('active');
      tabInboxBtn.classList.remove('active');
      sectionAdd.style.display = 'flex';
      sectionInbox.style.display = 'none';
    };

    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleImageFile(file);
    };

    // Paste event handler
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
            tabAddBtn.click(); // switch to add view
          }
        }
      }
    });

    function handleImageFile(file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentBase64 = evt.target.result;
        previewImg.src = currentBase64;
        previewBox.style.display = 'block';
        dropzoneText.innerHTML = '✅ 已载入截图 (' + Math.round(file.size / 1024) + ' KB) - 点击或再次粘贴可替换';
        dropzone.style.borderColor = 'var(--success)';
      };
      reader.readAsDataURL(file);
    }

    // Submit new design to inbox
    submitBtn.onclick = () => {
      const name = document.getElementById('name-input').value.trim();
      const svgText = document.getElementById('svg-input').value.trim();
      const notes = document.getElementById('notes-input').value.trim();

      if (!currentBase64 && !svgText) {
        alert('请至少粘贴一张设计截图，或粘贴 SVG 矢量代码！');
        return;
      }

      const finalBase64 = currentBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      submitBtn.innerText = '正在存入待办池...';
      submitBtn.disabled = true;

      fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web-dashboard',
          meta: { name: name || '未命名设计' },
          image: { base64: finalBase64 },
          vector: { svgRaw: svgText },
          userNotes: notes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Reset form
          currentBase64 = '';
          previewBox.style.display = 'none';
          document.getElementById('name-input').value = '';
          document.getElementById('svg-input').value = '';
          document.getElementById('notes-input').value = '';
          dropzoneText.innerHTML = '点击此处选择图片，或直接在页面任意处按下 Ctrl+V 粘贴截图';
          dropzone.style.borderColor = 'rgba(255, 255, 255, 0.2)';

          tabInboxBtn.click(); // switch back to inbox
        } else {
          alert('存入失败: ' + (data.error || '未知错误'));
        }
      })
      .catch(err => {
        alert('网络请求失败: ' + err.message);
      })
      .finally(() => {
        submitBtn.innerHTML = '<span>📥</span> 加入设计待办池';
        submitBtn.disabled = false;
      });
    };

    // Load Inbox Items
    function loadInbox() {
      fetch('/api/inbox')
        .then(res => res.json())
        .then(items => {
          inboxCount.innerText = items.length;
          inboxList.innerHTML = '';
          if (items.length === 0) {
            inboxList.innerHTML = '<div class="empty-state">📭 待办池为空。<br/><button id="btn-quick-add" class="btn-action" style="margin-top: 10px;">➕ 立即粘贴添加设计</button></div>';
            const quickAdd = document.getElementById('btn-quick-add');
            if (quickAdd) quickAdd.onclick = () => tabAddBtn.click();
            return;
          }

          items.forEach(item => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString();

            const card = document.createElement('div');
            card.className = 'inbox-item';

            const badge = document.createElement('span');
            badge.className = 'item-badge';
            badge.textContent = '#' + item.index;

            const thumb = document.createElement('img');
            thumb.className = 'item-thumb';
            thumb.src = '/api/image/' + encodeURIComponent(item.id);
            thumb.alt = 'thumb';
            thumb.onerror = () => { thumb.style.display = 'none'; };

            const content = document.createElement('div');
            content.className = 'item-content';

            const title = document.createElement('div');
            title.className = 'item-title';
            title.textContent = item.meta.name || '未命名设计';
            content.appendChild(title);

            if (item.userNotes) {
              const notes = document.createElement('div');
              notes.className = 'item-notes';
              notes.textContent = '📝 ' + item.userNotes;
              content.appendChild(notes);
            }

            const meta = document.createElement('div');
            meta.className = 'item-meta';
            meta.textContent = 'ID: ' + item.id + ' · 时间: ' + timeStr;
            content.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'item-actions';

            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn-action btn-copy';
            copyBtn.setAttribute('data-index', String(item.index));
            copyBtn.textContent = '📋 复制指令';

            const delBtn = document.createElement('button');
            delBtn.className = 'btn-action btn-delete';
            delBtn.setAttribute('data-id', item.id);
            delBtn.textContent = '🗑️ 删除';

            actions.appendChild(copyBtn);
            actions.appendChild(delBtn);

            card.appendChild(badge);
            card.appendChild(thumb);
            card.appendChild(content);
            card.appendChild(actions);

            inboxList.appendChild(card);
          });
        })
        .catch(err => {
          inboxList.innerHTML = '<div class="empty-state">加载失败: ' + err.message + '</div>';
        });
    }

    inboxList.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      if (btn.classList.contains('btn-delete')) {
        const id = btn.getAttribute('data-id');
        if (id && confirm('确认删除该设计项？')) {
          fetch('/api/capture/' + id, { method: 'DELETE' }).then(() => loadInbox());
        }
      } else if (btn.classList.contains('btn-copy')) {
        const index = btn.getAttribute('data-index');
        if (index) {
          const text = '帮我实现设计 #' + index;
          navigator.clipboard.writeText(text).then(() => {
            alert('已复制指令到剪贴板：\\n\\n"' + text + '"\\n\\n直接粘贴发送给 Antigravity AI 即可！');
          });
        }
      }
    });

    clearAllBtn.onclick = () => {
      if (!confirm('确定要清空全部待办设计吗？此操作将删除所有本地设计缓存。')) return;
      fetch('/api/clear', { method: 'POST' })
        .then(() => loadInbox());
    };

    function escapeHtml(str) {
      return (str || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
    }

    // Initial load
    loadInbox();
  </script>
</body>
</html>`;
}
