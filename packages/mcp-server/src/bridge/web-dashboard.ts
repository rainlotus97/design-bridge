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
      --warning: #F59E0B;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px;
    }
    .container {
      width: 100%;
      max-width: 1020px;
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
      padding: 4px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 500;
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .tabs {
      display: flex;
      gap: 8px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 8px;
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 14px;
      font-weight: 600;
      padding: 9px 18px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-btn:hover {
      color: var(--text);
      background: rgba(255, 255, 255, 0.05);
    }
    .tab-btn.active {
      color: var(--text);
      background: rgba(59, 130, 246, 0.15);
      color: #60A5FA;
      border: 1px solid rgba(59, 130, 246, 0.3);
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
    .inbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      gap: 12px;
      flex-wrap: wrap;
    }
    .filter-tabs {
      display: flex;
      gap: 6px;
      background: rgba(0, 0, 0, 0.25);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }
    .filter-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn.active {
      background: rgba(255, 255, 255, 0.12);
      color: var(--text);
      font-weight: 600;
    }
    .btn-danger-outline {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-danger-outline:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.6);
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
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 14px 18px;
      transition: all 0.2s;
    }
    .inbox-item:hover {
      border-color: rgba(59, 130, 246, 0.4);
      background: rgba(255, 255, 255, 0.05);
    }
    .item-badge {
      font-size: 12px;
      font-weight: 700;
      color: #93C5FD;
      background: rgba(59, 130, 246, 0.15);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(59, 130, 246, 0.3);
      font-family: monospace;
      white-space: nowrap;
    }
    .item-thumb {
      width: 72px;
      height: 72px;
      object-fit: cover;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: #0B0F19;
      flex-shrink: 0;
    }
    .item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 5px;
      min-width: 0;
    }
    .item-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .item-title {
      font-size: 15px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-pill {
      font-size: 11px;
      padding: 2px 7px;
      border-radius: 4px;
      font-weight: 500;
      white-space: nowrap;
    }
    .status-pending {
      background: rgba(59, 130, 246, 0.15);
      color: #60A5FA;
      border: 1px solid rgba(59, 130, 246, 0.3);
    }
    .status-completed {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .item-notes {
      font-size: 12px;
      color: #CBD5E1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .item-meta {
      font-size: 11px;
      color: var(--text-muted);
      font-family: monospace;
    }
    .item-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }
    .btn-action {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: var(--text);
      padding: 7px 12px;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .btn-action:hover {
      background: rgba(255, 255, 255, 0.14);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .btn-action.btn-copy {
      background: rgba(59, 130, 246, 0.2);
      border-color: rgba(59, 130, 246, 0.4);
      color: #93C5FD;
    }
    .btn-action.btn-copy:hover {
      background: rgba(59, 130, 246, 0.35);
    }
    .btn-action.copied {
      background: rgba(16, 185, 129, 0.25) !important;
      border-color: rgba(16, 185, 129, 0.5) !important;
      color: #34D399 !important;
    }
    .btn-action.btn-delete:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.4);
      color: #F87171;
    }
    .dropzone {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 32px 24px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .dropzone:hover {
      border-color: var(--accent);
      background: rgba(59, 130, 246, 0.05);
    }
    .dropzone-icon { font-size: 32px; }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    label { font-size: 13px; font-weight: 600; color: #CBD5E1; }
    input, textarea, select {
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
    input:focus, textarea:focus, select:focus { border-color: var(--accent); }
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
      text-align: center;
    }
    .preview-img {
      max-width: 100%;
      max-height: 240px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .empty-state {
      padding: 48px 24px;
      text-align: center;
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
    }
    .tools-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }
    .tool-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .tool-card-title {
      font-size: 15px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tool-card-desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
    }
    .code-pill {
      background: #0B1120;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 6px 10px;
      font-family: monospace;
      font-size: 12px;
      color: #93C5FD;
      display: flex;
      justify-content: space-between;
      align-items: center;
      word-break: break-all;
    }

    /* Custom Toast Container */
    #toast-container {
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 999999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    }
    .toast {
      pointer-events: auto;
      background: #151D2F;
      color: var(--text);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 12px 18px;
      font-size: 13px;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
      animation: toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      transition: all 0.2s;
      max-width: 440px;
    }
    .toast.toast-success {
      border-color: rgba(16, 185, 129, 0.4);
      background: rgba(16, 185, 129, 0.15);
      color: #ECFDF5;
    }
    .toast.toast-error {
      border-color: rgba(239, 68, 68, 0.4);
      background: rgba(239, 68, 68, 0.15);
      color: #FEF2F2;
    }
    .toast.toast-info {
      border-color: rgba(59, 130, 246, 0.4);
      background: rgba(59, 130, 246, 0.15);
      color: #EFF6FF;
    }
    @keyframes toastSlideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    /* Custom Modal Component */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      padding: 20px;
    }
    .modal-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }
    .modal-card {
      background: #151D2F;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 16px;
      padding: 24px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      transform: scale(0.95);
      transition: transform 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .modal-card.modal-lg {
      max-width: 860px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-backdrop.show .modal-card {
      transform: scale(1);
    }
    .modal-title {
      font-size: 17px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .modal-body {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.6;
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      margin-top: 8px;
      flex-wrap: wrap;
    }
    .btn-modal-cancel {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: var(--text);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.2s;
    }
    .btn-modal-cancel:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    .btn-modal-confirm {
      background: var(--accent);
      border: none;
      color: #fff;
      padding: 8px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: opacity 0.2s;
    }
    .btn-modal-confirm.danger {
      background: var(--danger);
    }
    .btn-modal-confirm:hover {
      opacity: 0.9;
    }

    /* Edit Modal Grid */
    .edit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    @media (max-width: 768px) {
      .edit-grid { grid-template-columns: 1fr; }
    }
    .color-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0B0F19;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      padding: 3px 8px;
      font-size: 11px;
      font-family: monospace;
    }
    .color-chip-box {
      width: 14px;
      height: 14px;
      border-radius: 3px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>
  <!-- Toast Notification Root -->
  <div id="toast-container"></div>

  <!-- Custom Confirmation Modal Root -->
  <div id="custom-modal" class="modal-backdrop">
    <div class="modal-card">
      <div id="modal-title" class="modal-title">提示</div>
      <div id="modal-body" class="modal-body">内容</div>
      <div class="modal-actions">
        <button id="modal-cancel-btn" class="btn-modal-cancel">取消</button>
        <button id="modal-confirm-btn" class="btn-modal-confirm">确认</button>
      </div>
    </div>
  </div>

  <!-- Full Visual Design Inspector & Editor Modal -->
  <div id="edit-modal" class="modal-backdrop">
    <div class="modal-card modal-lg">
      <div class="modal-title" style="justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span>✏️</span> 设计资产核验与编辑
          <span id="edit-modal-badge" class="item-badge">🆔 ------</span>
        </div>
        <button id="edit-close-x" style="background: transparent; border: none; color: #94A3B8; font-size: 18px; cursor: pointer;">✕</button>
      </div>

      <div class="edit-grid">
        <!-- Left: Visual Assets Preview -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <!-- Real PNG Image Preview -->
          <div class="form-group">
            <label style="display: flex; justify-content: space-between;">
              <span>🖼️ 高保真截图 (PNG 预览)：</span>
              <a id="edit-img-link" href="#" target="_blank" style="color: #60A5FA; font-size: 11px; text-decoration: none;">🔍 查看原图</a>
            </label>
            <div style="
              background: #0B0F19;
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 8px;
              min-height: 140px;
              max-height: 220px;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            ">
              <img id="edit-img-preview" style="max-width: 100%; max-height: 220px; object-fit: contain;" alt="Image Preview" />
            </div>
            <div id="edit-img-info" style="font-size: 11px; color: var(--text-muted); font-family: monospace;"></div>
          </div>

          <!-- Live Rendered SVG Graphic -->
          <div class="form-group">
            <label>📐 矢量 SVG 实时动态渲染：</label>
            <div style="
              background: #0B0F19;
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 8px;
              min-height: 80px;
              max-height: 160px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 10px;
              overflow: hidden;
            ">
              <div id="edit-svg-render-content" style="max-width: 100%; max-height: 140px;"></div>
            </div>
          </div>

          <!-- Color Token Chips -->
          <div class="form-group">
            <label>🎨 提取到的色彩 Token：</label>
            <div id="edit-colors-list" style="display: flex; flex-wrap: wrap; gap: 6px; min-height: 24px;"></div>
          </div>
        </div>

        <!-- Right: Editable Code & Meta Parameters -->
        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="form-group">
            <label>🏷️ 设计标题 / 组件名称：</label>
            <input id="edit-name-input" type="text" placeholder="例如：船舶监控卡片、登录表单..." />
          </div>

          <div class="form-group">
            <label>📝 需求备注 / 个性化规则：</label>
            <textarea id="edit-notes-input" rows="2" placeholder="例如：采用 Vue 3 + Tailwind 实现，经纬度指标为动态组件传参..."></textarea>
          </div>

          <div class="form-group">
            <label>📌 任务状态：</label>
            <select id="edit-status-select">
              <option value="pending">⏳ 待办处理中 (Pending)</option>
              <option value="completed">✅ 已完成归档 (Completed)</option>
            </select>
          </div>

          <div class="form-group">
            <label>📐 SVG 矢量代码 (可修改，实时更新左侧渲染)：</label>
            <textarea id="edit-svg-input" rows="4" placeholder="SVG 矢量源码..."></textarea>
          </div>

          <div class="form-group">
            <label>🎨 CSS 样式代码 (可修改)：</label>
            <textarea id="edit-css-input" rows="4" placeholder="CSS 属性样式..."></textarea>
          </div>
        </div>
      </div>

      <div class="modal-actions" style="justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
        <button id="edit-copy-prompt-btn" class="btn-action btn-copy" style="padding: 8px 14px;">
          📋 复制完整 AI 指令
        </button>

        <div style="display: flex; gap: 8px;">
          <button id="edit-cancel-btn" class="btn-modal-cancel">取消</button>
          <button id="edit-save-btn" class="btn-modal-confirm">💾 保存修改</button>
        </div>
      </div>
    </div>
  </div>

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
      <button id="tab-tools-btn" class="tab-btn">🛠️ 网页专属直推悬浮窗 (零权限要求)</button>
    </div>

    <!-- Section 1: Inbox List -->
    <div id="section-inbox" class="card">
      <div class="inbox-header">
        <div>
          <h3 style="font-size: 15px; font-weight: 600;">已保存的设计任务池</h3>
          <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
            每一项均有<strong>永久唯一 Git 风格 ID</strong>，点击【📋 复制完整指令】后直接粘贴到 Antigravity 聊天即可！
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div class="filter-tabs">
            <button id="filter-pending" class="filter-btn active">待办中</button>
            <button id="filter-all" class="filter-btn">全部</button>
          </div>
          <button id="clear-all-btn" class="btn-danger-outline">🧹 清空待办池</button>
        </div>
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
        <label>🎨 4. CSS 样式代码 (可选)</label>
        <textarea id="css-input" rows="3" placeholder="在此粘贴 CSS 代码（例如：background, border-radius...）"></textarea>
      </div>

      <div class="form-group">
        <label>📝 5. 需求备注 / 个性化规则 (可选)</label>
        <input id="notes-input" type="text" placeholder="例如：采用 Vue 3 + Tailwind 实现，经纬度指标为动态组件传参..." />
      </div>

      <button id="submit-btn" class="btn-submit">
        <span>📥</span> 加入设计待办池
      </button>
    </div>

    <!-- Section 3: Browser Floating Window & Integration -->
    <div id="section-tools" class="card" style="display: none;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <h3 style="font-size: 16px; font-weight: 600;">网页通用悬浮窗与直推插件 (零权限要求 · 即开即用)</h3>
        <p style="font-size: 13px; color: var(--text-muted);">
          为 MasterGo、Figma 或任意普通网页设计：<strong>无需任何企业插件导入权限</strong>，作为普通团队成员即可使用！
        </p>
      </div>

      <!-- Universal Floating Window Hero Card -->
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <h4 style="font-size: 16px; font-weight: 700; color: #38BDF8; display: flex; align-items: center; gap: 8px;">
            <span>⚡</span> 网页常驻悬浮窗 (支持随意关闭与再次打开 · 随时直接粘贴)
          </h4>
          <span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8; border-color: rgba(56, 189, 248, 0.4);">
            零权限门槛 · 全网页通用
          </span>
        </div>
        <p style="font-size: 13px; color: #CBD5E1; line-height: 1.6;">
          安装扩展程序或油猴脚本后，在 MasterGo、Figma 或任何网页右下角均会常驻 <strong>【⚡ AI 设计待办】悬浮窗</strong>。
          您无需在 MasterGo 里折腾开发者导入权限，直接在网页右键复制图层或按 Ctrl+V，悬浮窗即可<strong>自动识别高清 PNG、矢量 SVG 与 CSS 样式</strong>，实时预览核验，一键推入本地 AI 待办池！
        </p>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.8;">
          <strong>💡 悬浮窗核心特性：</strong><br/>
          • <strong>可关闭 & 随时打开</strong>：点击悬浮窗右上角 <code>✕</code> 或 <code>—</code> 即可收起至右下角；点击 <code>⚡ AI 设计待办</code> 小胶囊或按快捷键 <strong><code>Alt + S</code></strong> 随时再次唤出！<br/>
          • <strong>支持拖拽移动</strong>：按住顶部标题栏可任意拖动，绝不遮挡 MasterGo 画布设计图层；<br/>
          • <strong>直接粘贴核验</strong>：在 MasterGo 右键复制 PNG / SVG / CSS 后，在悬浮窗内按 <code>Ctrl+V</code> 或点击「读取剪贴板」，自动完成装配与动态渲染！
        </div>
      </div>

      <!-- Installation Guide: Chrome Extension -->
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
        <h4 style="font-size: 14px; font-weight: 600; color: #93C5FD;">📦 方式一：加载 Chrome 扩展程序 (推荐 · 包含离线剪贴板读取与全页面悬浮窗)</h4>
        <p style="font-size: 13px; color: var(--text-muted);">
          本地扩展程序源码已就绪，只需在 Chrome 中加载已解压的扩展程序即可：
        </p>
        <div class="code-pill">
          <span id="ext-path-text">D:\\Document\\design-bridge\\plugins\\extension-chrome</span>
          <button id="copy-ext-path-btn" class="btn-action">📋 复制扩展路径</button>
        </div>
        <ol style="font-size: 12px; color: var(--text-muted); line-height: 1.8; margin-left: 20px;">
          <li>在 Chrome 地址栏输入：<code>chrome://extensions</code> 并按回车；</li>
          <li>打开右上角 <strong>「开发者模式」</strong> 开关；</li>
          <li>点击左上角 <strong>「加载已解压的扩展程序」</strong>，选择上面的文件夹路径；</li>
          <li>打开 MasterGo 网页，右下角即可看到 <strong>【⚡ AI 设计待办】悬浮窗</strong>！</li>
        </ol>
      </div>

      <!-- Installation Guide: Userscript -->
      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
        <h4 style="font-size: 14px; font-weight: 600; color: #93C5FD;">📜 方式二：Tampermonkey 油猴脚本 (免装扩展)</h4>
        <p style="font-size: 13px; color: var(--text-muted);">
          若您使用油猴，直接新建脚本并将本地脚本内容粘贴保存即可：
        </p>
        <div class="code-pill">
          <span id="userscript-path-text">D:\\Document\\design-bridge\\plugins\\adapters\\adapter-mastergo\\mastergo-bridge.user.js</span>
          <button id="copy-userscript-path-btn" class="btn-action">📋 复制脚本路径</button>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentBase64 = '';
    let currentFilter = 'pending'; // 'pending' | 'all'
    let editingItemId = null;
    let editingItemShortId = null;
    let editingItemData = null;

    const tabInboxBtn = document.getElementById('tab-inbox-btn');
    const tabAddBtn = document.getElementById('tab-add-btn');
    const tabToolsBtn = document.getElementById('tab-tools-btn');
    const sectionInbox = document.getElementById('section-inbox');
    const sectionAdd = document.getElementById('section-add');
    const sectionTools = document.getElementById('section-tools');
    const inboxList = document.getElementById('inbox-list');
    const inboxCount = document.getElementById('inbox-count');
    const clearAllBtn = document.getElementById('clear-all-btn');
    const filterPendingBtn = document.getElementById('filter-pending');
    const filterAllBtn = document.getElementById('filter-all');

    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const previewBox = document.getElementById('preview-box');
    const previewImg = document.getElementById('preview-img');
    const dropzoneText = document.getElementById('dropzone-text');
    const submitBtn = document.getElementById('submit-btn');

    const toastContainer = document.getElementById('toast-container');
    const customModal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalConfirmBtn = document.getElementById('modal-confirm-btn');
    const modalCancelBtn = document.getElementById('modal-cancel-btn');
    let activeModalConfirmCallback = null;

    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editModalBadge = document.getElementById('edit-modal-badge');
    const editCloseX = document.getElementById('edit-close-x');
    const editImgPreview = document.getElementById('edit-img-preview');
    const editImgLink = document.getElementById('edit-img-link');
    const editImgInfo = document.getElementById('edit-img-info');
    const editSvgRenderContent = document.getElementById('edit-svg-render-content');
    const editColorsList = document.getElementById('edit-colors-list');
    const editNameInput = document.getElementById('edit-name-input');
    const editNotesInput = document.getElementById('edit-notes-input');
    const editStatusSelect = document.getElementById('edit-status-select');
    const editSvgInput = document.getElementById('edit-svg-input');
    const editCssInput = document.getElementById('edit-css-input');
    const editCopyPromptBtn = document.getElementById('edit-copy-prompt-btn');
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    const editSaveBtn = document.getElementById('edit-save-btn');

    // Toast Functionality
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = 'toast toast-' + type;

      const icon = document.createElement('span');
      icon.textContent = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      toast.appendChild(icon);

      const text = document.createElement('span');
      text.textContent = message;
      toast.appendChild(text);

      toastContainer.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 200);
      }, 3200);
    }

    // Helper: Build Complete Explicit Prompt Command (neutral, universal, no hardcoded tech stack)
    function buildExplicitCommand(shortId, name, notes) {
      const namePart = name ? '（名称：“' + name + '”）' : '';
      const notesPart = notes ? '，需求要点：“' + notes + '”' : '';
      return '请使用 design-bridge MCP 获取设计待办 [ID: ' + shortId + ']' + namePart + '，参考其提取的高保真设计截图、矢量 SVG 与样式 Token' + notesPart + '。';
    }

    // Custom Modal Functionality
    function showConfirmModal(options) {
      modalTitle.textContent = options.title || '提示';
      modalBody.textContent = options.message || '';
      modalConfirmBtn.textContent = options.confirmText || '确定';
      modalCancelBtn.textContent = options.cancelText || '取消';

      if (options.isDanger) {
        modalConfirmBtn.className = 'btn-modal-confirm danger';
      } else {
        modalConfirmBtn.className = 'btn-modal-confirm';
      }

      activeModalConfirmCallback = options.onConfirm || null;
      customModal.classList.add('show');
    }

    function closeModal() {
      customModal.classList.remove('show');
      activeModalConfirmCallback = null;
    }

    modalCancelBtn.onclick = closeModal;
    customModal.onclick = (e) => {
      if (e.target === customModal) closeModal();
    };
    modalConfirmBtn.onclick = () => {
      if (activeModalConfirmCallback) {
        activeModalConfirmCallback();
      }
      closeModal();
    };

    // Live update SVG render in edit modal
    editSvgInput.addEventListener('input', () => {
      const val = editSvgInput.value.trim();
      if (val && val.includes('<svg')) {
        editSvgRenderContent.innerHTML = val;
      } else {
        editSvgRenderContent.innerHTML = '<span style="color:#64748B;font-size:12px;">无 SVG 矢量</span>';
      }
    });

    // Edit Modal Handlers
    function openEditModal(item) {
      editingItemId = item.id;
      editingItemShortId = item.shortId || item.id;
      editingItemData = item;

      editModalBadge.textContent = '🆔 ' + editingItemShortId;
      editNameInput.value = item.meta?.name || '';
      editNotesInput.value = item.userNotes || '';
      editStatusSelect.value = item.status || 'pending';

      const imgSrc = '/api/image/' + encodeURIComponent(item.id);
      editImgPreview.src = imgSrc;
      editImgLink.href = imgSrc;
      editImgInfo.textContent = (item.meta?.width ? item.meta.width + ' × ' + item.meta.height + 'px · ' : '') + '来源: ' + (item.source || '网页');

      // Fetch complete details (including raw SVG and raw CSS from disk)
      fetch('/api/capture/' + encodeURIComponent(item.id))
        .then(res => res.json())
        .then(detail => {
          editingItemData = detail;
          const svgText = detail.svgRaw || '';
          editSvgInput.value = svgText;
          if (svgText && svgText.includes('<svg')) {
            editSvgRenderContent.innerHTML = svgText;
          } else {
            editSvgRenderContent.innerHTML = '<span style="color:#64748B;font-size:12px;">无 SVG 矢量</span>';
          }

          const cssText = detail.cssRaw || '';
          editCssInput.value = cssText;

          // Render colors (handles both string array ['#fff'] and object array [{hex: '#fff'}])
          editColorsList.innerHTML = '';
          const colors = detail.tokens?.colors || [];
          if (colors.length > 0) {
            colors.slice(0, 16).forEach(c => {
              const hex = typeof c === 'string' ? c : (c && (c.hex || c.color) ? (c.hex || c.color) : String(c));
              if (!hex || hex === 'undefined') return;
              const chip = document.createElement('div');
              chip.className = 'color-chip';
              chip.innerHTML = '<span class="color-chip-box" style="background:' + hex + ';"></span><span>' + hex + '</span>';
              editColorsList.appendChild(chip);
            });
          } else {
            editColorsList.innerHTML = '<span style="color:#64748B;font-size:11px;">未检测到独立色板</span>';
          }
        })
        .catch(() => {
          editSvgRenderContent.innerHTML = '<span style="color:#64748B;font-size:12px;">加载失败</span>';
        });

      editModal.classList.add('show');
    }

    function closeEditModal() {
      editModal.classList.remove('show');
      editingItemId = null;
      editingItemShortId = null;
      editingItemData = null;
    }

    editCloseX.onclick = closeEditModal;
    editCancelBtn.onclick = closeEditModal;
    editModal.onclick = (e) => {
      if (e.target === editModal) closeEditModal();
    };

    // Copy Prompt inside Modal
    editCopyPromptBtn.onclick = () => {
      if (!editingItemShortId) return;
      const text = buildExplicitCommand(
        editingItemShortId,
        editNameInput.value.trim(),
        editNotesInput.value.trim()
      );
      navigator.clipboard.writeText(text).then(() => {
        showToast('已复制完整明确的 AI 指令！直接粘贴到聊天中即可。', 'success');
      });
    };

    editSaveBtn.onclick = () => {
      if (!editingItemId) return;
      const newName = editNameInput.value.trim();
      const newNotes = editNotesInput.value.trim();
      const newStatus = editStatusSelect.value;
      const newSvg = editSvgInput.value.trim();
      const newCss = editCssInput.value.trim();

      editSaveBtn.disabled = true;
      editSaveBtn.textContent = '正在保存...';

      fetch('/api/capture/' + encodeURIComponent(editingItemId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          userNotes: newNotes,
          status: newStatus,
          svgRaw: newSvg,
          cssRaw: newCss,
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('✅ 设计 [ID: ' + editingItemShortId + '] 保存修改成功！', 'success');
          closeEditModal();
          loadInbox();
        } else {
          showToast('保存失败: ' + (data.error || '未知错误'), 'error');
        }
      })
      .catch(err => {
        showToast('请求失败: ' + err.message, 'error');
      })
      .finally(() => {
        editSaveBtn.disabled = false;
        editSaveBtn.textContent = '💾 保存修改';
      });
    };

    // Filter toggle
    filterPendingBtn.onclick = () => {
      currentFilter = 'pending';
      filterPendingBtn.classList.add('active');
      filterAllBtn.classList.remove('active');
      loadInbox();
    };
    filterAllBtn.onclick = () => {
      currentFilter = 'all';
      filterAllBtn.classList.add('active');
      filterPendingBtn.classList.remove('active');
      loadInbox();
    };

    // Switch Tabs
    function switchTab(activeBtn, activeSection) {
      [tabInboxBtn, tabAddBtn, tabToolsBtn].forEach(b => b.classList.remove('active'));
      [sectionInbox, sectionAdd, sectionTools].forEach(s => s.style.display = 'none');
      activeBtn.classList.add('active');
      activeSection.style.display = 'flex';
    }

    tabInboxBtn.onclick = () => {
      switchTab(tabInboxBtn, sectionInbox);
      loadInbox();
    };
    tabAddBtn.onclick = () => switchTab(tabAddBtn, sectionAdd);
    tabToolsBtn.onclick = () => switchTab(tabToolsBtn, sectionTools);

    // Copy path buttons
    const copyExtPathBtn = document.getElementById('copy-ext-path-btn');
    if (copyExtPathBtn) {
      copyExtPathBtn.onclick = () => {
        const path = document.getElementById('ext-path-text').innerText;
        navigator.clipboard.writeText(path).then(() => {
          showToast('已复制 Chrome 扩展程序路径！前往 chrome://extensions 加载', 'success');
        });
      };
    }
    const copyUserscriptPathBtn = document.getElementById('copy-userscript-path-btn');
    if (copyUserscriptPathBtn) {
      copyUserscriptPathBtn.onclick = () => {
        const path = document.getElementById('userscript-path-text').innerText;
        navigator.clipboard.writeText(path).then(() => {
          showToast('已复制 Tampermonkey 脚本文件路径！', 'success');
        });
      };
    }

    dropzone.onclick = () => fileInput.click();
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) handleImageFile(file);
    };

    // Paste event handler on page
    window.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            handleImageFile(file);
            tabAddBtn.click();
            showToast('已载入剪贴板截图图片', 'info');
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
      const cssText = document.getElementById('css-input').value.trim();
      const notes = document.getElementById('notes-input').value.trim();

      if (!currentBase64 && !svgText && !cssText) {
        showToast('请至少粘贴一张设计截图、SVG 矢量代码或 CSS 样式！', 'error');
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
          styles: { cssRaw: cssText },
          userNotes: notes
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          currentBase64 = '';
          previewBox.style.display = 'none';
          document.getElementById('name-input').value = '';
          document.getElementById('svg-input').value = '';
          document.getElementById('css-input').value = '';
          document.getElementById('notes-input').value = '';
          dropzoneText.innerHTML = '点击此处选择图片，或直接在页面任意处按下 Ctrl+V 粘贴截图';
          dropzone.style.borderColor = 'rgba(255, 255, 255, 0.2)';

          const shortId = data.shortId || data.id;
          showToast('🎉 成功加入设计待办池 [ID: ' + shortId + ']！', 'success');
          tabInboxBtn.click();
        } else {
          showToast('存入失败: ' + (data.error || '未知错误'), 'error');
        }
      })
      .catch(err => {
        showToast('网络请求失败: ' + err.message, 'error');
      })
      .finally(() => {
        submitBtn.innerHTML = '<span>📥</span> 加入设计待办池';
        submitBtn.disabled = false;
      });
    };

    // Load Inbox Items
    function loadInbox() {
      const endpoint = currentFilter === 'all' ? '/api/history' : '/api/inbox';
      fetch(endpoint)
        .then(res => res.json())
        .then(items => {
          inboxCount.innerText = items.length;
          inboxList.innerHTML = '';
          if (items.length === 0) {
            const emptyTip = currentFilter === 'all' ? '待办记录为空。' : '📭 暂无待处理设计。';
            inboxList.innerHTML = '<div class="empty-state">' + emptyTip + '<br/><button id="btn-quick-add" class="btn-action" style="margin-top: 10px;">➕ 立即粘贴添加设计</button></div>';
            const quickAdd = document.getElementById('btn-quick-add');
            if (quickAdd) quickAdd.onclick = () => tabAddBtn.click();
            return;
          }

          items.forEach(item => {
            const timeStr = new Date(item.timestamp).toLocaleTimeString();
            const shortId = item.shortId || item.id;

            const card = document.createElement('div');
            card.className = 'inbox-item';

            const badge = document.createElement('span');
            badge.className = 'item-badge';
            badge.textContent = '🆔 ' + shortId;

            const thumb = document.createElement('img');
            thumb.className = 'item-thumb';
            thumb.src = '/api/image/' + encodeURIComponent(item.id);
            thumb.alt = 'thumb';
            thumb.onerror = () => { thumb.style.display = 'none'; };

            const content = document.createElement('div');
            content.className = 'item-content';

            const titleRow = document.createElement('div');
            titleRow.className = 'item-title-row';

            const title = document.createElement('div');
            title.className = 'item-title';
            title.textContent = item.meta.name || '未命名设计';
            titleRow.appendChild(title);

            const statusPill = document.createElement('span');
            statusPill.className = 'status-pill ' + (item.status === 'completed' ? 'status-completed' : 'status-pending');
            statusPill.textContent = item.status === 'completed' ? '✅ 已完成' : '⏳ 待办';
            titleRow.appendChild(statusPill);

            content.appendChild(titleRow);

            if (item.userNotes) {
              const notes = document.createElement('div');
              notes.className = 'item-notes';
              notes.textContent = '📝 ' + item.userNotes;
              content.appendChild(notes);
            }

            const meta = document.createElement('div');
            meta.className = 'item-meta';
            meta.textContent = '永久 ID: ' + shortId + ' · 时间: ' + timeStr + ' · 来源: ' + (item.source || '网页');
            content.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'item-actions';

            // Edit / Detail button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-action btn-edit';
            editBtn.setAttribute('data-id', item.id);
            editBtn.textContent = '✏️ 查看/编辑';
            editBtn.onclick = () => openEditModal(item);

            // Complete explicit command copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn-action btn-copy';
            copyBtn.setAttribute('data-id', item.id);
            copyBtn.setAttribute('data-short-id', shortId);
            copyBtn.setAttribute('data-name', item.meta.name || '');
            copyBtn.setAttribute('data-notes', item.userNotes || '');
            copyBtn.textContent = '📋 复制完整指令';

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-action btn-delete';
            delBtn.setAttribute('data-id', item.id);
            delBtn.setAttribute('data-short-id', shortId);
            delBtn.textContent = '🗑️ 删除';

            actions.appendChild(editBtn);
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
        const shortId = btn.getAttribute('data-short-id');
        if (id) {
          showConfirmModal({
            title: '确认删除设计 [ID: ' + shortId + ']',
            message: '确定要从待办池中移除该设计任务吗？此操作将彻底删除本地数据。',
            confirmText: '🗑️ 确认删除',
            isDanger: true,
            onConfirm: () => {
              fetch('/api/capture/' + encodeURIComponent(id), { method: 'DELETE' })
                .then(() => {
                  showToast('已删除设计 [ID: ' + shortId + ']', 'info');
                  loadInbox();
                })
                .catch(err => {
                  showToast('删除失败: ' + err.message, 'error');
                });
            }
          });
        }
      } else if (btn.classList.contains('btn-copy')) {
        const shortId = btn.getAttribute('data-short-id');
        const name = btn.getAttribute('data-name');
        const notes = btn.getAttribute('data-notes');
        if (shortId) {
          const commandText = buildExplicitCommand(shortId, name, notes);
          navigator.clipboard.writeText(commandText).then(() => {
            btn.classList.add('copied');
            btn.textContent = '✅ 已复制完整指令！';
            setTimeout(() => {
              btn.classList.remove('copied');
              btn.textContent = '📋 复制完整指令';
            }, 2500);
            showToast('已复制完整明确指令，直接粘贴到 AI 聊天即可！', 'success');
          }).catch(() => {
            showToast('复制失败，请手动复制：' + commandText, 'error');
          });
        }
      }
    });

    clearAllBtn.onclick = () => {
      showConfirmModal({
        title: '确认清空待办池',
        message: '确定要清空全部待办设计吗？此操作将删除所有本地待办项及磁盘缓存。',
        confirmText: '🧹 确认清空',
        isDanger: true,
        onConfirm: () => {
          fetch('/api/clear', { method: 'POST' })
            .then(() => {
              showToast('已清空全部待办设计', 'info');
              loadInbox();
            })
            .catch(err => {
              showToast('清空失败: ' + err.message, 'error');
            });
        }
      });
    };

    // Initial load
    loadInbox();
  </script>
</body>
</html>`;
}
