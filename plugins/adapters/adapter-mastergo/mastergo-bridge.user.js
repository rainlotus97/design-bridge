// ==UserScript==
// @name         DesignBridge for MasterGo (选中即推专属版)
// @namespace    https://github.com/design-bridge/adapter-mastergo
// @version      1.1.0
// @description  在 MasterGo 中选中图层按 Ctrl+C 即可全自动推送至本地 AI (Antigravity/MCP) 待办池
// @author       DesignBridge
// @match        https://mastergo.com/*
// @match        https://*.mastergo.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

(function () {
  'use strict';

  const BRIDGE_URL = 'http://127.0.0.1:23851/api/capture';
  let autoPushOnCopy = true;

  // Custom Dark Toast
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

  // Push Clipboard to Local Server
  async function pushFromClipboard() {
    try {
      const clipboardItems = await navigator.clipboard.read();
      let imageBase64 = '';
      let svgText = '';

      for (const item of clipboardItems) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            imageBase64 = await blobToBase64(blob);
          } else if (type === 'text/html' || type === 'image/svg+xml') {
            const blob = await item.getType(type);
            const text = await blob.text();
            if (text.includes('<svg') || type === 'image/svg+xml') {
              svgText = text;
            }
          } else if (type === 'text/plain') {
            const blob = await item.getType(type);
            const text = await blob.text();
            if (text.trim().startsWith('<svg')) {
              svgText = text.trim();
            }
          }
        }
      }

      if (!imageBase64 && !svgText) {
        showToast('⚠️ 未检测到图层！请右键图层点击【复制为 PNG】(Ctrl+Shift+C) 或【复制为 SVG】', 'error');
        return;
      }

      const payload = {
        source: 'mastergo-userscript',
        meta: {
          name: document.title || 'MasterGo Layer',
          url: location.href,
        },
        image: { base64: imageBase64 || '' },
        vector: { svgRaw: svgText },
        userNotes: '',
      };

      if (typeof GM_xmlhttpRequest !== 'undefined') {
        GM_xmlhttpRequest({
          method: 'POST',
          url: BRIDGE_URL,
          headers: { 'Content-Type': 'application/json' },
          data: JSON.stringify(payload),
          onload: (response) => {
            try {
              const data = JSON.parse(response.responseText);
              if (data.success) {
                showToast(`⚡ 已成功推入设计待办池 #${data.index}！`, 'success');
              } else {
                showToast(`推送失败: ${data.error || '未知错误'}`, 'error');
              }
            } catch {
              showToast('解析服务响应异常', 'error');
            }
          },
          onerror: (err) => {
            showToast(`连接本地服务失败 (23851): ${err}`, 'error');
          }
        });
      } else {
        const res = await fetch(BRIDGE_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.success) {
          showToast(`⚡ 已成功推入设计待办池 #${data.index}！`, 'success');
        } else {
          showToast(`推送失败: ${data.error || '未知错误'}`, 'error');
        }
      }
    } catch (err) {
      showToast(`读取剪贴板异常: ${err.message}`, 'error');
    }
  }

  function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Auto-push on Copy listener (Ctrl+C in MasterGo)
  window.addEventListener('copy', () => {
    if (!autoPushOnCopy) return;
    setTimeout(() => {
      pushFromClipboard();
    }, 150);
  });

  // Hotkey Alt+D
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      pushFromClipboard();
    }
  });

  // Floating Island Dock
  function createFloatingDock() {
    if (document.getElementById('db-floating-dock')) return;

    const dock = document.createElement('div');
    dock.id = 'db-floating-dock';

    Object.assign(dock.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '2147483640',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '6px 14px',
      transition: 'all 0.2s ease',
      userSelect: 'none',
      fontSize: '12px',
    });

    dock.innerHTML = `
      <div id="db-btn-logo" style="display: flex; align-items: center; gap: 4px; cursor: pointer;">
        <span style="font-size: 16px;">⚡</span>
        <span style="font-weight: 700; color: #38BDF8;">MasterGo 桥梁</span>
      </div>

      <div style="width: 1px; height: 16px; background: rgba(255,255,255,0.15);"></div>

      <button id="db-btn-push" title="立即读取剪贴板推送到待办池 (Alt+D)" style="
        background: rgba(59, 130, 246, 0.2);
        border: 1px solid rgba(59, 130, 246, 0.4);
        color: #93C5FD;
        padding: 4px 10px;
        border-radius: 12px;
        cursor: pointer;
        font-weight: 600;
        font-size: 11px;
      ">⚡ 推送选中 (Alt+D)</button>

      <button id="db-btn-toggle" title="切换复制即推" style="
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #34D399;
        padding: 4px 8px;
        border-radius: 12px;
        cursor: pointer;
        font-size: 11px;
      ">📋 复制即推: 🟢 开</button>

      <button id="db-btn-inbox" title="打开待办中心" style="
        background: transparent;
        border: none;
        color: #94A3B8;
        cursor: pointer;
        padding: 4px;
        font-size: 14px;
      ">🌐</button>
    `;

    document.body.appendChild(dock);

    dock.querySelector('#db-btn-logo').onclick = () => window.open('http://127.0.0.1:23851/', '_blank');
    dock.querySelector('#db-btn-inbox').onclick = () => window.open('http://127.0.0.1:23851/', '_blank');
    dock.querySelector('#db-btn-push').onclick = () => pushFromClipboard();

    const toggleBtn = dock.querySelector('#db-btn-toggle');
    toggleBtn.onclick = () => {
      autoPushOnCopy = !autoPushOnCopy;
      toggleBtn.style.color = autoPushOnCopy ? '#34D399' : '#94A3B8';
      toggleBtn.textContent = `📋 复制即推: ${autoPushOnCopy ? '🟢 开' : '⚪ 关'}`;
      showToast(autoPushOnCopy ? '已开启【复制即推】：在 MasterGo 中按 Ctrl+C 将自动推入待办池' : '已关闭【复制即推】', 'info');
    };
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createFloatingDock();
  } else {
    window.addEventListener('DOMContentLoaded', createFloatingDock);
  }
})();
