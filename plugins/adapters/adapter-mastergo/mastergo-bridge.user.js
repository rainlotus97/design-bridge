// ==UserScript==
// @name         DesignBridge 通用网页设计悬浮窗 (支持 MasterGo / Figma / 任意页面)
// @namespace    https://github.com/design-bridge/adapter-mastergo
// @version      2.0.0
// @description  任意设计页面悬浮窗：支持随意关闭与再次打开、直接贴入 PNG 图片、SVG 矢量代码与 CSS 样式直推本地 AI 待办池
// @author       DesignBridge
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

(function () {
  'use strict';

  if (window.__DB_USERSCRIPT_LOADED__) return;
  window.__DB_USERSCRIPT_LOADED__ = true;

  const BRIDGE_URL = 'http://127.0.0.1:23851/api/capture';

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

  // Toast Notification
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

  function makeDraggable(element, handle) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    handle.onmousedown = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = () => { document.onmouseup = null; document.onmousemove = null; };
      document.onmousemove = (evt) => {
        evt.preventDefault();
        pos1 = pos3 - evt.clientX;
        pos2 = pos4 - evt.clientY;
        pos3 = evt.clientX;
        pos4 = evt.clientY;
        element.style.top = `${Math.max(10, Math.min(window.innerHeight - 80, element.offsetTop - pos2))}px`;
        element.style.left = `${Math.max(10, Math.min(window.innerWidth - 300, element.offsetLeft - pos1))}px`;
        element.style.bottom = 'auto';
        element.style.right = 'auto';
      };
    };
  }

  function initFloatingWindow() {
    if (document.getElementById('db-userscript-root')) return;

    const root = document.createElement('div');
    root.id = 'db-userscript-root';

    // Minimized Floating Pill
    const trigger = document.createElement('div');
    trigger.id = 'db-floating-trigger';
    trigger.innerHTML = `<span style="font-size: 15px;">⚡</span><span style="font-weight: 700;">AI 设计待办</span>`;
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
      display: 'none',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      cursor: 'pointer',
      userSelect: 'none',
      fontSize: '13px',
    });
    trigger.onclick = () => {
      panel.style.display = 'flex';
      trigger.style.display = 'none';
    };

    // Full Floating Panel
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
      <div id="db-panel-header" style="
        display: flex; justify-content: space-between; align-items: center;
        background: #151D2F; padding: 12px 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.08); cursor: move;
      ">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">⚡</span>
          <span style="font-weight: 700; color: #38BDF8; font-size: 14px;">DesignBridge 待办悬浮窗</span>
          <span id="db-id-badge" style="font-size: 11px; font-family: monospace; background: rgba(59, 130, 246, 0.2); color: #93C5FD; padding: 2px 6px; border-radius: 4px;">🆔 ${currentShortId}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <button id="db-btn-dashboard" title="打开待办中心" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 4px; font-size: 14px;">🌐</button>
          <button id="db-btn-close" title="关闭悬浮窗" style="background: transparent; border: none; color: #94A3B8; cursor: pointer; padding: 4px 6px; font-size: 14px; font-weight: bold;">✕</button>
        </div>
      </div>

      <div id="db-panel-body" style="padding: 16px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; max-height: calc(88vh - 120px);">
        <!-- Dropzone -->
        <div id="db-dropzone" style="
          border: 2px dashed rgba(56, 189, 248, 0.35); background: rgba(56, 189, 248, 0.04);
          border-radius: 12px; padding: 14px; display: flex; flex-direction: column; align-items: center; gap: 6px; text-align: center; cursor: pointer;
        ">
          <div style="font-size: 20px;">📋</div>
          <div style="font-weight: 600; color: #F1F5F9; font-size: 13px;">直接在此按下 Ctrl+V 粘贴</div>
          <div style="font-size: 11px; color: #94A3B8;">自动解析 PNG 截图、SVG 矢量代码或 CSS 样式</div>
          <button id="db-btn-paste-clip" style="
            margin-top: 4px; background: rgba(59, 130, 246, 0.2); border: 1px solid rgba(59, 130, 246, 0.4);
            color: #93C5FD; padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;
          ">📋 读取剪贴板自动贴入</button>
        </div>

        <!-- PNG Slot -->
        <div style="background: #151D2F; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 12px; color: #E2E8F0;">🖼️ PNG 截图预览：</span>
            <button id="db-btn-clear-img" style="background: transparent; border: none; color: #F87171; font-size: 11px; cursor: pointer; display: none;">🗑️ 清除</button>
          </div>
          <div id="db-img-container" style="min-height: 50px; max-height: 160px; background: #0B0F19; border-radius: 6px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
            <span id="db-img-empty" style="color: #64748B; font-size: 12px;">暂无图片（在 MasterGo 右键复制 PNG 后按 Ctrl+V）</span>
            <img id="db-img-preview" style="max-width: 100%; max-height: 160px; object-fit: contain; display: none;" alt="Preview" />
          </div>
          <div id="db-img-meta" style="font-size: 11px; color: #94A3B8; display: none;"></div>
        </div>

        <!-- SVG Slot -->
        <div style="background: #151D2F; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 12px; color: #E2E8F0;">📐 SVG 矢量代码与渲染：</span>
            <button id="db-btn-clear-svg" style="background: transparent; border: none; color: #F87171; font-size: 11px; cursor: pointer; display: none;">🗑️ 清除</button>
          </div>
          <div id="db-svg-render-box" style="min-height: 40px; max-height: 100px; background: #0B0F19; border-radius: 6px; display: flex; align-items: center; justify-content: center; padding: 8px; overflow: hidden;">
            <span id="db-svg-empty" style="color: #64748B; font-size: 12px;">暂无 SVG 矢量</span>
            <div id="db-svg-preview" style="display: none; max-width: 100%; max-height: 90px;"></div>
          </div>
          <textarea id="db-textarea-svg" rows="2" placeholder="在此粘贴 SVG 代码，或按 Ctrl+V..." style="
            width: 100%; background: #0B0F19; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
            color: #93C5FD; font-family: monospace; font-size: 11px; padding: 6px 8px; resize: vertical; box-sizing: border-box; outline: none;
          "></textarea>
        </div>

        <!-- CSS Slot -->
        <div style="background: #151D2F; border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-weight: 600; font-size: 12px; color: #E2E8F0;">🎨 CSS 样式代码：</span>
            <button id="db-btn-clear-css" style="background: transparent; border: none; color: #F87171; font-size: 11px; cursor: pointer; display: none;">🗑️ 清除</button>
          </div>
          <textarea id="db-textarea-css" rows="3" placeholder="在此粘贴 CSS 代码（例如：background, border-radius...）" style="
            width: 100%; background: #0B0F19; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
            color: #A7F3D0; font-family: monospace; font-size: 11px; padding: 6px 8px; resize: vertical; box-sizing: border-box; outline: none;
          "></textarea>
        </div>

        <!-- Inputs -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #CBD5E1; margin-bottom: 4px; display: block;">🏷️ 设计标题：</label>
            <input id="db-input-name" type="text" placeholder="例如：船舶监控卡片..." style="
              width: 100%; background: #151D2F; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
              color: #F8FAFC; padding: 7px 10px; font-size: 12px; box-sizing: border-box; outline: none;
            " />
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #CBD5E1; margin-bottom: 4px; display: block;">📝 需求备注：</label>
            <textarea id="db-input-notes" rows="2" placeholder="例如：用 Tailwind 实现，支持暗色主题..." style="
              width: 100%; background: #151D2F; border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
              color: #F8FAFC; padding: 7px 10px; font-size: 12px; box-sizing: border-box; resize: vertical; outline: none;
            "></textarea>
          </div>
        </div>
      </div>

      <div style="background: #151D2F; padding: 12px 16px; border-top: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center; gap: 8px;">
        <button id="db-btn-reset" title="清空" style="background: transparent; border: 1px solid rgba(255,255,255,0.12); color: #94A3B8; padding: 8px 12px; border-radius: 8px; font-size: 12px; cursor: pointer;">🧹 清空</button>
        <button id="db-btn-submit" style="flex: 1; background: #3B82F6; color: #FFF; border: none; padding: 8px 16px; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px;">
          <span>🚀</span> 推送到本地 AI 待办池
        </button>
      </div>
    `;

    root.appendChild(trigger);
    root.appendChild(panel);
    document.body.appendChild(root);

    makeDraggable(panel, panel.querySelector('#db-panel-header'));

    const imgPreview = panel.querySelector('#db-img-preview');
    const imgEmpty = panel.querySelector('#db-img-empty');
    const imgMeta = panel.querySelector('#db-img-meta');
    const clearImgBtn = panel.querySelector('#db-btn-clear-img');
    const svgPreview = panel.querySelector('#db-svg-preview');
    const svgEmpty = panel.querySelector('#db-svg-empty');
    const clearSvgBtn = panel.querySelector('#db-btn-clear-svg');
    const textareaSvg = panel.querySelector('#db-textarea-svg');
    const textareaCss = panel.querySelector('#db-textarea-css');
    const clearCssBtn = panel.querySelector('#db-btn-clear-css');
    const inputName = panel.querySelector('#db-input-name');
    const inputNotes = panel.querySelector('#db-input-notes');
    const idBadge = panel.querySelector('#db-id-badge');
    const submitBtn = panel.querySelector('#db-btn-submit');
    const resetBtn = panel.querySelector('#db-btn-reset');
    const closeBtn = panel.querySelector('#db-btn-close');
    const dashboardBtn = panel.querySelector('#db-btn-dashboard');
    const pasteClipBtn = panel.querySelector('#db-btn-paste-clip');

    inputName.value = (document.title || '').replace(/[-_].*$/, '').trim() || '图层设计';

    closeBtn.onclick = () => {
      panel.style.display = 'none';
      trigger.style.display = 'flex';
      showToast('悬浮窗已收起至右下角，点击【⚡ AI 设计待办】可随时再次打开', 'info');
    };

    dashboardBtn.onclick = () => window.open('http://127.0.0.1:23851', '_blank');

    function updateImageUI(base64, info = '') {
      currentImageBase64 = base64;
      if (base64) {
        imgPreview.src = base64;
        imgPreview.style.display = 'block';
        imgEmpty.style.display = 'none';
        clearImgBtn.style.display = 'inline-block';
        imgMeta.style.display = 'block';
        imgMeta.textContent = info || '已载入图片';
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
      showToast('已清空', 'info');
    };

    // Paste handling
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
              showToast('已载入图片！', 'success');
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

    pasteClipBtn.onclick = async () => {
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
        showToast('请直接在输入框按 Ctrl+V 粘贴', 'info');
      }
    };

    submitBtn.onclick = () => {
      if (!currentImageBase64 && !currentSvgRaw && !currentCssRaw) {
        showToast('请至少粘贴一张设计截图、SVG 矢量或 CSS 样式！', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>⏳</span> 正在推送...';

      const payload = {
        source: 'userscript-floating',
        meta: { name: inputName.value.trim() || '设计图层', url: location.href },
        image: { base64: currentImageBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==' },
        vector: { svgRaw: currentSvgRaw },
        styles: { cssRaw: currentCssRaw },
        userNotes: inputNotes.value.trim(),
      };

      const sendFn = typeof GM_xmlhttpRequest !== 'undefined' ? (cb) => {
        GM_xmlhttpRequest({
          method: 'POST',
          url: BRIDGE_URL,
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify(payload),
          onload: (r) => cb(JSON.parse(r.responseText)),
          onerror: (e) => showToast(`请求失败: ${e}`, 'error')
        });
      } : (cb) => {
        fetch(BRIDGE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).then(r => r.json()).then(cb);
      };

      sendFn((data) => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>🚀</span> 推送到本地 AI 待办池';
        if (data.success) {
          const id = data.shortId || data.id || currentShortId;
          showToast(`🎉 成功推入待办池 [ID: ${id}]！可在 AI 聊天中输入：帮我实现设计 ${id}`, 'success');
          updateImageUI('');
          updateSvgUI('');
          updateCssUI('');
          inputNotes.value = '';
          currentShortId = generateGitStyleId();
          idBadge.textContent = `🆔 ${currentShortId}`;
        } else {
          showToast(`推送失败: ${data.error}`, 'error');
        }
      });
    };
  }

  // Hotkey toggle
  window.addEventListener('keydown', (e) => {
    if (
      (e.altKey && (e.key === 's' || e.key === 'S' || e.key === 'q' || e.key === 'Q')) ||
      (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S'))
    ) {
      e.preventDefault();
      const p = document.getElementById('db-floating-panel');
      const t = document.getElementById('db-floating-trigger');
      if (p && t) {
        if (p.style.display === 'none') {
          p.style.display = 'flex';
          t.style.display = 'none';
        } else {
          p.style.display = 'none';
          t.style.display = 'flex';
        }
      }
    }
  }, true);

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initFloatingWindow();
  } else {
    window.addEventListener('DOMContentLoaded', initFloatingWindow);
  }
})();
