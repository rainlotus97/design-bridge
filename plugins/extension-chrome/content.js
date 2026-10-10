// Content Script for DesignBridge Chrome Extension
(function () {
  'use strict';

  if (window.__DESIGN_BRIDGE_INITIALIZED__) return;
  window.__DESIGN_BRIDGE_INITIALIZED__ = true;

  const BRIDGE_URL = 'http://127.0.0.1:23851';
  const isMasterGo = location.hostname.includes('mastergo.com');
  const isFigma = location.hostname.includes('figma.com');
  const isDesignApp = isMasterGo || isFigma;

  let autoPushOnCopy = true;
  let isInspectMode = false;
  let hoveredElement = null;
  let inspectOverlay = null;
  let inspectTooltip = null;
  let inspectTopBanner = null;

  // Retrieve stored auto-push preference
  if (chrome?.storage?.local) {
    chrome.storage.local.get(['autoPushOnCopy'], (res) => {
      if (typeof res.autoPushOnCopy === 'boolean') {
        autoPushOnCopy = res.autoPushOnCopy;
        updateFloatingDock();
      }
    });
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
  // 2. Trigger Privileged Clipboard Push via Background
  // ==========================================
  function triggerPush(sourceName = 'shortcut') {
    flashDockButton('正在读取并推送...', '#38BDF8');
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        action: 'trigger-clipboard-push',
        source: sourceName,
      });
    }
  }

  function flashDockButton(text, color) {
    const pushBtn = document.getElementById('db-btn-push');
    if (pushBtn) {
      const origText = pushBtn.innerHTML;
      pushBtn.innerHTML = text;
      pushBtn.style.color = color;
      setTimeout(() => {
        pushBtn.innerHTML = isDesignApp ? '⚡ 推送选中 (Alt+S)' : '⚡ 剪贴板直推 (Alt+S)';
        pushBtn.style.color = '#93C5FD';
      }, 1500);
    }
  }

  // ==========================================
  // 3. Capture-Phase Keydown Listener (Ctrl+C & Alt+S)
  // ==========================================
  window.addEventListener(
    'keydown',
    (e) => {
      // 1. Hotkey Alt+S or Alt+Q or Ctrl+Shift+S (Never use Alt+D to avoid Chrome address bar conflict)
      if (
        (e.altKey && (e.key === 's' || e.key === 'S' || e.key === 'q' || e.key === 'Q')) ||
        (e.ctrlKey && e.shiftKey && (e.key === 's' || e.key === 'S'))
      ) {
        e.preventDefault();
        e.stopPropagation();
        triggerPush('hotkey-alt-s');
        return;
      }

      // 2. Hotkey Alt+X for Element Inspector
      if (e.altKey && (e.key === 'x' || e.key === 'X')) {
        e.preventDefault();
        e.stopPropagation();
        startElementInspector();
        return;
      }

      // 3. In MasterGo/Figma: Intercept Ctrl+C / Ctrl+Shift+C in capture phase
      if (isDesignApp && (e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C')) {
        if (!autoPushOnCopy) return;
        // Wait 200ms for MasterGo internal copy routine to write to system clipboard
        setTimeout(() => {
          triggerPush('mastergo-auto-copy');
        }, 220);
      }
    },
    true // CAPTURE PHASE: Must run before MasterGo preventDefault!
  );

  // ==========================================
  // 4. Universal Web Element Inspector (Alt+X)
  // ==========================================
  function startElementInspector() {
    if (isInspectMode) return;
    isInspectMode = true;

    inspectTopBanner = document.createElement('div');
    inspectTopBanner.id = 'db-inspect-banner';
    inspectTopBanner.innerHTML = `
      <span>🎯</span>
      <span><strong>元素点选直推模式</strong>：鼠标悬浮预览元素，<strong>单击直接推送至 AI 待办池</strong></span>
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
    inspectOverlay.id = 'db-inspect-overlay';
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
    if (!target || target.id?.startsWith('db-') || target.closest?.('#db-floating-dock')) return;

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
    if (!target || target.id?.startsWith('db-') || target.closest?.('#db-floating-dock')) return;

    e.preventDefault();
    e.stopPropagation();

    const el = target;
    stopElementInspector();

    showToast('正在截取元素并推送...', 'info');

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
        `padding: ${computed.padding};`,
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

      if (!croppedBase64) {
        croppedBase64 = await renderElementToDataUrl(el, rect);
      }

      const svgRaw = el.innerHTML.includes('<svg') ? el.innerHTML : '';

      const payload = {
        source: 'web-element-inspector',
        meta: {
          name: `${document.title || '网页'} - <${el.tagName.toLowerCase()}>`,
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          url: location.href,
        },
        image: { base64: croppedBase64 },
        vector: { svgRaw: svgRaw },
        styles: { cssRaw: cssRules },
        userNotes: `网页元素点选捕获：<${el.tagName.toLowerCase()} class="${el.className || ''}">`,
      };

      const res = await fetch(`${BRIDGE_URL}/api/capture`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.success) {
        showToast(`✅ 已成功推送 <${el.tagName.toLowerCase()}> 至设计待办池 #${data.index}！`, 'success');
      } else {
        showToast(`推送失败: ${data.error || '未知错误'}`, 'error');
      }
    } catch (err) {
      showToast(`捕获失败: ${err.message}`, 'error');
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

  function renderElementToDataUrl(el, rect) {
    return new Promise((resolve) => {
      try {
        const clone = el.cloneNode(true);
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, rect.width);
        canvas.height = Math.max(1, rect.height);
        const ctx = canvas.getContext('2d');

        const xml = new XMLSerializer().serializeToString(clone);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
          <foreignObject width="100%" height="100%">
            <div xmlns="http://www.w3.org/1999/xhtml">${xml}</div>
          </foreignObject>
        </svg>`;

        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => {
          resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
        };
        img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      } catch {
        resolve('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==');
      }
    });
  }

  // ==========================================
  // 5. Floating Island Dock (醒目位置与快捷直推)
  // ==========================================
  function createFloatingDock() {
    if (document.getElementById('db-floating-dock')) return;

    const dock = document.createElement('div');
    dock.id = 'db-floating-dock';

    Object.assign(dock.style, {
      position: 'fixed',
      bottom: '36px',
      right: '48px',
      zIndex: '2147483640',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.16)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(56, 189, 248, 0.2)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '7px 14px',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      fontSize: '12px',
    });

    dock.innerHTML = `
      <div id="db-btn-logo" style="display: flex; align-items: center; gap: 4px; cursor: pointer; padding: 2px 4px;">
        <span style="font-size: 16px;">⚡</span>
        <span style="font-weight: 700; color: #38BDF8;">${isMasterGo ? 'MasterGo 桥梁' : 'DesignBridge'}</span>
      </div>

      <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.18);"></div>

      <button id="db-btn-push" title="一键推送到 AI 待办池 (快捷键: Alt+S 或 Ctrl+C)" style="
        background: rgba(59, 130, 246, 0.25);
        border: 1px solid rgba(59, 130, 246, 0.5);
        color: #93C5FD;
        padding: 5px 12px;
        border-radius: 14px;
        cursor: pointer;
        font-weight: 600;
        font-size: 12px;
        display: flex;
        align-items: center;
        gap: 4px;
      ">⚡ 推送选中 (Alt+S)</button>

      ${isDesignApp ? `
        <button id="db-btn-toggle-auto" title="切换复制即推" style="
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: ${autoPushOnCopy ? '#34D399' : '#94A3B8'};
          padding: 5px 10px;
          border-radius: 14px;
          cursor: pointer;
          font-size: 11px;
        ">📋 复制即推: ${autoPushOnCopy ? '🟢 开' : '⚪ 关'}</button>
      ` : `
        <button id="db-btn-inspect" title="开启元素点选直推 (Alt+X)" style="
          background: rgba(56, 189, 248, 0.2);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38BDF8;
          padding: 5px 10px;
          border-radius: 14px;
          cursor: pointer;
          font-weight: 600;
          font-size: 11px;
        ">🎯 选元素 (Alt+X)</button>
      `}

      <button id="db-btn-inbox" title="打开待办中心" style="
        background: transparent;
        border: none;
        color: #94A3B8;
        cursor: pointer;
        padding: 4px 6px;
        font-size: 15px;
      ">🌐</button>
    `;

    document.body.appendChild(dock);

    // Event Bindings
    dock.querySelector('#db-btn-logo').onclick = () => window.open(BRIDGE_URL, '_blank');
    dock.querySelector('#db-btn-inbox').onclick = () => window.open(BRIDGE_URL, '_blank');

    const pushBtn = dock.querySelector('#db-btn-push');
    if (pushBtn) {
      pushBtn.onclick = () => triggerPush('floating-button');
    }

    const toggleAutoBtn = dock.querySelector('#db-btn-toggle-auto');
    if (toggleAutoBtn) {
      toggleAutoBtn.onclick = () => {
        autoPushOnCopy = !autoPushOnCopy;
        if (chrome?.storage?.local) {
          chrome.storage.local.set({ autoPushOnCopy });
        }
        updateFloatingDock();
        showToast(autoPushOnCopy ? '已开启【复制即推】：在 MasterGo 中按 Ctrl+C 将自动推入待办池' : '已关闭【复制即推】', 'info');
      };
    }

    const inspectBtn = dock.querySelector('#db-btn-inspect');
    if (inspectBtn) {
      inspectBtn.onclick = () => startElementInspector();
    }
  }

  function updateFloatingDock() {
    const toggleAutoBtn = document.querySelector('#db-btn-toggle-auto');
    if (toggleAutoBtn) {
      toggleAutoBtn.style.color = autoPushOnCopy ? '#34D399' : '#94A3B8';
      toggleAutoBtn.textContent = `📋 复制即推: ${autoPushOnCopy ? '🟢 开' : '⚪ 关'}`;
    }
  }

  // Handle messages from background service worker
  if (chrome?.runtime?.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.action === 'start-inspect') {
        startElementInspector();
      } else if (msg.action === 'show-toast') {
        showToast(msg.message, msg.type || 'success');
      }
    });
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createFloatingDock();
  } else {
    window.addEventListener('DOMContentLoaded', createFloatingDock);
  }
})();
