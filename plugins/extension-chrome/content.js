// Universal Content Script for DesignBridge Chrome Extension
(function () {
  'use strict';

  if (window.__DESIGN_BRIDGE_INITIALIZED__) return;
  window.__DESIGN_BRIDGE_INITIALIZED__ = true;

  const BRIDGE_URL = 'http://127.0.0.1:23851';
  const isMasterGo = location.hostname.includes('mastergo.com');
  const isFigma = location.hostname.includes('figma.com');
  const isDesignApp = isMasterGo || isFigma;

  let autoPushOnCopy = false; // default off to let user inspect/paste into floating window
  let isInspectMode = false;
  let hoveredElement = null;
  let inspectOverlay = null;
  let inspectTooltip = null;
  let inspectTopBanner = null;

  // State for current floating window item
  let currentShortId = generateGitStyleId();
  let currentImageBase64 = '';
  let currentSvgRaw = '';
  let currentCssRaw = '';

  function generateGitStyleId() {
    const chars = '0123456789abcdef';
    let id = '';
    for (let i = 0; i < 7; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
  }

  // ==========================================
  // 1. Toast Notification System
  // ==========================================
  function showToast(msg, type = 'success') {
    let container = document.getElementById('db-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'db-toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: '2147483647',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      });
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isError = type === 'error';
    const isInfo = type === 'info';

    toast.innerHTML = `
      <span style="font-size: 16px;">${isError ? '❌' : isInfo ? 'ℹ️' : '⚡'}</span>
      <span style="font-size: 13px; font-weight: 600; line-height: 1.4;">${msg}</span>
    `;

    Object.assign(toast.style, {
      pointerEvents: 'auto',
      backgroundColor: isError ? 'rgba(239, 68, 68, 0.95)' : isInfo ? 'rgba(30, 41, 59, 0.95)' : 'rgba(16, 185, 129, 0.95)',
      color: '#FFFFFF',
      padding: '12px 18px',
      borderRadius: '12px',
      boxShadow: '0 8px 28px rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      maxWidth: '420px',
      transition: 'all 0.25s ease',
      transform: 'translateY(0)',
      opacity: '1',
    });

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  // ==========================================
  // 2. Drag Helper
  // ==========================================
  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = `${Math.max(10, Math.min(window.innerHeight - 80, element.offsetTop - pos2))}px`;
      element.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, element.offsetLeft - pos1))}px`;
      element.style.bottom = 'auto';
      element.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // ==========================================
  // 3. Universal Floating Window & Trigger Pill
  // ==========================================
  function initFloatingWindow() {
    if (document.getElementById('db-floating-root')) return;

    const root = document.createElement('div');
    root.id = 'db-floating-root';

    // 1. Minimized Trigger Button / Pill
    const trigger = document.createElement('div');
    trigger.id = 'db-floating-trigger';
    trigger.innerHTML = `
      <span style="font-size: 15px;">⚡</span>
      <span style="font-weight: 700;">AI 设计待办</span>
    `;
    Object.assign(trigger.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '2147483640',
      backgroundColor: '#0F172A',
      color: '#38BDF8',
      borderRadius: '24px',
      border: '1px solid rgba(56, 189, 248, 0.4)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.45)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'none', // initially hidden if panel is open, or visible if closed
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      cursor: 'pointer',
      userSelect: 'none',
      fontSize: '13px',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    });
    trigger.onmouseenter = () => { trigger.style.transform = 'translateY(-2px)'; };
    trigger.onmouseleave = () => { trigger.style.transform = 'translateY(0)'; };
    trigger.onclick = () => openFloatingPanel();

    // 2. Full Floating Window Panel
    const panel = document.createElement('div');
    panel.id = 'db-floating-panel';
    Object.assign(panel.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      width: '420px',
      maxHeight: '88vh',
      zIndex: '2147483641',
      backgroundColor: '#0B0F19',
      color: '#F8FAFC',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.14)',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(56, 189, 248, 0.2)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      userSelect: 'none',
      fontSize: '13px',
    });

    panel.innerHTML = `
      <!-- Header (Draggable) -->
      <div id="db-panel-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #151D2F;
        padding: 12px 16px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        cursor: move;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">⚡</span>
          <span style="font-weight: 700; color: #38BDF8; font-size: 14px;">DesignBridge 待办悬浮窗</span>
          <span id="db-id-badge" style="
            font-size: 11px;
            font-family: monospace;
            background: rgba(59, 130, 246, 0.2);
            color: #93C5FD;
            padding: 2px 6px;
            border-radius: 4px;
            border: 1px solid rgba(59, 130, 246, 0.35);
          ">🆔 ${currentShortId}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="db-btn-dashboard" title="打开待办池仪表盘" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 4px; font-size: 14px;">🌐</button>
          <button id="db-btn-min" title="最小化" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 4px 6px; font-size: 14px; font-weight: bold;">—</button>
          <button id="db-btn-close" title="关闭悬浮窗 (可随时点击右下角再次打开)" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 4px 6px; font-size: 14px; font-weight: bold;">✕</button>
        </div>
      </div>

      <!-- Scrollable Body -->
      <div id="db-panel-body" style="
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        overflow-y: auto;
        max-height: calc(88vh - 120px);
      ">
        <!-- Smart Paste Dropzone -->
        <div id="db-dropzone" style="
          border: 2px dashed rgba(56, 189, 248, 0.35);
          background: rgba(56, 189, 248, 0.04);
          border-radius: 12px;
          padding: 14px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: center;
        ">
          <div style="font-size: 20px;">📋</div>
          <div style="font-weight: 600; color: #F1F5F9; font-size: 13px;">点击或在此处按下 Ctrl+V 粘贴</div>
          <div style="font-size: 11px; color: #94A3B8; line-height: 1.4;">
            自动识别图层截图 (PNG)、矢量代码 (SVG) 或 CSS 样式代码
          </div>
          <button id="db-btn-paste-clip" style="
            margin-top: 4px;
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.4);
            color: #93C5FD;
            padding: 5px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
          ">📋 自动贴入当前系统剪贴板</button>
        </div>

        <!-- Slot 1: Image PNG Preview -->
        <div style="background: #151D2F; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 12px; color: #E2E8F0;">🖼️ 高清 PNG 截图：</span>
            <div style="display: flex; gap: 6px;">
              <button id="db-btn-capture-tab" style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); color: #CBD5E1; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer;">📸 截取可视区</button>
              <button id="db-btn-clear-img" style="background: transparent; border: none; color: #F87171; padding: 3px; font-size: 11px; cursor: pointer; display: none;">🗑️ 清除</button>
            </div>
          </div>
          <div id="db-img-container" style="
            min-height: 50px;
            max-height: 160px;
            background: #0B0F19;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            position: relative;
          ">
            <span id="db-img-empty" style="color: #64748B; font-size: 12px;">暂无图片（可贴入或截屏）</span>
            <img id="db-img-preview" style="max-width: 100%; max-height: 160px; object-fit: contain; display: none;" alt="Preview" />
          </div>
          <div id="db-img-meta" style="font-size: 11px; color: #94A3B8; display: none;"></div>
        </div>

        <!-- Slot 2: Vector SVG Live Preview & Code -->
        <div style="background: #151D2F; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 12px; color: #E2E8F0;">📐 矢量 SVG 预览与代码：</span>
            <button id="db-btn-clear-svg" style="background: transparent; border: none; color: #F87171; padding: 3px; font-size: 11px; cursor: pointer; display: none;">🗑️ 清除</button>
          </div>
          <div id="db-svg-render-box" style="
            min-height: 40px;
            max-height: 120px;
            background: #0B0F19;
            border-radius: 6px;
            border: 1px solid rgba(255,255,255,0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            overflow: hidden;
          ">
            <span id="db-svg-empty" style="color: #64748B; font-size: 12px;">暂无 SVG 矢量</span>
            <div id="db-svg-preview" style="display: none; max-width: 100%; max-height: 100px;"></div>
          </div>
          <textarea id="db-textarea-svg" rows="2" placeholder="在此粘贴 SVG 代码，或按 Ctrl+V 自动填充..." style="
            width: 100%;
            background: #0B0F19;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            color: #93C5FD;
            font-family: monospace;
            font-size: 11px;
            padding: 6px 8px;
            resize: vertical;
            outline: none;
            box-sizing: border-box;
          "></textarea>
        </div>

        <!-- Slot 3: CSS Styles -->
        <div style="background: #151D2F; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 12px; color: #E2E8F0;">🎨 CSS 样式代码：</span>
            <button id="db-btn-clear-css" style="background: transparent; border: none; color: #F87171; padding: 3px; font-size: 11px; cursor: pointer; display: none;">🗑️ 清除</button>
          </div>
          <textarea id="db-textarea-css" rows="3" placeholder="在此粘贴 CSS 代码（例如：background, border-radius, box-shadow...）" style="
            width: 100%;
            background: #0B0F19;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 6px;
            color: #A7F3D0;
            font-family: monospace;
            font-size: 11px;
            padding: 6px 8px;
            resize: vertical;
            outline: none;
            box-sizing: border-box;
          "></textarea>
        </div>

        <!-- Metadata Inputs -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #CBD5E1; margin-bottom: 4px; display: block;">🏷️ 设计标题 / 组件名称：</label>
            <input id="db-input-name" type="text" placeholder="例如：船舶监控卡片、业务列表..." style="
              width: 100%;
              background: #151D2F;
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 6px;
              color: #F8FAFC;
              padding: 7px 10px;
              font-size: 12px;
              outline: none;
              box-sizing: border-box;
            " />
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #CBD5E1; margin-bottom: 4px; display: block;">📝 需求备注 / 个性化提示：</label>
            <textarea id="db-input-notes" rows="2" placeholder="例如：用 Tailwind 实现，支持暗色主题，保持渐变色..." style="
              width: 100%;
              background: #151D2F;
              border: 1px solid rgba(255,255,255,0.1);
              border-radius: 6px;
              color: #F8FAFC;
              padding: 7px 10px;
              font-size: 12px;
              outline: none;
              box-sizing: border-box;
              resize: vertical;
            "></textarea>
          </div>
        </div>
      </div>

      <!-- Footer Action Bar -->
      <div style="
        background: #151D2F;
        padding: 12px 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      ">
        <button id="db-btn-reset" title="清空重置" style="
          background: transparent;
          border: 1px solid rgba(255,255,255,0.12);
          color: #94A3B8;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          cursor: pointer;
        ">🧹 清空</button>

        <button id="db-btn-submit" style="
          flex: 1;
          background: #3B82F6;
          color: #FFF;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background 0.2s;
        ">
          <span>🚀</span> 推送到本地 AI 待办池
        </button>
      </div>
    `;

    root.appendChild(trigger);
    root.appendChild(panel);
    document.body.appendChild(root);

    // Make panel draggable
    makeDraggable(panel, panel.querySelector('#db-panel-header'));

    // Cache element references
    const dropzone = panel.querySelector('#db-dropzone');
    const pasteClipBtn = panel.querySelector('#db-btn-paste-clip');
    const captureTabBtn = panel.querySelector('#db-btn-capture-tab');
    const clearImgBtn = panel.querySelector('#db-btn-clear-img');
    const clearSvgBtn = panel.querySelector('#db-btn-clear-svg');
    const clearCssBtn = panel.querySelector('#db-btn-clear-css');
    const imgPreview = panel.querySelector('#db-img-preview');
    const imgEmpty = panel.querySelector('#db-img-empty');
    const imgMeta = panel.querySelector('#db-img-meta');
    const svgRenderBox = panel.querySelector('#db-svg-render-box');
    const svgEmpty = panel.querySelector('#db-svg-empty');
    const svgPreview = panel.querySelector('#db-svg-preview');
    const textareaSvg = panel.querySelector('#db-textarea-svg');
    const textareaCss = panel.querySelector('#db-textarea-css');
    const inputName = panel.querySelector('#db-input-name');
    const inputNotes = panel.querySelector('#db-input-notes');
    const idBadge = panel.querySelector('#db-id-badge');
    const submitBtn = panel.querySelector('#db-btn-submit');
    const resetBtn = panel.querySelector('#db-btn-reset');
    const minBtn = panel.querySelector('#db-btn-min');
    const closeBtn = panel.querySelector('#db-btn-close');
    const dashboardBtn = panel.querySelector('#db-btn-dashboard');

    // Default title from document
    inputName.value = (document.title || '').replace(/[-_].*$/, '').trim() || '设计图层';

    // Panel Window Controls
    function closeFloatingPanel() {
      panel.style.display = 'none';
      trigger.style.display = 'flex';
      showToast('悬浮窗已收起至右下角，点击【⚡ AI 设计待办】可随时再次打开', 'info');
    }

    function openFloatingPanel() {
      panel.style.display = 'flex';
      trigger.style.display = 'none';
    }

    minBtn.onclick = closeFloatingPanel;
    closeBtn.onclick = closeFloatingPanel;
    dashboardBtn.onclick = () => window.open(BRIDGE_URL, '_blank');

    // UI Updates
    function updateImageUI(base64, info = '') {
      currentImageBase64 = base64;
      if (base64) {
        imgPreview.src = base64;
        imgPreview.style.display = 'block';
        imgEmpty.style.display = 'none';
        clearImgBtn.style.display = 'inline-block';
        imgMeta.style.display = 'block';
        imgMeta.textContent = info || '已载入截图图片';
      } else {
        imgPreview.style.display = 'none';
        imgEmpty.style.display = 'block';
        clearImgBtn.style.display = 'none';
        imgMeta.style.display = 'none';
      }
    }

    function updateSvgUI(svgRaw) {
      currentSvgRaw = svgRaw;
      textareaSvg.value = svgRaw;
      if (svgRaw && svgRaw.includes('<svg')) {
        svgPreview.innerHTML = svgRaw;
        svgPreview.style.display = 'block';
        svgEmpty.style.display = 'none';
        clearSvgBtn.style.display = 'inline-block';
      } else {
        svgPreview.innerHTML = '';
        svgPreview.style.display = 'none';
        svgEmpty.style.display = 'block';
        clearSvgBtn.style.display = 'none';
      }
    }

    function updateCssUI(cssRaw) {
      currentCssRaw = cssRaw;
      textareaCss.value = cssRaw;
      clearCssBtn.style.display = cssRaw ? 'inline-block' : 'none';
    }

    textareaSvg.oninput = () => updateSvgUI(textareaSvg.value);
    textareaCss.oninput = () => updateCssUI(textareaCss.value);

    clearImgBtn.onclick = () => updateImageUI('');
    clearSvgBtn.onclick = () => updateSvgUI('');
    clearCssBtn.onclick = () => updateCssUI('');

    resetBtn.onclick = () => {
      updateImageUI('');
      updateSvgUI('');
      updateCssUI('');
      inputNotes.value = '';
      currentShortId = generateGitStyleId();
      idBadge.textContent = `🆔 ${currentShortId}`;
      showToast('已清空面板内容', 'info');
    };

    // Capture tab screenshot
    captureTabBtn.onclick = async () => {
      captureTabBtn.disabled = true;
      captureTabBtn.textContent = '正在截屏...';
      try {
        if (chrome?.runtime?.sendMessage) {
          const res = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'capture-visible-tab' }, resolve);
          });
          if (res?.dataUrl) {
            updateImageUI(res.dataUrl, '📸 屏幕可视区完整截图');
            showToast('已成功截取当前页面截图！', 'success');
          } else {
            showToast('截屏失败，未获取到图像数据', 'error');
          }
        }
      } catch (err) {
        showToast(`截屏异常: ${err.message}`, 'error');
      } finally {
        captureTabBtn.disabled = false;
        captureTabBtn.textContent = '📸 截取可视区';
      }
    };

    // Parse pasted / read clipboard payload
    async function ingestClipboardPayload(data) {
      let absorbed = false;
      if (data.imageBase64) {
        updateImageUI(data.imageBase64, '📋 剪贴板提取高清图片');
        absorbed = true;
      }
      if (data.svgRaw) {
        updateSvgUI(data.svgRaw);
        absorbed = true;
      }
      if (data.plainText) {
        const text = data.plainText.trim();
        if (text.startsWith('<svg') || text.includes('</svg>')) {
          updateSvgUI(text);
          absorbed = true;
        } else if (text.includes('{') || text.includes(';') || text.includes('px') || text.includes(':')) {
          updateCssUI(text);
          absorbed = true;
        } else if (!inputNotes.value) {
          inputNotes.value = text;
        }
      }

      if (absorbed) {
        showToast('✅ 已成功从剪贴板解析设计资产！', 'success');
      } else {
        showToast('剪贴板中未检测到图片、SVG 或 CSS 代码', 'info');
      }
    }

    // Read clipboard via privileged background
    pasteClipBtn.onclick = async () => {
      pasteClipBtn.disabled = true;
      pasteClipBtn.textContent = '正在读取...';
      try {
        if (chrome?.runtime?.sendMessage) {
          const clipData = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'read-clipboard-data' }, resolve);
          });
          if (clipData && (clipData.imageBase64 || clipData.svgRaw || clipData.plainText)) {
            await ingestClipboardPayload(clipData);
          } else if (navigator.clipboard?.read) {
            // fallback to web API
            await readWebClipboard();
          } else {
            showToast('剪贴板未包含可识别内容', 'info');
          }
        }
      } catch (err) {
        showToast(`读取剪贴板失败: ${err.message}`, 'error');
      } finally {
        pasteClipBtn.disabled = false;
        pasteClipBtn.textContent = '📋 自动贴入当前系统剪贴板';
      }
    };

    async function readWebClipboard() {
      try {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          for (const type of item.types) {
            if (type.startsWith('image/')) {
              const blob = await item.getType(type);
              const reader = new FileReader();
              reader.onload = (e) => updateImageUI(e.target.result, `📋 剪贴板图片 (${Math.round(blob.size / 1024)} KB)`);
              reader.readAsDataURL(blob);
              showToast('已载入剪贴板图片', 'success');
              return;
            } else if (type === 'text/plain') {
              const blob = await item.getType(type);
              const text = await blob.text();
              if (text.includes('<svg')) updateSvgUI(text);
              else if (text.includes('{') || text.includes(';')) updateCssUI(text);
            }
          }
        }
      } catch {
        showToast('请直接点击输入框按 Ctrl+V 粘贴', 'info');
      }
    }

    // Listen for Paste in Panel
    panel.addEventListener('paste', (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              updateImageUI(evt.target.result, `📋 粘贴图片 (${Math.round(file.size / 1024)} KB)`);
              showToast('已载入粘贴图片！', 'success');
            };
            reader.readAsDataURL(file);
            return;
          }
        }
      }

      const text = e.clipboardData.getData('text/plain') || '';
      if (text.trim().startsWith('<svg') || text.includes('</svg>')) {
        updateSvgUI(text.trim());
        showToast('已载入 SVG 矢量代码！', 'success');
      } else if (text.includes('{') || text.includes(':') || text.includes(';')) {
        updateCssUI(text.trim());
        showToast('已载入 CSS 样式代码！', 'success');
      }
    });

    // Submit to Local AI Server
    submitBtn.onclick = async () => {
      if (!currentImageBase64 && !currentSvgRaw && !currentCssRaw) {
        showToast('请至少粘贴一张设计截图、SVG 矢量或 CSS 样式！', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span> 正在推送到 AI 待办池...';

      const finalBase64 = currentImageBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const payload = {
        source: isMasterGo ? 'mastergo-floating' : isFigma ? 'figma-floating' : 'web-floating',
        meta: {
          name: inputName.value.trim() || '未命名图层设计',
          url: location.href,
        },
        image: { base64: finalBase64 },
        vector: { svgRaw: currentSvgRaw },
        styles: { cssRaw: currentCssRaw },
        userNotes: inputNotes.value.trim(),
      };

      try {
        const res = await fetch(`${BRIDGE_URL}/api/capture`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();

        if (data.success) {
          const targetId = data.shortId || data.id || currentShortId;
          showToast(`🎉 成功推入待办池 [ID: ${targetId}]！可在 AI 中说：帮我实现设计 ${targetId}`, 'success');

          // Reset for next design
          updateImageUI('');
          updateSvgUI('');
          updateCssUI('');
          inputNotes.value = '';
          currentShortId = generateGitStyleId();
          idBadge.textContent = `🆔 ${currentShortId}`;
        } else {
          showToast(`推送失败: ${data.error || '未知错误'}`, 'error');
        }
      } catch (err) {
        showToast(`连接本地服务失败 (端口 23851): ${err.message}`, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🚀</span> 推送到本地 AI 待办池';
      }
    };
  }

  // ==========================================
  // 4. Global Hotkey Listeners
  // ==========================================
  window.addEventListener(
    'keydown',
    (e) => {
      // Toggle Floating Window via Alt+S or Alt+Q
      if (
        (e.altKey && (e.key === 's' || e.key === 'S' || e.key === 'q' || e.key === 'Q')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        const panel = document.getElementById('db-floating-panel');
        const trigger = document.getElementById('db-floating-trigger');
        if (panel && trigger) {
          if (panel.style.display === 'none') {
            panel.style.display = 'flex';
            trigger.style.display = 'none';
          } else {
            panel.style.display = 'none';
            trigger.style.display = 'flex';
          }
        }
        return;
      }

      // Hotkey Alt+X for Element Inspector
      if (e.altKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        e.stopPropagation();
        startElementInspector();
        return;
      }
    },
    true
  );

  // ==========================================
  // 5. Universal Element Inspector (Alt+X)
  // ==========================================
  function startElementInspector() {
    if (isInspectMode) return;
    isInspectMode = true;

    inspectTopBanner = document.createElement('div');
    inspectTopBanner.innerHTML = `
      <span>🎯</span>
      <span><strong>元素点选直推模式</strong>：悬浮预览元素，<strong>单击直接推入 AI 待办池</strong></span>
      <span style="opacity: 0.6; font-size: 11px;">[按 ESC 退出]</span>
    `;
    Object.assign(inspectTopBanner.style, {
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      zIndex: '2147483647',
      backgroundColor: '#0F172A',
      color: '#38BDF8',
      padding: '9px 16px',
      fontSize: '13px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      boxShadow: '0 2px 14px rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      borderBottom: '1px solid rgba(56, 189, 248, 0.4)',
      userSelect: 'none',
    });
    document.body.appendChild(inspectTopBanner);

    inspectOverlay = document.createElement('div');
    Object.assign(inspectOverlay.style, {
      position: 'fixed',
      pointerEvents: 'none',
      zIndex: '2147483646',
      border: '2px solid #38BDF8',
      backgroundColor: 'rgba(56, 189, 248, 0.12)',
      borderRadius: '4px',
      transition: 'all 0.05s ease-out',
      display: 'none',
    });

    inspectTooltip = document.createElement('div');
    Object.assign(inspectTooltip.style, {
      position: 'absolute',
      top: '-26px',
      left: '0',
      backgroundColor: '#0284C7',
      color: '#FFFFFF',
      fontSize: '11px',
      fontWeight: '600',
      padding: '2px 8px',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
      fontFamily: 'monospace',
    });
    inspectOverlay.appendChild(inspectTooltip);
    document.body.appendChild(inspectOverlay);

    document.addEventListener('mousemove', onInspectMouseMove, true);
    document.addEventListener('click', onInspectClick, true);
    document.addEventListener('keydown', onInspectKeyDown, true);
  }

  function stopElementInspector() {
    isInspectMode = false;
    if (inspectTopBanner) inspectTopBanner.remove();
    if (inspectOverlay) inspectOverlay.remove();
    document.removeEventListener('mousemove', onInspectMouseMove, true);
    document.removeEventListener('click', onInspectClick, true);
    document.removeEventListener('keydown', onInspectKeyDown, true);
  }

  function onInspectMouseMove(e) {
    if (!isInspectMode) return;
    const target = e.target;
    if (!target || target.id?.startsWith('db-') || target.closest?.('#db-floating-root')) return;

    hoveredElement = target;
    const rect = target.getBoundingClientRect();

    inspectOverlay.style.display = 'block';
    inspectOverlay.style.top = `${rect.top}px`;
    inspectOverlay.style.left = `${rect.left}px`;
    inspectOverlay.style.width = `${rect.width}px`;
    inspectOverlay.style.height = `${rect.height}px`;

    const tag = target.tagName.toLowerCase();
    const className = typeof target.className === 'string' && target.className.trim() ? '.' + target.className.trim().split(/\s+/)[0] : '';
    inspectTooltip.textContent = `${tag}${className} (${Math.round(rect.width)}×${Math.round(rect.height)})`;
  }

  async function onInspectClick(e) {
    if (!isInspectMode) return;
    const target = e.target;
    if (!target || target.id?.startsWith('db-') || target.closest?.('#db-floating-root')) return;

    e.preventDefault();
    e.stopPropagation();

    const el = target;
    stopElementInspector();

    showToast('正在提取网页元素快照并推送到悬浮窗...', 'info');

    try {
      const rect = el.getBoundingClientRect();
      const computed = window.getComputedStyle(el);

      const cssRules = [
        `/* Captured Element: <${el.tagName.toLowerCase()}> */`,
        `width: ${Math.round(rect.width)}px;`,
        `height: ${Math.round(rect.height)}px;`,
        `background: ${computed.background};`,
        `color: ${computed.color};`,
        `border: ${computed.border};`,
        `border-radius: ${computed.borderRadius};`,
        `box-shadow: ${computed.boxShadow};`,
        `font-family: ${computed.fontFamily};`,
        `font-size: ${computed.fontSize};`,
        `display: ${computed.display};`,
      ].join('\n');

      let croppedBase64 = '';
      if (chrome?.runtime?.sendMessage) {
        try {
          const res = await new Promise((resolve) => {
            chrome.runtime.sendMessage({ action: 'capture-visible-tab' }, resolve);
          });
          if (res?.dataUrl) {
            croppedBase64 = await cropImage(res.dataUrl, rect);
          }
        } catch {}
      }

      const svgRaw = el.innerHTML.includes('<svg') ? el.innerHTML : '';

      // Direct post
      const payload = {
        source: 'web-element-inspector',
        meta: {
          name: `${document.title || '网页'} - <${el.tagName.toLowerCase()}>`,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          url: location.href,
        },
        image: { base64: croppedBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
        vector: { svgRaw: svgRaw },
        styles: { cssRaw: cssRules },
        userNotes: `元素点选：<${el.tagName.toLowerCase()} class="${el.className || ''}">`,
      };

      const res = await fetch(`${BRIDGE_URL}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`✅ 已推送 <${el.tagName.toLowerCase()}> 至设计待办池 [ID: ${data.shortId || data.id}]！`, 'success');
      } else {
        showToast(`推送失败: ${data.error || '未知错误'}`, 'error');
      }
    } catch (err) {
      showToast(`捕获异常: ${err.message}`, 'error');
    }
  }

  function onInspectKeyDown(e) {
    if (e.key === 'Escape') {
      stopElementInspector();
      showToast('已退出元素点选模式', 'info');
    }
  }

  function cropImage(dataUrl, rect) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const dpr = window.devicePixelRatio || 1;
        const canvas = document.createElement('canvas');
        const cropW = Math.max(1, rect.width * dpr);
        const cropH = Math.max(1, rect.height * dpr);
        canvas.width = cropW;
        canvas.height = cropH;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, rect.left * dpr, rect.top * dpr, cropW, cropH, 0, 0, cropW, cropH);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }

  // Handle messages from background worker
  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'start-inspect') {
        startElementInspector();
      } else if (msg.action === 'show-toast') {
        showToast(msg.message, msg.type || 'success');
      }
    });
  }

  // Bootstrapping
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initFloatingWindow();
  } else {
    window.addEventListener('DOMContentLoaded', initFloatingWindow);
  }
})();
