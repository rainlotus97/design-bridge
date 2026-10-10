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
      max-width: 980px;
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
      font-size: 13px;
      font-weight: 700;
      color: var(--accent);
      background: rgba(59, 130, 246, 0.15);
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid rgba(59, 130, 246, 0.25);
    }
    .item-thumb {
      width: 68px;
      height: 68px;
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
      gap: 4px;
      min-width: 0;
    }
    .item-title-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .item-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .status-pill {
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 500;
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
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .btn-action:hover {
      background: rgba(255, 255, 255, 0.16);
      border-color: rgba(255, 255, 255, 0.25);
    }
    .btn-edit {
      color: #93C5FD;
      border-color: rgba(59, 130, 246, 0.3);
    }
    .btn-edit:hover {
      background: rgba(59, 130, 246, 0.15);
      border-color: rgba(59, 130, 246, 0.6);
    }
    .btn-copy.copied {
      background: rgba(16, 185, 129, 0.2);
      border-color: rgba(16, 185, 129, 0.5);
      color: #34D399;
    }
    .btn-delete {
      color: #F87171;
      border-color: rgba(239, 68, 68, 0.25);
    }
    .btn-delete:hover {
      background: rgba(239, 68, 68, 0.15);
      border-color: rgba(239, 68, 68, 0.5);
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
      max-width: 380px;
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
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
    }
    .modal-backdrop.show {
      opacity: 1;
      pointer-events: auto;
    }
    .modal-card {
      background: #151D2F;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      padding: 24px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6);
      transform: scale(0.95);
      transition: transform 0.2s ease;
      display: flex;
      flex-direction: column;
      gap: 16px;
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
      gap: 10px;
      margin-top: 8px;
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

  <!-- Edit Design Modal -->
  <div id="edit-modal" class="modal-backdrop">
    <div class="modal-card">
      <div class="modal-title">
        <span>✏️</span> 编辑设计项 <span id="edit-modal-badge" class="item-badge">#1</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div class="form-group">
          <label>🏷️ 设计标题 / 组件名称：</label>
          <input id="edit-name-input" type="text" placeholder="例如：船舶监控卡片、登录表单..." />
        </div>
        <div class="form-group">
          <label>📝 需求备注 / 个性化规则：</label>
          <textarea id="edit-notes-input" rows="3" placeholder="例如：采用 Vue 3 + Tailwind 实现，经纬度指标为动态组件传参..."></textarea>
        </div>
        <div class="form-group">
          <label>📌 任务状态：</label>
          <select id="edit-status-select">
            <option value="pending">⏳ 待办处理中 (Pending)</option>
            <option value="completed">✅ 已完成归档 (Completed)</option>
          </select>
        </div>
      </div>
      <div class="modal-actions">
        <button id="edit-cancel-btn" class="btn-modal-cancel">取消</button>
        <button id="edit-save-btn" class="btn-modal-confirm">💾 保存修改</button>
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
      <button id="tab-tools-btn" class="tab-btn">🛠️ 浏览器专属插件 (独立页面直推)</button>
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
        <label>📝 4. 需求备注 / 个性化规则 (可选)</label>
        <input id="notes-input" type="text" placeholder="例如：采用 Vue 3 + Tailwind 实现，经纬度指标为动态组件传参..." />
      </div>

      <button id="submit-btn" class="btn-submit">
        <span>📥</span> 加入设计待办池
      </button>
    </div>

    <!-- Section 3: Browser Tools & Integration -->
    <div id="section-tools" class="card" style="display: none;">
      <div style="display: flex; flex-direction: column; gap: 6px;">
        <h3 style="font-size: 16px; font-weight: 600;">独立网站直推工具 (无需在本页面手动粘贴)</h3>
        <p style="font-size: 13px; color: var(--text-muted);">
          为您在 MasterGo、Figma 或任意普通网页上提供专属无缝推送能力：选中即可推送到待办池！
        </p>
      </div>

      <!-- MasterGo Native Plugin Special Card -->
      <div style="background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%); border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 14px; padding: 22px; display: flex; flex-direction: column; gap: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <h4 style="font-size: 16px; font-weight: 700; color: #38BDF8; display: flex; align-items: center; gap: 8px;">
            <span>🎨</span> MasterGo 官方原生插件 (首选推荐 · 100% 真实图层 2x 高清 PNG + SVG)
          </h4>
          <span class="badge" style="background: rgba(56, 189, 248, 0.2); color: #38BDF8; border-color: rgba(56, 189, 248, 0.4);">
            原生引擎导出 · 零假图
          </span>
        </div>
        <p style="font-size: 13px; color: #CBD5E1; line-height: 1.6;">
          直接调用 MasterGo 内部图形引擎（<code>node.exportAsync</code>），选中任何图层即可秒级提取真实的 2x PNG 高保真截图、无损矢量 SVG 和 CSS 代码，彻底告别浏览器权限限制和绿色占位图！
        </p>
        <div class="code-pill">
          <span id="mg-plugin-path-text">D:\\Document\\design-bridge\\plugins\\mastergo-native-plugin\\manifest.json</span>
          <button id="copy-mg-plugin-btn" class="btn-action">📋 复制插件路径</button>
        </div>
        <div style="font-size: 12px; color: var(--text-muted); line-height: 1.8;">
          <strong>只需 5 秒即可在 MasterGo 导入启用：</strong><br/>
          1. 打开 MasterGo 文件，点击左上角主菜单 ➔ <strong>「插件」</strong> ➔ <strong>「开发插件」</strong> ➔ <strong>「导入插件」</strong>；<br/>
          2. 选择上面的清单文件 <code>manifest.json</code> 即可！<br/>
          3. 随后在 MasterGo 中选中任意图层，插件面板自动显示 2x 缩略图，点击 <strong>「⚡ 推送到本地 AI 待办池」</strong> 即可直推（还支持选中即自动直推）！
        </div>
      </div>

      <div class="tools-grid">
        <div class="tool-card">
          <div class="tool-card-title">
            <span>⚡</span> MasterGo / Figma 专属工具
          </div>
          <div class="tool-card-desc">
            <strong>复制即推 (Auto-push)</strong>：在 MasterGo 中选中任意图层并按下 <code>Ctrl+C</code>（或复制为 PNG <code>Ctrl+Shift+C</code>），插件自动提取图层图像与 SVG 矢量，0.2 秒无感推送至待办池！
          </div>
          <div class="tool-card-desc">
            专属快捷键：<strong><code>Alt + S</code></strong> 一键直推（已避开 Chrome 地址栏热键冲突）。
          </div>
        </div>

        <div class="tool-card">
          <div class="tool-card-title">
            <span>🎯</span> 任意网页【元素点选直推】
          </div>
          <div class="tool-card-desc">
            <strong>元素吸取器 (Element Inspector)</strong>：在任意网页上按下 <code>Alt + X</code> 开启吸取器，鼠标移到卡片、表格、表单或按钮上实时高亮，单击直接截取高清截图与 Computed CSS 样式推入待办池！
          </div>
          <div class="tool-card-desc">
            右键菜单：在任何选区或图片上右键，直接点击「⚡ 推送到 DesignBridge 待办池」。
          </div>
        </div>
      </div>

      <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
        <h4 style="font-size: 14px; font-weight: 600; color: #93C5FD;">📦 Chrome 扩展程序一键安装路径</h4>
        <p style="font-size: 13px; color: var(--text-muted);">
          扩展源码已放置在本地，您只需打开 Chrome 的扩展程序管理器加载即可使用：
        </p>
        <div class="code-pill">
          <span id="ext-path-text">D:\\Document\\design-bridge\\plugins\\extension-chrome</span>
          <button id="copy-ext-path-btn" class="btn-action">📋 复制路径</button>
        </div>
        <ol style="font-size: 12px; color: var(--text-muted); line-height: 1.8; margin-left: 20px;">
          <li>在 Chrome 浏览器地址栏输入：<code>chrome://extensions</code> 并回车；</li>
          <li>打开右上角 <strong>「开发者模式」</strong> 开关；</li>
          <li>点击左上角 <strong>「加载已解压的扩展程序」</strong>，粘贴并选择上面的文件夹路径；</li>
          <li>如果已加载，点击该扩展卡片右下角的 <strong>刷新 🔄</strong> 图标即可载入最新更新！</li>
        </ol>
      </div>
    </div>
  </div>

  <script>
    let currentBase64 = '';
    let currentFilter = 'pending'; // 'pending' | 'all'
    let editingItemId = null;
    let editingItemIndex = null;

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
    const editNameInput = document.getElementById('edit-name-input');
    const editNotesInput = document.getElementById('edit-notes-input');
    const editStatusSelect = document.getElementById('edit-status-select');
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
      }, 3000);
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

    // Edit Modal Handlers
    function openEditModal(item) {
      editingItemId = item.id;
      editingItemIndex = item.index;
      editModalBadge.textContent = '#' + item.index;
      editNameInput.value = item.meta?.name || '';
      editNotesInput.value = item.userNotes || '';
      editStatusSelect.value = item.status || 'pending';
      editModal.classList.add('show');
    }

    function closeEditModal() {
      editModal.classList.remove('show');
      editingItemId = null;
      editingItemIndex = null;
    }

    editCancelBtn.onclick = closeEditModal;
    editModal.onclick = (e) => {
      if (e.target === editModal) closeEditModal();
    };

    editSaveBtn.onclick = () => {
      if (!editingItemId) return;
      const newName = editNameInput.value.trim();
      const newNotes = editNotesInput.value.trim();
      const newStatus = editStatusSelect.value;

      editSaveBtn.disabled = true;
      editSaveBtn.textContent = '正在保存...';

      fetch('/api/capture/' + encodeURIComponent(editingItemId), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          userNotes: newNotes,
          status: newStatus,
        }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          showToast('✅ 设计 #' + editingItemIndex + ' 修改成功！', 'success');
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

    // MasterGo native plugin path copy button
    const copyMgPluginBtn = document.getElementById('copy-mg-plugin-btn');
    if (copyMgPluginBtn) {
      copyMgPluginBtn.onclick = () => {
        const path = document.getElementById('mg-plugin-path-text').innerText;
        navigator.clipboard.writeText(path).then(() => {
          showToast('已复制 MasterGo 插件清单路径！去 MasterGo 导入吧', 'success');
        });
      };
    }

    // Extension path copy button
    const copyExtPathBtn = document.getElementById('copy-ext-path-btn');
    if (copyExtPathBtn) {
      copyExtPathBtn.onclick = () => {
        const path = document.getElementById('ext-path-text').innerText;
        navigator.clipboard.writeText(path).then(() => {
          showToast('已复制扩展程序目录路径到剪贴板！', 'success');
        });
      };
    }

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
      const notes = document.getElementById('notes-input').value.trim();

      if (!currentBase64 && !svgText) {
        showToast('请至少粘贴一张设计截图，或粘贴 SVG 矢量代码！', 'error');
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
          currentBase64 = '';
          previewBox.style.display = 'none';
          document.getElementById('name-input').value = '';
          document.getElementById('svg-input').value = '';
          document.getElementById('notes-input').value = '';
          dropzoneText.innerHTML = '点击此处选择图片，或直接在页面任意处按下 Ctrl+V 粘贴截图';
          dropzone.style.borderColor = 'rgba(255, 255, 255, 0.2)';

          showToast('🎉 成功加入设计待办池 #' + data.index + '！', 'success');
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
            meta.textContent = 'ID: ' + item.id + ' · 时间: ' + timeStr;
            content.appendChild(meta);

            const actions = document.createElement('div');
            actions.className = 'item-actions';

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-action btn-edit';
            editBtn.setAttribute('data-id', item.id);
            editBtn.textContent = '✏️ 编辑';
            editBtn.onclick = () => openEditModal(item);

            // Copy button
            const copyBtn = document.createElement('button');
            copyBtn.className = 'btn-action btn-copy';
            copyBtn.setAttribute('data-index', String(item.index));
            copyBtn.textContent = '📋 复制指令';

            // Delete button
            const delBtn = document.createElement('button');
            delBtn.className = 'btn-action btn-delete';
            delBtn.setAttribute('data-id', item.id);
            delBtn.setAttribute('data-index', String(item.index));
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
        const index = btn.getAttribute('data-index');
        if (id) {
          showConfirmModal({
            title: '确认删除设计 #' + index,
            message: '确定要从待办池中移除该设计任务吗？此操作将彻底删除本地数据。',
            confirmText: '🗑️ 确认删除',
            isDanger: true,
            onConfirm: () => {
              fetch('/api/capture/' + encodeURIComponent(id), { method: 'DELETE' })
                .then(() => {
                  showToast('已删除设计 #' + index, 'info');
                  loadInbox();
                })
                .catch(err => {
                  showToast('删除失败: ' + err.message, 'error');
                });
            }
          });
        }
      } else if (btn.classList.contains('btn-copy')) {
        const index = btn.getAttribute('data-index');
        if (index) {
          const text = '帮我实现设计 #' + index;
          navigator.clipboard.writeText(text).then(() => {
            btn.classList.add('copied');
            btn.textContent = '✅ 已复制！';
            setTimeout(() => {
              btn.classList.remove('copied');
              btn.textContent = '📋 复制指令';
            }, 2000);
            showToast('已复制指令「' + text + '」，去 AI 窗口粘贴发送吧！', 'success');
          }).catch(() => {
            showToast('复制失败，请手动输入：' + text, 'error');
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
