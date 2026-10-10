// ==UserScript==
// @name         DesignBridge for MasterGo
// @namespace    https://github.com/design-bridge/adapter-mastergo
// @version      0.1.0
// @description  一键提取 MasterGo 选中图层 (PNG截图 + SVG矢量 + CSS标注) 发送至本地 AI (Antigravity/MCP)
// @author       DesignBridge
// @match        https://mastergo.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @connect      127.0.0.1
// @connect      localhost
// ==/UserScript==

(function () {
  'use strict';

  const BRIDGE_URL = 'http://127.0.0.1:23851/api/capture';

  // Create floating button
  function createFloatingButton() {
    const btn = document.createElement('div');
    btn.id = 'design-bridge-pill';
    btn.innerHTML = `
      <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
        <span style="font-size: 16px;">⚡</span>
        <span style="font-weight: 600; font-size: 13px;">发送到 AI</span>
      </div>
    `;

    Object.assign(btn.style, {
      position: 'fixed',
      bottom: '32px',
      right: '32px',
      zIndex: '999999',
      backgroundColor: '#1E293B',
      color: '#FFFFFF',
      padding: '8px 16px',
      borderRadius: '24px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      transition: 'all 0.2s ease',
      userSelect: 'none',
    });

    btn.addEventListener('mouseenter', () => {
      btn.style.transform = 'translateY(-2px)';
      btn.style.backgroundColor = '#334155';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translateY(0)';
      btn.style.backgroundColor = '#1E293B';
    });

    btn.addEventListener('click', openCaptureModal);
    document.body.appendChild(btn);
  }

  // Create Modal Drawer
  function openCaptureModal() {
    const existing = document.getElementById('design-bridge-modal');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'design-bridge-modal';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '1000000',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    });

    const card = document.createElement('div');
    Object.assign(card.style, {
      width: '460px',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      padding: '24px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    });

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h3 style="margin: 0; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
          <span>⚡</span> 发送至 AI 编程助手
        </h3>
        <button id="db-close-btn" style="background: none; border: none; color: #94A3B8; cursor: pointer; font-size: 18px;">✕</button>
      </div>

      <div style="font-size: 13px; color: #94A3B8; line-height: 1.5;">
        若已在 MasterGo 中右键复制了 SVG，可直接粘贴在下方；或粘贴截图图片。
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label style="font-size: 12px; color: #CBD5E1; font-weight: 500;">用户个性化需求 / 补充规则 (可选)：</label>
        <input id="db-user-notes" placeholder="例如：采用 Vue 3 + Tailwind 实现、指标为动态插槽..." style="
          background: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          outline: none;
        " />
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label style="font-size: 12px; color: #CBD5E1; font-weight: 500;">SVG 代码 (可选，用于精确色值/滤镜/边距抽取)：</label>
        <textarea id="db-svg-input" placeholder="贴入 MasterGo 复制出的 SVG 文本 (Ctrl + V)..." rows="3" style="
          background: #1E293B;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #FFFFFF;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-family: monospace;
          resize: vertical;
          outline: none;
        "></textarea>
      </div>

      <div style="display: flex; flex-direction: column; gap: 6px;">
        <label style="font-size: 12px; color: #CBD5E1; font-weight: 500;">粘贴图片截图 (可在任意位置 Ctrl+V 或点击下方上传)：</label>
        <div id="db-paste-box" style="
          border: 1px dashed rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          color: #94A3B8;
          font-size: 12px;
          background: rgba(255, 255, 255, 0.02);
          cursor: pointer;
        ">
          📸 点击此处或按 Ctrl+V 粘贴截图
        </div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px;">
        <button id="db-cancel-btn" style="
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: #CBD5E1;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
        ">取消</button>
        <button id="db-submit-btn" style="
          background: #2563EB;
          border: none;
          color: #FFFFFF;
          padding: 8px 20px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
        ">确认发送给 AI</button>
      </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    let capturedBase64 = '';

    // Handle Paste events
    const pasteBox = card.querySelector('#db-paste-box');
    const handlePaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const blob = item.getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              capturedBase64 = evt.target.result;
              pasteBox.innerHTML = `✅ 已成功载入截图 (${Math.round(blob.size / 1024)} KB)`;
              pasteBox.style.borderColor = '#10B981';
              pasteBox.style.color = '#10B981';
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };
    overlay.addEventListener('paste', handlePaste);

    // Close actions
    card.querySelector('#db-close-btn').onclick = () => overlay.remove();
    card.querySelector('#db-cancel-btn').onclick = () => overlay.remove();

    // Submit Action
    card.querySelector('#db-submit-btn').onclick = () => {
      const svgText = card.querySelector('#db-svg-input').value.trim();
      const userNotes = card.querySelector('#db-user-notes').value.trim();

      // If no image pasted, create a fallback placeholder or prompt
      if (!capturedBase64 && !svgText) {
        alert('请至少粘贴截图或输入 SVG 代码！');
        return;
      }

      // Default 1x1 transparent png if image is omitted but svg is provided
      const finalImageBase64 = capturedBase64 || 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const payload = {
        source: 'mastergo',
        timestamp: Date.now(),
        meta: {
          name: document.title || 'MasterGo Layer',
          url: window.location.href,
        },
        image: {
          base64: finalImageBase64,
          mimeType: 'image/png',
        },
        vector: {
          svgRaw: svgText,
        },
        userNotes: userNotes,
      };

      const btn = card.querySelector('#db-submit-btn');
      btn.innerText = '发送中...';
      btn.disabled = true;

      fetch(BRIDGE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            overlay.remove();
            showToast('✅ 成功推送到本地 AI 桥梁！AI 对话端可直接读取。');
          } else {
            alert('推送失败: ' + (data.error || '未知错误'));
            btn.innerText = '确认发送给 AI';
            btn.disabled = false;
          }
        })
        .catch((err) => {
          alert('无法连接到本地桥梁服务 (127.0.0.1:23851)，请确保 MCP 服务已启动！\n\n错误信息: ' + err.message);
          btn.innerText = '确认发送给 AI';
          btn.disabled = false;
        });
    };
  }

  function showToast(msg) {
    const toast = document.createElement('div');
    toast.innerText = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#059669',
      color: '#FFFFFF',
      padding: '10px 20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
      zIndex: '1000001',
      fontSize: '13px',
      fontWeight: '500',
    });
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  }

  // Initialize
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    createFloatingButton();
  } else {
    window.addEventListener('DOMContentLoaded', createFloatingButton);
  }
})();
