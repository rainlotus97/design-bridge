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
  <title>DesignBridge - 设计转代码智能体桥梁</title>
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
      max-width: 900px;
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
      max-height: 300px;
      border-radius: 8px;
      object-fit: contain;
      background: #111;
    }
    .mcp-info {
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
      font-size: 13px;
      line-height: 1.6;
    }
    .code-pill {
      background: rgba(0, 0, 0, 0.4);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      color: #93C5FD;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-title">
        <span>⚡</span> DesignBridge Web 捕获中心
      </div>
      <div class="badge">
        <span style="width: 8px; height: 8px; border-radius: 50%; background: var(--success); display: inline-block;"></span>
        服务运行中 (Port: ${port})
      </div>
    </div>

    <div class="mcp-info">
      <strong>💡 无需绝对路径的 MCP Server 配置：</strong><br/>
      由于服务已开启全局 SSE 模式，您的 Antigravity / Cursor 的 MCP 配置中可直接使用 URL 连接，再也不需要硬编码路径：<br/>
      <code class="code-pill">"url": "http://127.0.0.1:${port}/sse"</code>
    </div>

    <div class="card">
      <div class="form-group">
        <label>📸 1. 截图粘贴 / 上传 (可在此页面任意位置直接按 Ctrl+V 粘贴截图)</label>
        <div id="dropzone" class="dropzone">
          <div class="dropzone-icon">📋</div>
          <div style="font-weight: 500;" id="dropzone-text">点击此处选择图片，或直接在页面任意处按下 Ctrl+V 粘贴截图</div>
          <div style="font-size: 12px; color: var(--text-muted);">支持 PNG / JPG 截图，AI 将直接进行高精度多模态识别</div>
          <input type="file" id="file-input" accept="image/*" style="display: none;" />
        </div>
        <div id="preview-box" class="preview-box">
          <img id="preview-img" class="preview-img" alt="截图预览" />
        </div>
      </div>

      <div class="form-group">
        <label>📐 2. SVG 代码 (可选，用于精确提取背景渐变、毛玻璃与圆角)</label>
        <textarea id="svg-input" rows="4" placeholder="在此粘贴 MasterGo / Figma 复制出的 SVG 代码..."></textarea>
      </div>

      <div class="form-group">
        <label>📝 3. 用户个性化要求 / 补充提示 (可选)</label>
        <input id="notes-input" type="text" placeholder="例如：采用 Vue 3 + Tailwind 实现，经纬度指标为动态组件传参..." />
      </div>

      <button id="submit-btn" class="btn-submit">
        <span>🚀</span> 发送给本地 AI 助手
      </button>
    </div>
  </div>

  <script>
    let currentBase64 = '';
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const previewBox = document.getElementById('preview-box');
    const previewImg = document.getElementById('preview-img');
    const dropzoneText = document.getElementById('dropzone-text');
    const submitBtn = document.getElementById('submit-btn');

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
          if (file) handleImageFile(file);
        }
      }
    });

    function handleImageFile(file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentBase64 = evt.target.result;
        previewImg.src = currentBase64;
        previewBox.style.display = 'block';
        dropzoneText.innerHTML = '✅ 已成功载入截图 (' + Math.round(file.size / 1024) + ' KB) - 点击或再次粘贴可替换';
        dropzone.style.borderColor = 'var(--success)';
      };
      reader.readAsDataURL(file);
    }

    submitBtn.onclick = () => {
      const svgText = document.getElementById('svg-input').value.trim();
      const notes = document.getElementById('notes-input').value.trim();

      if (!currentBase64 && !svgText) {
        alert('请至少粘贴一张设计截图，或粘贴 SVG 矢量代码！');
        return;
      }

      const finalBase64 = currentBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      submitBtn.innerText = '正在发送...';
      submitBtn.disabled = true;

      fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'web-dashboard',
          meta: { name: 'Web Dashboard Capture' },
          image: { base64: finalBase64 },
          vector: { svgRaw: svgText },
          userNotes: notes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          alert('🎉 发送成功！\\n\\n已成功缓存至本地，您现在切回 Antigravity 告诉 AI：“将刚刚的设计实现为组件” 即可！');
        } else {
          alert('发送失败: ' + (data.error || '未知错误'));
        }
      })
      .catch(err => {
        alert('网络请求失败: ' + err.message);
      })
      .finally(() => {
        submitBtn.innerHTML = '<span>🚀</span> 发送给本地 AI 助手';
        submitBtn.disabled = false;
      });
    };
  </script>
</body>
</html>`;
}
