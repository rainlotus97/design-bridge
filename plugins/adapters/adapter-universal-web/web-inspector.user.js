// ==UserScript==
// @name         DesignBridge 通用网页元素点选直推
// @namespace    https://github.com/design-bridge/adapter-universal-web
// @version      1.1.0
// @description  在任意网页上按 Alt+X 开启元素点选，点击卡片/按钮即可提取高保真截图与 CSS 样式直推至本地 AI 待办池
// @author       DesignBridge
// @match        *://*/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

(function () {
  'use strict';

  const BRIDGE_URL = 'http://127.0.0.1:23851/api/capture';
  let isInspectMode = false;
  let hoveredElement = null;
  let inspectOverlay = null;
  let inspectTooltip = null;
  let inspectTopBanner = null;

  function showToast(msg, type = 'success') {
    let container = document.getElementById('db-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'db-toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
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
      <span style="font-size: 15px;">${isError ? '❌' : isInfo ? 'ℹ️' : '⚡'}</span>
      <span style="font-size: 13px; font-weight: 600; line-height: 1.4;">${msg}</span>
    `;

    Object.assign(toast.style, {
      pointerEvents: 'auto',
      backgroundColor: isError ? 'rgba(239, 68, 68, 0.95)' : isInfo ? 'rgba(30, 41, 59, 0.95)' : 'rgba(16, 185, 129, 0.95)',
      color: '#FFFFFF',
      padding: '10px 16px',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      maxWidth: '380px',
      transition: 'all 0.25s ease',
      transform: 'translateY(0)',
      opacity: '1',
    });

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-8px)';
      setTimeout(() => toast.remove(), 250);
    }, 3200);
  }

  function startInspector() {
    if (isInspectMode) return;
    isInspectMode = true;

    inspectTopBanner = document.createElement('div');
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
      padding: '8px 16px',
      fontSize: '12px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
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
      top: '-24px',
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

    document.addEventListener('mousemove', onMouseMove, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('keydown', onKeyDown, true);
  }

  function stopInspector() {
    isInspectMode = false;
    if (inspectTopBanner) inspectTopBanner.remove();
    if (inspectOverlay) inspectOverlay.remove();
    document.removeEventListener('mousemove', onMouseMove, true);
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('keydown', onKeyDown, true);
  }

  function onMouseMove(e) {
    if (!isInspectMode) return;
    const target = e.target;
    if (!target || target.id?.startsWith('db-')) return;

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

  async function onClick(e) {
    if (!isInspectMode) return;
    const target = e.target;
    if (!target || target.id?.startsWith('db-')) return;

    e.preventDefault();
    e.stopPropagation();

    const el = target;
    stopInspector();

    showToast('正在提取网页元素快照与样式...', 'info');

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

      const clone = el.cloneNode(true);
      const xml = new XMLSerializer().serializeToString(clone);
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}">
        <foreignObject width="100%" height="100%">
          <div xmlns="http://www.w3.org/1999/xhtml">
            ${xml}
          </div>
        </foreignObject>
      </svg>`;

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, rect.width);
      canvas.height = Math.max(1, rect.height);
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        sendPayload(base64, el, rect, cssRules);
      };
      img.onerror = () => {
        sendPayload('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', el, rect, cssRules);
      };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    } catch (err) {
      showToast(`提取失败: ${err.message}`, 'error');
    }
  }

  function sendPayload(base64, el, rect, cssRules) {
    const payload = {
      source: 'web-inspector',
      meta: {
        name: `${document.title || '网页'} - <${el.tagName.toLowerCase()}>`,
        width: Math.round(rect.width),
        height: Math.round(rect.height),
        url: location.href,
      },
      image: { base64: base64 },
      vector: { svgRaw: el.innerHTML.includes('<svg') ? el.innerHTML : '' },
      styles: { cssRaw: cssRules },
      userNotes: `网页元素点选捕获：<${el.tagName.toLowerCase()} class="${el.className || ''}">`,
    };

    if (typeof GM_xmlhttpRequest !== 'undefined') {
      GM_xmlhttpRequest({
        method: 'POST',
        url: BRIDGE_URL,
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify(payload),
        onload: (res) => {
          try {
            const data = JSON.parse(res.responseText);
            if (data.success) {
              showToast(`✅ 已推送 <${el.tagName.toLowerCase()}> 至设计待办池 #${data.index}！`, 'success');
            } else {
              showToast(`推送失败: ${data.error}`, 'error');
            }
          } catch {
            showToast('响应解析异常', 'error');
          }
        },
        onerror: (err) => showToast(`连接本地服务失败: ${err}`, 'error'),
      });
    } else {
      fetch(BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          showToast(`✅ 已推送 <${el.tagName.toLowerCase()}> 至设计待办池 #${d.index}！`, 'success');
        } else {
          showToast(`推送失败: ${d.error}`, 'error');
        }
      });
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') {
      stopInspector();
      showToast('已退出元素点选模式', 'info');
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'x' || e.key === 'X')) {
      e.preventDefault();
      startInspector();
    }
  });
})();
